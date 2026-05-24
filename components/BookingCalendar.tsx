"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  format,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInDays,
  addMonths,
  subMonths,
  isSameDay,
  getDay,
} from "date-fns";
import { it } from "date-fns/locale";

export interface CalendarBooking {
  id: string;
  clientFirstName: string;
  clientLastName?: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  status: "in_trattativa" | "bloccato" | "prenotato" | "finalizzato" | "cancellato";
  collaborator?: { nickname: string } | null;
}

export interface MonthlyRate {
  price: number;
  cleaningFee: number;
}

interface BookingCalendarProps {
  roomId: string | null;
  onRangeSelect?: (checkIn: Date, checkOut: Date, nights: number, rate: MonthlyRate | null) => void;
  onBookingMoved?: () => void;
}

const WEEKDAYS = ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"];

const STATUS_BG: Record<string, string> = {
  in_trattativa: "bg-[#B8950A] text-[#FFF8E0]",
  bloccato: "bg-[#2C4A7B] text-white",
  prenotato: "bg-[#7B2020] text-white",
  finalizzato: "bg-[#1A5C3A] text-white",
};

function parseDate(str: string): Date {
  const s = str.slice(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// --- EmptyDropDay ---
function EmptyDropDay({
  dateStr,
  day,
  isSelected,
  isInRange,
  isDragging,
  onClick,
}: {
  dateStr: string;
  day: Date;
  isSelected: boolean;
  isInRange: boolean;
  isDragging: boolean;
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dateStr, disabled: !isDragging });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={[
        "relative h-16 rounded-lg text-sm flex flex-col items-center justify-start pt-1.5 cursor-pointer transition-all select-none",
        isOver && isDragging
          ? "bg-[#C9A75F]/40 border-2 border-dashed border-[#C9A75F]"
          : isSelected
          ? "bg-[#C9A75F] text-[#070A0D] font-bold"
          : isInRange
          ? "bg-[#C9A75F]/20 text-[#F4F0E6]"
          : "bg-[#1A2030] hover:bg-[#2A3040] text-[#F4F0E6]",
      ].join(" ")}
    >
      <span className="font-semibold">{format(day, "d")}</span>
    </div>
  );
}

// --- BookingDay ---
function BookingDay({
  dateStr,
  day,
  booking,
  showLabel,
  isActivelyDragged,
}: {
  dateStr: string;
  day: Date;
  booking: CalendarBooking;
  showLabel: boolean;
  isActivelyDragged: boolean;
}) {
  const canDrag =
    booking.status !== "finalizzato" && booking.status !== "cancellato";

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `drag-${booking.id}-${dateStr}`,
    data: {
      bookingId: booking.id,
      dragDay: dateStr,
      checkIn: booking.checkIn,
      nights: booking.nights,
    },
    disabled: !canDrag,
  });

  const label = booking.collaborator?.nickname ?? booking.clientFirstName;

  return (
    <div
      ref={setNodeRef}
      {...(canDrag ? { ...attributes, ...listeners } : {})}
      title={canDrag ? "Trascina per spostare la prenotazione" : undefined}
      className={[
        "relative h-16 rounded-lg flex flex-col items-center justify-start pt-1.5 select-none transition-all",
        STATUS_BG[booking.status] ?? "bg-gray-700 text-white",
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        isDragging || isActivelyDragged ? "opacity-40" : "opacity-100",
      ].join(" ")}
    >
      <span className="font-bold text-sm leading-none">{format(day, "d")}</span>
      {showLabel && (
        <span className="mt-0.5 px-1 text-[10px] truncate max-w-full leading-tight font-medium">
          {label}
        </span>
      )}
    </div>
  );
}

