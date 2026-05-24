"use client";

import { useState } from "react";

interface Booking {
  id: string;
  clientFirstName: string;
  clientLastName?: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  stayAmount: number;
  cleaningAmount: number;
  ownerAmount: number;
  feeAmount: number;
  totalAmount: number;
  collectedAmount: number;
  status: string;
  notes?: string | null;
  property: { name: string };
  room: { name: string };
  paymentMethod?: { id: string; name: string } | null;
}

interface PaymentMethod {
  id: string;
  name: string;
}

interface EditModal {
  id: string;
  status: string;
  feeAmount: string;
  collectedAmount: string;
  paymentMethodId: string;
  notes: string;
}

interface CancelConfirm {
  id: string;
  label: string;
}

const STATUS_LABELS: Record<string, string> = {
  in_trattativa: "In Trattativa",
  bloccato: "Bloccato",
  prenotato: "Prenotato",
  finalizzato: "Finalizzato",
  cancellato: "Cancellato",
};

const STATUS_COLORS: Record<string, string> = {
  in_trattativa: "bg-[#C9A75F]/20 text-[#C9A75F] border-[#C9A75F]/30",
  bloccato: "bg-[#4A90E2]/20 text-[#4A90E2] border-[#4A90E2]/30",
  prenotato: "bg-[#D95D5D]/20 text-[#D95D5D] border-[#D95D5D]/30",
  finalizzato: "bg-[#3BB273]/20 text-[#3BB273] border-[#3BB273]/30",
  cancellato: "bg-[#A6A29A]/20 text-[#A6A29A] border-[#A6A29A]/30",
};

const MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

const inputClass =
  "w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm placeholder-[#A6A29A] focus:border-[#C9A75F] focus:outline-none transition-colors";
const labelClass = "block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5";
const primaryBtn =
  "bg-[#C9A75F] hover:bg-[#E0C27A] text-[#070A0D] font-semibold px-4 py-2 rounded-lg text-sm transition-colors";
const secondaryBtn =
  "border border-[#2A3040] text-[#A6A29A] hover:text-[#F4F0E6] hover:border-[#F4F0E6] px-4 py-2 rounded-lg text-sm transition-colors";
const dangerBtn =
  "bg-[#D95D5D] hover:bg-[#C04A4A] text-white px-4 py-2 rounded-lg text-sm transition-colors font-semibold";

