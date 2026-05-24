"use client";

import { useState } from "react";

const MONTH_NAMES = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

interface Room {
  id: string;
  name: string;
  capacity: number;
  description?: string | null;
}

interface PropertyWithRooms {
  id: string;
  name: string;
  location: string;
  description?: string | null;
  rooms: Room[];
}

interface Rate {
  id?: string;
  year: number;
  month: number;
  price: number;
  cleaningFee: number;
}

interface PropertyModal {
  id?: string;
  name: string;
  location: string;
  description: string;
}

interface RoomModal {
  propertyId: string;
  id?: string;
  name: string;
  capacity: number;
  description: string;
}

interface RatesModal {
  roomId: string;
  roomName: string;
}

interface DeleteConfirm {
  type: "property" | "room";
  id: string;
  label: string;
}

const inputClass =
  "w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm placeholder-[#A6A29A] focus:border-[#C9A75F] focus:outline-none transition-colors";
const labelClass = "block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5";
const primaryBtn =
  "bg-[#C9A75F] hover:bg-[#E0C27A] text-[#070A0D] font-semibold px-4 py-2 rounded-lg text-sm transition-colors";
const secondaryBtn =
  "border border-[#2A3040] text-[#A6A29A] hover:text-[#F4F0E6] hover:border-[#F4F0E6] px-4 py-2 rounded-lg text-sm transition-colors";
const dangerBtn =
  "bg-[#D95D5D] hover:bg-[#C04A4A] text-white px-4 py-2 rounded-lg text-sm transition-colors font-semibold";