// --- Main Calendar ---
export function BookingCalendar({
  roomId,
  onRangeSelect,
  onBookingMoved,
}: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [monthlyRate, setMonthlyRate] = useState<MonthlyRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectStart, setSelectStart] = useState<Date | null>(null);
  const [selectEnd, setSelectEnd] = useState<Date | null>(null);
  const [activeBooking, setActiveBooking] = useState<CalendarBooking | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    if (!roomId) {
      setBookings([]);
      setMonthlyRate(null);
      setSelectStart(null);
      setSelectEnd(null);
      return;
    }
    setLoading(true);
    fetch(`/api/rooms/${roomId}/bookings?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        setBookings(data.bookings ?? []);
        setMonthlyRate(data.monthlyRate ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomId, year, month]);

  // Map: dateStr → booking
  const dayMap = useMemo(() => {
    const map = new Map<string, CalendarBooking>();
    for (const b of bookings) {
      if (b.status === "cancellato") continue;
      let cur = parseDate(b.checkIn);
      const end = parseDate(b.checkOut);
      while (cur < end) {
        map.set(format(cur, "yyyy-MM-dd"), b);
        cur = addDays(cur, 1);
      }
    }
    return map;
  }, [bookings]);

  // Calendar grid
  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const startOffset = (getDay(firstDay) + 6) % 7;
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  // Selection range (normalized: start <= end)
  const [rangeStart, rangeEnd] = useMemo(() => {
    if (!selectStart) return [null, null];
    if (!selectEnd) return [selectStart, null];
    return selectStart <= selectEnd
      ? [selectStart, selectEnd]
      : [selectEnd, selectStart];
  }, [selectStart, selectEnd]);

  const isSelected = (d: Date) =>
    (rangeStart && isSameDay(d, rangeStart)) ||
    (rangeEnd && isSameDay(d, rangeEnd)) ||
    false;

  const isInRange = (d: Date) =>
    !!(rangeStart && rangeEnd && d > rangeStart && d < rangeEnd);

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    if (dayMap.has(dateStr)) return;

    if (!selectStart || selectEnd) {
      setSelectStart(day);
      setSelectEnd(null);
      return;
    }

    const [checkIn, checkOut] =
      day < selectStart ? [day, selectStart] : [selectStart, day];

    // Validate no occupied days in range
    let cur = new Date(checkIn);
    while (cur < checkOut) {
      if (dayMap.has(format(cur, "yyyy-MM-dd"))) {
        setSelectStart(day);
        setSelectEnd(null);
        return;
      }
      cur = addDays(cur, 1);
    }

    setSelectEnd(day);
    const nights = differenceInDays(checkOut, checkIn);
    onRangeSelect?.(checkIn, checkOut, nights, monthlyRate);
  };

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback(
    (e: DragStartEvent) => {
      const { bookingId } = e.active.data.current as { bookingId: string };
      setActiveBooking(bookings.find((b) => b.id === bookingId) ?? null);
    },
    [bookings]
  );

  const handleDragEnd = useCallback(
    async (e: DragEndEvent) => {
      const booking = activeBooking;
      setActiveBooking(null);
      if (!e.over || !booking || !e.active.data.current) return;

      const { dragDay, checkIn, nights } = e.active.data.current as {
        dragDay: string;
        checkIn: string;
        nights: number;
      };

      const offset = differenceInDays(parseDate(dragDay), parseDate(checkIn));
      const dropped = parseDate(e.over.id as string);
      const newCheckIn = subDays(dropped, offset);
      const newCheckOut = addDays(newCheckIn, nights);
      const newCheckInStr = format(newCheckIn, "yyyy-MM-dd");
      const newCheckOutStr = format(newCheckOut, "yyyy-MM-dd");

      // Front-end overlap check
      let cur = new Date(newCheckIn);
      while (cur < newCheckOut) {
        const existing = dayMap.get(format(cur, "yyyy-MM-dd"));
        if (existing && existing.id !== booking.id) {
          alert("Sovrapposizione con un'altra prenotazione.");
          return;
        }
        cur = addDays(cur, 1);
      }

      // Optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? { ...b, checkIn: newCheckInStr, checkOut: newCheckOutStr }
            : b
        )
      );

      const res = await fetch(`/api/bookings/${booking.id}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkIn: newCheckInStr, checkOut: newCheckOutStr }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Errore nel salvataggio.");
        // Revert
        setBookings((prev) =>
          prev.map((b) =>
            b.id === booking.id
              ? {
                  ...b,
                  checkIn,
                  checkOut: format(addDays(parseDate(checkIn), nights), "yyyy-MM-dd"),
                }
              : b
          )
        );
      } else {
        onBookingMoved?.();
      }
    },
    [activeBooking, dayMap, onBookingMoved]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentDate((d) => subMonths(d, 1))}
          className="p-1.5 rounded hover:bg-[#2A3040] text-[#A6A29A] hover:text-[#F4F0E6] transition-colors text-sm"
        >
          ◄
        </button>
        <div className="text-center">
          <p className="text-[#F4F0E6] font-semibold text-sm">
            {format(currentDate, "MMMM yyyy", { locale: it }).toUpperCase()}
          </p>
          {monthlyRate ? (
            <p className="text-[#A6A29A] text-xs mt-0.5">
              PREZZO:{" "}
              <span className="text-[#C9A75F]">€{monthlyRate.price}</span> |
              PULIZIE:{" "}
              <span className="text-[#C9A75F]">€{monthlyRate.cleaningFee}</span>
            </p>
          ) : roomId ? (
            <p className="text-[#A6A29A] text-xs mt-0.5">
              Nessun listino per questo mese
            </p>
          ) : null}
        </div>
        <button
          onClick={() => setCurrentDate((d) => addMonths(d, 1))}
          className="p-1.5 rounded hover:bg-[#2A3040] text-[#A6A29A] hover:text-[#F4F0E6] transition-colors text-sm"
        >
          ►
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-center text-[#A6A29A] text-xs font-medium py-1"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="h-40 flex items-center justify-center text-[#A6A29A] text-sm">
          Caricamento...
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`e-${i}`} className="h-16" />
          ))}

          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const booking = dayMap.get(dateStr);

            if (booking) {
              const isFirst = isSameDay(day, parseDate(booking.checkIn));
              return (
                <BookingDay
                  key={dateStr}
                  dateStr={dateStr}
                  day={day}
                  booking={booking}
                  showLabel={isFirst}
                  isActivelyDragged={activeBooking?.id === booking.id}
                />
              );
            }

            return (
              <EmptyDropDay
                key={dateStr}
                dateStr={dateStr}
                day={day}
                isSelected={isSelected(day)}
                isInRange={isInRange(day)}
                isDragging={!!activeBooking}
                onClick={() => handleDayClick(day)}
              />
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-[11px] text-[#A6A29A]">
        {[
          { color: "bg-[#1A2030]", label: "Disponibile" },
          { color: "bg-[#2C4A7B]", label: "Bloccato" },
          { color: "bg-[#B8950A]", label: "In Trattativa" },
          { color: "bg-[#7B2020]", label: "Prenotato" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${color}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeBooking && (
          <div
            className={`rounded px-3 py-1.5 text-xs font-semibold shadow-2xl cursor-grabbing ${
              STATUS_BG[activeBooking.status] ?? "bg-gray-700 text-white"
            }`}
          >
            {activeBooking.collaborator?.nickname ?? activeBooking.clientFirstName}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