function formatDate(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

function formatEur(n: number) {
  return `€${Number(n).toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function BookingsClient({
  bookings: initial,
  paymentMethods,
}: {
  bookings: Booking[];
  paymentMethods: PaymentMethod[];
}) {
  const [bookings, setBookings] = useState<Booking[]>(initial);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [editModal, setEditModal] = useState<EditModal | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<CancelConfirm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Filtering ────────────────────────────────────────────────────

  const filtered = bookings.filter((b) => {
    const fullName = `${b.clientFirstName} ${b.clientLastName ?? ""}`.toLowerCase();
    if (search && !fullName.includes(search.toLowerCase())) return false;
    if (filterStatus && b.status !== filterStatus) return false;
    if (filterYear) {
      const year = b.checkIn.slice(0, 4);
      if (year !== filterYear) return false;
    }
    if (filterMonth) {
      const month = String(parseInt(b.checkIn.slice(5, 7)));
      if (month !== filterMonth) return false;
    }
    return true;
  });

  // Build year options from bookings
  const years = Array.from(new Set(bookings.map((b) => b.checkIn.slice(0, 4)))).sort((a, b) => b.localeCompare(a));

  // ─── Edit ─────────────────────────────────────────────────────────

  function openEdit(b: Booking) {
    setEditModal({
      id: b.id,
      status: b.status,
      feeAmount: String(b.feeAmount),
      collectedAmount: String(b.collectedAmount),
      paymentMethodId: b.paymentMethod?.id ?? "",
      notes: b.notes ?? "",
    });
    setError(null);
  }

  async function saveEdit() {
    if (!editModal) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${editModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editModal.status,
          feeAmount: parseFloat(editModal.feeAmount) || 0,
          collectedAmount: parseFloat(editModal.collectedAmount) || 0,
          paymentMethodId: editModal.paymentMethodId || null,
          notes: editModal.notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Errore nel salvataggio");
        return;
      }
      const updated = await res.json();
      const serialized = {
        ...updated,
        checkIn: updated.checkIn
          ? (typeof updated.checkIn === "string" ? updated.checkIn : new Date(updated.checkIn).toISOString()).slice(0, 10)
          : "",
        checkOut: updated.checkOut
          ? (typeof updated.checkOut === "string" ? updated.checkOut : new Date(updated.checkOut).toISOString()).slice(0, 10)
          : "",
      };
      setBookings((prev) => prev.map((b) => (b.id === editModal.id ? serialized : b)));
      setEditModal(null);
    } catch {
      setError("Errore di rete");
    } finally {
      setSaving(false);
    }
  }

  // ─── Cancel ───────────────────────────────────────────────────────

  async function cancelBooking() {
    if (!cancelConfirm) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bookings/${cancelConfirm.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Errore nell'annullamento");
        return;
      }
      const updated = await res.json();
      const serialized = {
        ...updated,
        checkIn: updated.checkIn
          ? (typeof updated.checkIn === "string" ? updated.checkIn : new Date(updated.checkIn).toISOString()).slice(0, 10)
          : "",
        checkOut: updated.checkOut
          ? (typeof updated.checkOut === "string" ? updated.checkOut : new Date(updated.checkOut).toISOString()).slice(0, 10)
          : "",
      };
      setBookings((prev) => prev.map((b) => (b.id === cancelConfirm.id ? serialized : b)));
      setCancelConfirm(null);
    } catch {
      setError("Errore di rete");
    } finally {
      setSaving(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F0E6]" style={{ fontFamily: "Georgia, serif" }}>
            Prenotazioni
          </h1>
          <p className="text-[#A6A29A] text-sm mt-1">{filtered.length} prenotazioni</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-4 mb-6 flex flex-wrap gap-3">
        <input
          className={inputClass + " max-w-xs"}
          placeholder="Cerca cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={inputClass + " max-w-[180px]"}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tutti gli stati</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
        <select
          className={inputClass + " max-w-[130px]"}
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">Anno</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          className={inputClass + " max-w-[150px]"}
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">Mese</option>
          {MONTHS.map((name, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {name}
            </option>
          ))}
        </select>
        {(search || filterStatus || filterYear || filterMonth) && (
          <button
            onClick={() => { setSearch(""); setFilterStatus(""); setFilterYear(""); setFilterMonth(""); }}
            className="text-[#A6A29A] hover:text-[#F4F0E6] text-sm px-3 py-2 transition-colors"
          >
            Azzera
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#151A24] border border-[#2A3040] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-[#2A3040]">
                {["Cliente", "App./Stanza", "Date", "Soggiorno", "Pulizie", "Owner", "Fee", "Totale", "Incasso", "Stato", "Azioni"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-[#A6A29A] text-xs uppercase tracking-wider px-4 py-3 font-medium"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-[#A6A29A]">
                    Nessuna prenotazione trovata
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-[#2A3040]/50 hover:bg-[#1A2030] transition-colors"
                  >
                    <td className="px-4 py-3 text-[#F4F0E6] font-medium whitespace-nowrap">
                      {b.clientFirstName} {b.clientLastName ?? ""}
                    </td>
                    <td className="px-4 py-3 text-[#A6A29A] whitespace-nowrap">
                      <span className="text-[#F4F0E6]">{b.property.name}</span>
                      <br />
                      <span className="text-xs">{b.room.name}</span>
                    </td>
                    <td className="px-4 py-3 text-[#A6A29A] whitespace-nowrap text-xs">
                      {formatDate(b.checkIn)}
                      <br />
                      {formatDate(b.checkOut)}
                      <br />
                      <span className="text-[#C9A75F]">{b.nights} notti</span>
                    </td>
                    <td className="px-4 py-3 text-[#F4F0E6] whitespace-nowrap">
                      {formatEur(b.stayAmount)}
                    </td>
                    <td className="px-4 py-3 text-[#A6A29A] whitespace-nowrap">
                      {formatEur(b.cleaningAmount)}
                    </td>
                    <td className="px-4 py-3 text-[#F4F0E6] whitespace-nowrap">
                      {formatEur(b.ownerAmount)}
                    </td>
                    <td className="px-4 py-3 text-[#A6A29A] whitespace-nowrap">
                      {formatEur(b.feeAmount)}
                    </td>
                    <td className="px-4 py-3 text-[#C9A75F] font-semibold whitespace-nowrap">
                      {formatEur(b.totalAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[#3BB273]">{formatEur(b.collectedAmount)}</span>
                      {b.paymentMethod && (
                        <span className="block text-xs text-[#A6A29A]">{b.paymentMethod.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block border text-xs px-2 py-1 rounded-full ${
                          STATUS_COLORS[b.status] ?? "bg-[#A6A29A]/20 text-[#A6A29A] border-[#A6A29A]/30"
                        }`}
                      >
                        {STATUS_LABELS[b.status] ?? b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(b)}
                          className="text-[#A6A29A] hover:text-[#F4F0E6] text-xs px-2 py-1 border border-[#2A3040] hover:border-[#F4F0E6] rounded transition-colors"
                        >
                          Modifica
                        </button>
                        {b.status !== "cancellato" && (
                          <button
                            onClick={() =>
                              setCancelConfirm({
                                id: b.id,
                                label: `${b.clientFirstName} ${b.clientLastName ?? ""}`,
                              })
                            }
                            className="text-[#D95D5D] hover:text-[#C04A4A] text-xs px-2 py-1 border border-[#D95D5D]/40 hover:border-[#D95D5D] rounded transition-colors"
                          >
                            Cancella
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Edit Modal ─── */}
      {editModal !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-[#F4F0E6] font-semibold text-lg mb-5">Modifica Prenotazione</h2>
            {error && (
              <div className="bg-[#D95D5D]/10 border border-[#D95D5D]/30 text-[#D95D5D] text-sm rounded-lg px-4 py-2.5 mb-4">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Stato</label>
                <select
                  className={inputClass}
                  value={editModal.status}
                  onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fee (€)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  value={editModal.feeAmount}
                  onChange={(e) => setEditModal({ ...editModal, feeAmount: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Incassato (€)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  value={editModal.collectedAmount}
                  onChange={(e) => setEditModal({ ...editModal, collectedAmount: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Metodo di Pagamento</label>
                <select
                  className={inputClass}
                  value={editModal.paymentMethodId}
                  onChange={(e) => setEditModal({ ...editModal, paymentMethodId: e.target.value })}
                >
                  <option value="">— Nessuno —</option>
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Note</label>
                <textarea
                  className={inputClass + " resize-none h-20"}
                  placeholder="Note aggiuntive..."
                  value={editModal.notes}
                  onChange={(e) => setEditModal({ ...editModal, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => { setEditModal(null); setError(null); }} className={secondaryBtn}>
                Annulla
              </button>
              <button onClick={saveEdit} disabled={saving} className={primaryBtn}>
                {saving ? "Salvataggio..." : "Salva"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Cancel Confirm Modal ─── */}
      {cancelConfirm !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-[#F4F0E6] font-semibold text-lg mb-2">Annulla prenotazione</h2>
            <p className="text-[#A6A29A] text-sm mb-6">
              Annullare la prenotazione di{" "}
              <span className="text-[#F4F0E6] font-medium">{cancelConfirm.label}</span>?{" "}
              Lo stato verrà impostato a <span className="text-[#A6A29A] font-medium">Cancellato</span>.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCancelConfirm(null)} className={secondaryBtn}>
                Indietro
              </button>
              <button onClick={cancelBooking} disabled={saving} className={dangerBtn}>
                {saving ? "Annullamento..." : "Conferma Annullamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
