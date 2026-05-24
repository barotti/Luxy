"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { BookingCalendar } from "./BookingCalendar";
import type { MonthlyRate } from "./BookingCalendar";

interface Room {
  id: string;
  name: string;
  capacity: number;
}

interface Property {
  id: string;
  name: string;
  rooms: Room[];
}

export function NewBookingClient({ properties }: { properties: Property[] }) {
  const router = useRouter();

  // Room & dates
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [nights, setNights] = useState(0);
  const [stayAmount, setStayAmount] = useState(0);
  const [cleaningAmount, setCleaningAmount] = useState(0);

  // Client
  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRoom = properties
    .flatMap((p) => p.rooms)
    .find((r) => r.id === selectedRoomId);

  const ownerAmount = stayAmount + cleaningAmount;
  const totalAmount = ownerAmount;

  const fmt = (n: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const handleRangeSelect = (ci: Date, co: Date, n: number, rate: MonthlyRate | null) => {
    setCheckIn(ci);
    setCheckOut(co);
    setNights(n);
    setStayAmount((rate?.price ?? 0) * n);
    setCleaningAmount(rate?.cleaningFee ?? 0);
  };

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    setCheckIn(null);
    setCheckOut(null);
    setNights(0);
    setStayAmount(0);
    setCleaningAmount(0);
  };

  const handleSubmit = async () => {
    if (!selectedRoomId || !checkIn || !checkOut || !clientFirstName.trim()) {
      setError("Seleziona stanza, date e inserisci il nome del cliente.");
      return;
    }
    setSaving(true);
    setError(null);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: selectedRoomId,
        clientFirstName: clientFirstName.trim(),
        clientLastName: clientLastName.trim() || null,
        clientPhone: clientPhone.trim() || null,
        clientEmail: clientEmail.trim() || null,
        guests,
        checkIn: format(checkIn, "yyyy-MM-dd"),
        checkOut: format(checkOut, "yyyy-MM-dd"),
        nights,
        stayAmount,
        cleaningAmount,
        ownerAmount,
        feeAmount: 0,
        totalAmount,
        notes: notes.trim() || null,
        status: "in_trattativa",
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Errore nel salvataggio.");
      setSaving(false);
      return;
    }

    router.push("/bookings");
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F4F0E6]">Nuova Prenotazione</h1>
        <p className="text-[#A6A29A] text-sm mt-1">
          Seleziona stanza e date dal calendario, poi compila i dati cliente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block 1: Room & Calendar */}
        <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6">
          <h2 className="text-[#F4F0E6] font-semibold mb-5 flex items-center gap-2">
            <span>🗓️</span> Stanza & Date
          </h2>

          <div className="mb-4">
            <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
              Seleziona Struttura / Stanza
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => handleRoomChange(e.target.value)}
              className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm focus:border-[#C9A75F] focus:outline-none transition-colors"
            >
              <option value="">Seleziona struttura e stanza...</option>
              {properties.map((p) =>
                p.rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {p.name} — {r.name}
                  </option>
                ))
              )}
            </select>
            {properties.length === 0 && (
              <p className="text-[#D95D5D] text-xs mt-1">
                Nessuna proprietà disponibile. Aggiungine una prima.
              </p>
            )}
          </div>

          <BookingCalendar
            roomId={selectedRoomId || null}
            onRangeSelect={handleRangeSelect}
          />

          {/* Summary */}
          {checkIn && checkOut && (
            <div className="mt-4 bg-[#10141C] rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#A6A29A]">
                <span>Check-in</span>
                <span className="text-[#F4F0E6]">{format(checkIn, "dd/MM/yyyy")}</span>
              </div>
              <div className="flex justify-between text-[#A6A29A]">
                <span>Check-out</span>
                <span className="text-[#F4F0E6]">{format(checkOut, "dd/MM/yyyy")}</span>
              </div>
              <div className="flex justify-between text-[#A6A29A]">
                <span>Notti</span>
                <span className="text-[#F4F0E6]">{nights}</span>
              </div>
              <div className="flex justify-between text-[#A6A29A]">
                <span>Soggiorno</span>
                <span className="text-[#F4F0E6]">{fmt(stayAmount)}</span>
              </div>
              <div className="flex justify-between text-[#A6A29A]">
                <span>Pulizie</span>
                <span className="text-[#F4F0E6]">{fmt(cleaningAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-[#2A3040] pt-2">
                <span className="text-[#F4F0E6]">Totale</span>
                <span className="text-[#C9A75F]">{fmt(totalAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Block 2: Client data */}
        <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6">
          <h2 className="text-[#F4F0E6] font-semibold mb-5 flex items-center gap-2">
            <span>👤</span> Dati Cliente
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
                  Nome *
                </label>
                <input
                  type="text"
                  value={clientFirstName}
                  onChange={(e) => setClientFirstName(e.target.value)}
                  placeholder="Nome"
                  className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm placeholder-[#A6A29A] focus:border-[#C9A75F] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
                  Cognome
                </label>
                <input
                  type="text"
                  value={clientLastName}
                  onChange={(e) => setClientLastName(e.target.value)}
                  placeholder="Cognome"
                  className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm placeholder-[#A6A29A] focus:border-[#C9A75F] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+39 000 000 0000"
                  className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm placeholder-[#A6A29A] focus:border-[#C9A75F] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm placeholder-[#A6A29A] focus:border-[#C9A75F] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
                Numero ospiti *
              </label>
              <input
                type="number"
                min={1}
                max={selectedRoom?.capacity ?? 99}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm focus:border-[#C9A75F] focus:outline-none transition-colors"
              />
              {selectedRoom && (
                <p className="text-[#A6A29A] text-xs mt-1">
                  Capacità max: {selectedRoom.capacity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
                Note / Riferimenti extra
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Valore concordato, note su pagamenti..."
                className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm placeholder-[#A6A29A] focus:border-[#C9A75F] focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-[#D95D5D]/10 border border-[#D95D5D]/30 rounded-lg text-[#D95D5D] text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm border border-[#2A3040] text-[#A6A29A] hover:text-[#F4F0E6] hover:border-[#F4F0E6] rounded-lg transition-colors"
        >
          Annulla
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2.5 text-sm bg-[#C9A75F] hover:bg-[#E0C27A] disabled:opacity-50 text-[#070A0D] font-semibold rounded-lg transition-colors"
        >
          {saving ? "Salvataggio..." : "Salva Prenotazione"}
        </button>
      </div>
    </div>
  );
}