export function PropertiesClient({ properties: initial }: { properties: PropertyWithRooms[] }) {
  const [properties, setProperties] = useState<PropertyWithRooms[]>(initial);
  const [propertyModal, setPropertyModal] = useState<PropertyModal | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [roomModal, setRoomModal] = useState<RoomModal | null>(null);
  const [ratesModal, setRatesModal] = useState<RatesModal | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);
  const [rateForm, setRateForm] = useState({ year: "2026", month: "1", price: "", cleaningFee: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);

  // ─── Property CRUD ───────────────────────────────────────────────

  function openNewProperty() {
    setPropertyModal({ name: "", location: "", description: "" });
    setError(null);
  }

  function openEditProperty(p: PropertyWithRooms) {
    setPropertyModal({ id: p.id, name: p.name, location: p.location, description: p.description ?? "" });
    setError(null);
  }

  async function saveProperty() {
    if (!propertyModal) return;
    setError(null);
    if (!propertyModal.name.trim()) { setError("Nome proprietà obbligatorio"); return; }
    if (!propertyModal.location.trim()) { setError("Posizione obbligatoria"); return; }
    setSaving(true);
    try {
      const isEdit = Boolean(propertyModal.id);
      const url = isEdit ? `/api/properties/${propertyModal.id}` : "/api/properties";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: propertyModal.name.trim(),
          location: propertyModal.location.trim(),
          description: propertyModal.description.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Errore nel salvataggio");
        return;
      }
      const saved = await res.json();
      if (isEdit) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === saved.id
              ? { ...p, name: saved.name, location: saved.location, description: saved.description }
              : p
          )
        );
      } else {
        setProperties((prev) => [{ ...saved, rooms: [] }, ...prev]);
      }
      setPropertyModal(null);
    } catch {
      setError("Errore di rete");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProperty(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Errore nell'eliminazione");
        return;
      }
      setProperties((prev) => prev.filter((p) => p.id !== id));
      if (expandedId === id) setExpandedId(null);
      setDeleteConfirm(null);
    } catch {
      setError("Errore di rete");
    } finally {
      setSaving(false);
    }
  }

  // ─── Room CRUD ────────────────────────────────────────────────────

  function openNewRoom(propertyId: string) {
    setRoomModal({ propertyId, name: "", capacity: 1, description: "" });
    setError(null);
  }

  function openEditRoom(propertyId: string, r: Room) {
    setRoomModal({ propertyId, id: r.id, name: r.name, capacity: r.capacity, description: r.description ?? "" });
    setError(null);
  }

  async function saveRoom() {
    if (!roomModal) return;
    setError(null);
    if (!roomModal.name.trim()) { setError("Nome camera obbligatorio"); return; }
    if (roomModal.capacity < 1) { setError("Capacità minima 1"); return; }
    setSaving(true);
    try {
      const isEdit = Boolean(roomModal.id);
      const url = isEdit ? `/api/rooms/${roomModal.id}` : `/api/properties/${roomModal.propertyId}/rooms`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomModal.name.trim(),
          capacity: roomModal.capacity,
          description: roomModal.description.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Errore nel salvataggio");
        return;
      }
      const saved = await res.json();
      if (isEdit) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === roomModal.propertyId
              ? { ...p, rooms: p.rooms.map((r) => (r.id === saved.id ? saved : r)) }
              : p
          )
        );
      } else {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === roomModal.propertyId ? { ...p, rooms: [...p.rooms, saved] } : p
          )
        );
      }
      setRoomModal(null);
    } catch {
      setError("Errore di rete");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRoom(propertyId: string, roomId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Errore nell'eliminazione");
        return;
      }
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, rooms: p.rooms.filter((r) => r.id !== roomId) } : p
        )
      );
      setDeleteConfirm(null);
    } catch {
      setError("Errore di rete");
    } finally {
      setSaving(false);
    }
  }

  // ─── Rates ────────────────────────────────────────────────────────

  async function openRates(roomId: string, roomName: string) {
    setRatesModal({ roomId, roomName });
    setRates([]);
    setError(null);
    setRatesLoading(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/rates`);
      if (res.ok) {
        const data = await res.json();
        setRates(data);
      }
    } catch {
      // ignore
    } finally {
      setRatesLoading(false);
    }
  }

  function addRate() {
    const year = parseInt(rateForm.year);
    const month = parseInt(rateForm.month);
    const price = parseFloat(rateForm.price);
    const cleaningFee = parseFloat(rateForm.cleaningFee);
    if (isNaN(year) || isNaN(month) || isNaN(price) || isNaN(cleaningFee)) {
      setError("Compila tutti i campi del listino correttamente");
      return;
    }
    if (rates.some((r) => r.year === year && r.month === month)) {
      setError("Esiste già un listino per questo mese");
      return;
    }
    setRates((prev) => [...prev, { year, month, price, cleaningFee }]);
    setRateForm({ year: rateForm.year, month: "1", price: "", cleaningFee: "" });
    setError(null);
  }

  function removeRate(index: number) {
    setRates((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveRates() {
    if (!ratesModal) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${ratesModal.roomId}/rates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Errore nel salvataggio listino");
        return;
      }
      const updated = await res.json();
      setRates(updated);
      setRatesModal(null);
    } catch {
      setError("Errore di rete");
    } finally {
      setSaving(false);
    }
  }

  // ─── Delete confirm handler ───────────────────────────────────────

  async function handleConfirmDelete() {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "property") {
      await deleteProperty(deleteConfirm.id);
    } else {
      const prop = properties.find((p) => p.rooms.some((r) => r.id === deleteConfirm.id));
      if (prop) await deleteRoom(prop.id, deleteConfirm.id);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F0E6]" style={{ fontFamily: "Georgia, serif" }}>
            Proprietà
          </h1>
          <p className="text-[#A6A29A] text-sm mt-1">{properties.length} strutture registrate</p>
        </div>
        <button onClick={openNewProperty} className={primaryBtn}>
          + Nuova Proprietà
        </button>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-24 text-[#A6A29A]">
          <p className="text-lg">Nessuna proprietà registrata</p>
          <p className="text-sm mt-2">Crea la tua prima struttura per iniziare</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-[#151A24] border border-[#2A3040] rounded-xl overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[#F4F0E6] font-semibold text-base truncate">{property.name}</h2>
                    <p className="text-[#C9A75F] text-xs mt-0.5 truncate">{property.location}</p>
                  </div>
                  <span className="flex-shrink-0 bg-[#10141C] border border-[#2A3040] text-[#A6A29A] text-xs px-2 py-1 rounded-full">
                    {property.rooms.length} {property.rooms.length === 1 ? "stanza" : "stanze"}
                  </span>
                </div>
                {property.description && (
                  <p className="text-[#A6A29A] text-sm line-clamp-2 mb-3">{property.description}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => openEditProperty(property)}
                    className={secondaryBtn + " text-xs py-1.5 px-3"}
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({ type: "property", id: property.id, label: property.name })
                    }
                    className="border border-[#D95D5D]/40 text-[#D95D5D] hover:bg-[#D95D5D]/10 px-3 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    Elimina
                  </button>
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === property.id ? null : property.id)
                    }
                    className={`ml-auto text-xs py-1.5 px-3 rounded-lg transition-colors border ${
                      expandedId === property.id
                        ? "border-[#C9A75F] text-[#C9A75F]"
                        : "border-[#2A3040] text-[#A6A29A] hover:text-[#F4F0E6] hover:border-[#F4F0E6]"
                    }`}
                  >
                    {expandedId === property.id ? "Chiudi Stanze" : "Stanze"}
                  </button>
                </div>
              </div>

              {/* Rooms Panel */}
              {expandedId === property.id && (
                <div className="border-t border-[#2A3040] bg-[#10141C]">
                  <div className="p-4">
                    <p className="text-[#A6A29A] text-xs uppercase tracking-wider mb-3">Stanze</p>
                    {property.rooms.length === 0 ? (
                      <p className="text-[#A6A29A] text-sm text-center py-3">Nessuna stanza</p>
                    ) : (
                      <div className="space-y-2">
                        {property.rooms.map((room) => (
                          <div
                            key={room.id}
                            className="bg-[#151A24] border border-[#2A3040] rounded-lg p-3 flex items-center justify-between gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-[#F4F0E6] text-sm font-medium truncate">{room.name}</p>
                              <span className="text-[#A6A29A] text-xs">
                                Cap. {room.capacity}
                              </span>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => openEditRoom(property.id, room)}
                                className="text-[#A6A29A] hover:text-[#F4F0E6] text-xs px-2 py-1 rounded border border-[#2A3040] hover:border-[#F4F0E6] transition-colors"
                              >
                                Modifica
                              </button>
                              <button
                                onClick={() => openRates(room.id, room.name)}
                                className="text-[#C9A75F] hover:text-[#E0C27A] text-xs px-2 py-1 rounded border border-[#C9A75F]/40 hover:border-[#C9A75F] transition-colors"
                              >
                                Listino
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({ type: "room", id: room.id, label: room.name })
                                }
                                className="text-[#D95D5D] hover:text-[#C04A4A] text-xs px-2 py-1 rounded border border-[#D95D5D]/40 hover:border-[#D95D5D] transition-colors"
                              >
                                Elimina
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => openNewRoom(property.id)}
                      className="mt-3 w-full border border-dashed border-[#2A3040] hover:border-[#C9A75F] text-[#A6A29A] hover:text-[#C9A75F] text-sm py-2 rounded-lg transition-colors"
                    >
                      + Aggiungi Stanza
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Property Modal ─── */}
      {propertyModal !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-[#F4F0E6] font-semibold text-lg mb-5">
              {propertyModal.id ? "Modifica Proprietà" : "Nuova Proprietà"}
            </h2>
            {error && (
              <div className="bg-[#D95D5D]/10 border border-[#D95D5D]/30 text-[#D95D5D] text-sm rounded-lg px-4 py-2.5 mb-4">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nome proprietà *</label>
                <input
                  className={inputClass}
                  placeholder="Es. Villa Marina"
                  value={propertyModal.name}
                  onChange={(e) => setPropertyModal({ ...propertyModal, name: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Posizione *</label>
                <input
                  className={inputClass}
                  placeholder="Es. Ibiza, ES"
                  value={propertyModal.location}
                  onChange={(e) => setPropertyModal({ ...propertyModal, location: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Descrizione</label>
                <textarea
                  className={inputClass + " resize-none h-24"}
                  placeholder="Descrizione opzionale..."
                  value={propertyModal.description}
                  onChange={(e) => setPropertyModal({ ...propertyModal, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => { setPropertyModal(null); setError(null); }} className={secondaryBtn}>
                Annulla
              </button>
              <button onClick={saveProperty} disabled={saving} className={primaryBtn}>
                {saving ? "Salvataggio..." : "Salva"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Room Modal ─── */}
      {roomModal !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-[#F4F0E6] font-semibold text-lg mb-5">
              {roomModal.id ? "Modifica Stanza" : "Nuova Stanza"}
            </h2>
            {error && (
              <div className="bg-[#D95D5D]/10 border border-[#D95D5D]/30 text-[#D95D5D] text-sm rounded-lg px-4 py-2.5 mb-4">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nome stanza *</label>
                <input
                  className={inputClass}
                  placeholder="Es. Frangipani Room"
                  value={roomModal.name}
                  onChange={(e) => setRoomModal({ ...roomModal, name: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Capacità *</label>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={roomModal.capacity}
                  onChange={(e) => setRoomModal({ ...roomModal, capacity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className={labelClass}>Descrizione</label>
                <textarea
                  className={inputClass + " resize-none h-20"}
                  placeholder="Descrizione opzionale..."
                  value={roomModal.description}
                  onChange={(e) => setRoomModal({ ...roomModal, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => { setRoomModal(null); setError(null); }} className={secondaryBtn}>
                Annulla
              </button>
              <button onClick={saveRoom} disabled={saving} className={primaryBtn}>
                {saving ? "Salvataggio..." : "Salva"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Rates Modal ─── */}
      {ratesModal !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[#F4F0E6] font-semibold text-lg">Listino Mensile</h2>
                <p className="text-[#A6A29A] text-sm mt-0.5">{ratesModal.roomName}</p>
              </div>
            </div>

            {error && (
              <div className="bg-[#D95D5D]/10 border border-[#D95D5D]/30 text-[#D95D5D] text-sm rounded-lg px-4 py-2.5 mb-4">
                {error}
              </div>
            )}

            {/* Existing Rates Table */}
            {ratesLoading ? (
              <div className="text-center py-8 text-[#A6A29A]">Caricamento...</div>
            ) : rates.length > 0 ? (
              <div className="mb-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2A3040]">
                      <th className="text-left text-[#A6A29A] text-xs uppercase tracking-wider py-2 pr-4">Anno</th>
                      <th className="text-left text-[#A6A29A] text-xs uppercase tracking-wider py-2 pr-4">Mese</th>
                      <th className="text-right text-[#A6A29A] text-xs uppercase tracking-wider py-2 pr-4">Prezzo</th>
                      <th className="text-right text-[#A6A29A] text-xs uppercase tracking-wider py-2 pr-4">Pulizie</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rates
                      .slice()
                      .sort((a, b) => a.year - b.year || a.month - b.month)
                      .map((rate, i) => (
                        <tr key={i} className="border-b border-[#2A3040]/50">
                          <td className="py-2 pr-4 text-[#F4F0E6]">{rate.year}</td>
                          <td className="py-2 pr-4 text-[#F4F0E6]">{MONTH_NAMES[rate.month - 1]}</td>
                          <td className="py-2 pr-4 text-right text-[#C9A75F]">€{rate.price}</td>
                          <td className="py-2 pr-4 text-right text-[#A6A29A]">€{rate.cleaningFee}</td>
                          <td className="py-2 text-right">
                            <button
                              onClick={() => removeRate(rates.indexOf(rate))}
                              className="text-[#D95D5D] hover:text-[#C04A4A] text-xs px-2 py-1 transition-colors"
                            >
                              Rimuovi
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-[#A6A29A] text-sm mb-4">
                Nessun listino configurato
              </div>
            )}

            {/* Add Rate Form */}
            <div className="bg-[#10141C] border border-[#2A3040] rounded-lg p-4 mb-5">
              <p className="text-[#A6A29A] text-xs uppercase tracking-wider mb-3">Aggiungi Periodo</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className={labelClass}>Anno</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={rateForm.year}
                    onChange={(e) => setRateForm({ ...rateForm, year: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Mese</label>
                  <select
                    className={inputClass}
                    value={rateForm.month}
                    onChange={(e) => setRateForm({ ...rateForm, month: e.target.value })}
                  >
                    {MONTH_NAMES.map((name, i) => (
                      <option key={i + 1} value={i + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Prezzo (€)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={inputClass}
                    placeholder="150"
                    value={rateForm.price}
                    onChange={(e) => setRateForm({ ...rateForm, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Pulizie (€)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={inputClass}
                    placeholder="30"
                    value={rateForm.cleaningFee}
                    onChange={(e) => setRateForm({ ...rateForm, cleaningFee: e.target.value })}
                  />
                </div>
              </div>
              <button
                onClick={addRate}
                className={`mt-3 ${primaryBtn} text-xs py-2`}
              >
                + Aggiungi
              </button>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => { setRatesModal(null); setError(null); }} className={secondaryBtn}>
                Annulla
              </button>
              <button onClick={saveRates} disabled={saving} className={primaryBtn}>
                {saving ? "Salvataggio..." : "Salva Listino"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─── */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-[#F4F0E6] font-semibold text-lg mb-2">Conferma eliminazione</h2>
            <p className="text-[#A6A29A] text-sm mb-6">
              Sei sicuro di voler eliminare{" "}
              <span className="text-[#F4F0E6] font-medium">{deleteConfirm.label}</span>? Questa azione
              non può essere annullata.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className={secondaryBtn}>
                Annulla
              </button>
              <button onClick={handleConfirmDelete} disabled={saving} className={dangerBtn}>
                {saving ? "Eliminazione..." : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
