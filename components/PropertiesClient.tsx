"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit2, Calendar, MapPin, X, Check, Users } from "lucide-react";

const MONTH_NAMES = [
  "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
  "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",
];

// ─── Types ───────────────────────────────────────────────────────
interface Rate { id?: string; year: number; month: number; price: number; cleaningFee: number }
interface Collaborator { id: string; userId: string; roleOnProperty: string; user: { id: string; nickname: string; role: string } }
interface Room { id: string; name: string; capacity: number; description?: string|null; images: string[]; monthlyRates: Rate[] }
interface Property { id: string; name: string; location: string; description?: string|null; images: string[]; rooms: Room[]; collaborators: Collaborator[] }

// ─── Style helpers ───────────────────────────────────────────────
const INPUT = "w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-3 py-2 text-[#F4F0E6] text-sm placeholder-[#A6A29A] focus:border-[#C9A75F] focus:outline-none transition-colors";
const LABEL = "block text-[#A6A29A] text-[10px] uppercase tracking-wider mb-1";

// ─── Utility ─────────────────────────────────────────────────────
async function apiFetch(method: string, url: string, body?: object) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 || res.headers.get("content-length") === "0" ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `Errore server (${res.status})`);
  return data;
}

// ─── Modal ───────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[#F4F0E6] font-semibold">{title}</h3>
          <button onClick={onClose} className="text-[#A6A29A] hover:text-[#F4F0E6] transition-colors"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Images Section ──────────────────────────────────────────────
function ImagesSection({ images, onUpdate }: { images: string[]; onUpdate: (imgs: string[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState("");

  const add = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    onUpdate([...images, trimmed]);
    setUrl("");
    setAdding(false);
  };

  const remove = (i: number) => onUpdate(images.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {images.map((src, i) => (
        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
          <img src={src} alt="" className="w-full h-full object-cover" />
          <button
            onClick={() => remove(i)}
            className="absolute top-1 right-1 w-5 h-5 bg-[#D95D5D] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ))}
      {adding ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add(); if (e.key === "Escape") setAdding(false); }}
            placeholder="https://..."
            className="bg-[#10141C] border border-[#2A3040] rounded-lg px-2 py-1 text-[#F4F0E6] text-xs w-48 focus:border-[#C9A75F] focus:outline-none"
          />
          <button onClick={add} className="text-[#3BB273] hover:opacity-80"><Check className="w-4 h-4" /></button>
          <button onClick={() => setAdding(false)} className="text-[#A6A29A] hover:opacity-80"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-20 h-20 border-2 border-dashed border-[#2A3040] hover:border-[#C9A75F] rounded-lg flex items-center justify-center text-[#A6A29A] hover:text-[#C9A75F] transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// ─── Rates Section ───────────────────────────────────────────────
function RatesSection({ roomId, initialRates }: { roomId: string; initialRates: Rate[] }) {
  const [rates, setRates] = useState<Rate[]>(initialRates);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ year: String(new Date().getFullYear()), month: "5", price: "", cleaningFee: "" });
  const [saving, setSaving] = useState(false);

  const save = async (newRates: Rate[]) => {
    setSaving(true);
    try {
      const updated = await apiFetch("PUT", `/api/rooms/${roomId}/rates`, { rates: newRates });
      setRates(updated);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = (i: number) => {
    const next = rates.filter((_, idx) => idx !== i);
    save(next);
  };

  const add = () => {
    if (!form.price) return;
    const next = [...rates, {
      year: Number(form.year),
      month: Number(form.month),
      price: Number(form.price),
      cleaningFee: Number(form.cleaningFee) || 0,
    }];
    save(next);
    setAdding(false);
    setForm({ year: String(new Date().getFullYear()), month: "5", price: "", cleaningFee: "" });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#A6A29A] text-[10px] uppercase tracking-wider">Listino Mensile</span>
        {saving && <span className="text-[#A6A29A] text-[10px]">salvataggio...</span>}
      </div>
      <div className="flex flex-wrap gap-1.5 items-center">
        {rates
          .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
          .map((r, i) => (
            <span key={i} className="flex items-center gap-1 bg-[#10141C] border border-[#2A3040] rounded px-2 py-1 text-xs text-[#F4F0E6]">
              {r.year}-{String(r.month).padStart(2,"0")}
              <span className="text-[#C9A75F] font-semibold ml-1">€{r.price}</span>
              <button onClick={() => remove(i)} className="text-[#A6A29A] hover:text-[#D95D5D] ml-1 transition-colors">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        {adding ? (
          <div className="flex items-center gap-1 flex-wrap">
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm(f => ({ ...f, year: e.target.value }))}
              className="bg-[#10141C] border border-[#2A3040] rounded px-2 py-1 text-[#F4F0E6] text-xs w-16 focus:border-[#C9A75F] focus:outline-none"
              placeholder="Anno"
            />
            <select
              value={form.month}
              onChange={(e) => setForm(f => ({ ...f, month: e.target.value }))}
              className="bg-[#10141C] border border-[#2A3040] rounded px-2 py-1 text-[#F4F0E6] text-xs focus:border-[#C9A75F] focus:outline-none"
            >
              {MONTH_NAMES.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
            </select>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
              className="bg-[#10141C] border border-[#2A3040] rounded px-2 py-1 text-[#F4F0E6] text-xs w-20 focus:border-[#C9A75F] focus:outline-none"
              placeholder="€ prezzo"
            />
            <input
              type="number"
              value={form.cleaningFee}
              onChange={(e) => setForm(f => ({ ...f, cleaningFee: e.target.value }))}
              className="bg-[#10141C] border border-[#2A3040] rounded px-2 py-1 text-[#F4F0E6] text-xs w-20 focus:border-[#C9A75F] focus:outline-none"
              placeholder="€ pulizie"
            />
            <button onClick={add} className="text-[#3BB273] hover:opacity-80 transition-opacity"><Check className="w-4 h-4" /></button>
            <button onClick={() => setAdding(false)} className="text-[#A6A29A] hover:opacity-80 transition-opacity"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 border border-dashed border-[#2A3040] hover:border-[#C9A75F] text-[#A6A29A] hover:text-[#C9A75F] rounded px-2 py-1 text-xs transition-colors"
          >
            <Plus className="w-3 h-3" /> Mese
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Room Card ───────────────────────────────────────────────────
function RoomCard({
  room,
  propertyId,
  onUpdate,
  onDelete,
}: {
  room: Room;
  propertyId: string;
  onUpdate: (r: Room) => void;
  onDelete: () => void;
}) {
  const [editModal, setEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [form, setForm] = useState({ name: room.name, capacity: String(room.capacity), description: room.description ?? "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  const saveEdit = async () => {
    if (!form.name.trim()) { setErr("Nome obbligatorio"); return; }
    setSaving(true); setErr(null);
    try {
      const updated = await apiFetch("PATCH", `/api/rooms/${room.id}`, {
        name: form.name.trim(),
        capacity: Number(form.capacity) || 1,
        description: form.description || null,
      });
      onUpdate({ ...room, ...updated });
      setEditModal(false);
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    try { await apiFetch("DELETE", `/api/rooms/${room.id}`); onDelete(); }
    catch (e) { alert((e as Error).message); }
  };

  const updateImages = async (imgs: string[]) => {
    try {
      const updated = await apiFetch("PATCH", `/api/rooms/${room.id}`, { images: imgs });
      onUpdate({ ...room, images: updated.images ?? imgs });
    } catch (e) { alert((e as Error).message); }
  };

  return (
    <div className="bg-[#10141C] border border-[#2A3040] rounded-xl p-4">
      {/* Room header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h4 className="text-[#F4F0E6] font-semibold">{room.name}</h4>
          <p className="text-[#A6A29A] text-xs">Capacità: {room.capacity} ospit{room.capacity === 1 ? "e" : "i"}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setForm({ name: room.name, capacity: String(room.capacity), description: room.description ?? "" }); setEditModal(true); }}
            className="flex items-center gap-1 border border-[#2A3040] text-[#A6A29A] hover:text-[#F4F0E6] rounded-lg px-2.5 py-1.5 text-xs transition-colors">
            <Edit2 className="w-3 h-3" /> Modifica
          </button>
          <Link href="/new-booking"
            className="flex items-center gap-1 border border-[#2A3040] text-[#4A90E2] hover:border-[#4A90E2] rounded-lg px-2.5 py-1.5 text-xs transition-colors">
            <Calendar className="w-3 h-3" /> Calendario
          </Link>
          <button onClick={() => setDeleteConfirm(true)}
            className="border border-[#D95D5D]/30 text-[#D95D5D] hover:bg-[#D95D5D]/10 rounded-lg p-1.5 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Room images */}
      <div className="mb-4 mt-3">
        <ImagesSection images={room.images} onUpdate={updateImages} />
      </div>

      {/* Monthly rates */}
      <RatesSection roomId={room.id} initialRates={room.monthlyRates} />

      {/* Edit modal */}
      {editModal && (
        <Modal title="Modifica Camera" onClose={() => setEditModal(false)}>
          <div className="space-y-3">
            <div><label className={LABEL}>Nome *</label>
              <input className={INPUT} value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className={LABEL}>Capacità</label>
              <input type="number" min={1} className={INPUT} value={form.capacity} onChange={(e) => setForm(f => ({ ...f, capacity: e.target.value }))} /></div>
            <div><label className={LABEL}>Descrizione</label>
              <textarea rows={3} className={INPUT + " resize-none"} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            {err && <p className="text-[#D95D5D] text-xs">{err}</p>}
            <button onClick={saveEdit} disabled={saving} className="w-full bg-[#C9A75F] hover:bg-[#E0C27A] disabled:opacity-50 text-[#070A0D] font-semibold rounded-lg py-2.5 text-sm transition-colors">
              {saving ? "Salvataggio..." : "Salva"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <Modal title="Elimina Camera" onClose={() => setDeleteConfirm(false)}>
          <p className="text-[#A6A29A] text-sm mb-5">Eliminare <span className="text-[#F4F0E6] font-medium">{room.name}</span>? L&apos;azione è irreversibile.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(false)} className="flex-1 border border-[#2A3040] text-[#A6A29A] rounded-lg py-2 text-sm hover:text-[#F4F0E6] transition-colors">Annulla</button>
            <button onClick={confirmDelete} className="flex-1 bg-[#D95D5D] hover:bg-[#C04A4A] text-white font-semibold rounded-lg py-2 text-sm transition-colors">Elimina</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Collaborators Section ───────────────────────────────────────
function CollaboratorsSection({ propertyId, initial }: { propertyId: string; initial: Collaborator[] }) {
  const [collabs, setCollabs] = useState<Collaborator[]>(initial);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  const add = async () => {
    if (!nickname.trim()) return;
    setLoading(true); setErr(null);
    try {
      const c = await apiFetch("POST", `/api/properties/${propertyId}/collaborators`, { nickname: nickname.trim() });
      setCollabs(prev => [...prev, c]);
      setNickname("");
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  };

  const remove = async (userId: string) => {
    try {
      await apiFetch("DELETE", `/api/properties/${propertyId}/collaborators/${userId}`);
      setCollabs(prev => prev.filter(c => c.userId !== userId));
    } catch (e) { alert((e as Error).message); }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-3.5 h-3.5 text-[#A6A29A]" />
        <span className="text-[#A6A29A] text-[10px] uppercase tracking-wider">Collaboratori (Concierge / Owner)</span>
      </div>
      <div className="flex gap-2 mb-2">
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Inserisci nickname collaboratore..."
          className={INPUT}
        />
        <button onClick={add} disabled={loading}
          className="shrink-0 bg-[#C9A75F] hover:bg-[#E0C27A] disabled:opacity-50 text-[#070A0D] font-semibold rounded-lg px-4 text-sm transition-colors">
          Aggiungi
        </button>
      </div>
      {err && <p className="text-[#D95D5D] text-xs mb-2">{err}</p>}
      <div className="flex flex-wrap gap-2">
        {collabs.map((c) => (
          <span key={c.userId} className="flex items-center gap-1.5 bg-[#10141C] border border-[#2A3040] rounded-full px-3 py-1 text-xs text-[#F4F0E6]">
            {c.user.nickname}
            <button onClick={() => remove(c.userId)} className="text-[#A6A29A] hover:text-[#D95D5D] transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {collabs.length === 0 && <p className="text-[#A6A29A] text-xs">Nessun collaboratore.</p>}
      </div>
    </div>
  );
}

// ─── Property Panel ──────────────────────────────────────────────
function PropertyPanel({
  property,
  onUpdate,
  onDelete,
}: {
  property: Property;
  onUpdate: (p: Property) => void;
  onDelete: () => void;
}) {
  const [editModal, setEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [form, setForm] = useState({ name: property.name, location: property.location, description: property.description ?? "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  // Add room form
  const [roomForm, setRoomForm] = useState({ name: "", capacity: "2", description: "" });
  const [roomSaving, setRoomSaving] = useState(false);
  const [roomErr, setRoomErr] = useState<string|null>(null);

  const saveEdit = async () => {
    if (!form.name.trim() || !form.location.trim()) { setErr("Nome e posizione obbligatori"); return; }
    setSaving(true); setErr(null);
    try {
      const updated = await apiFetch("PATCH", `/api/properties/${property.id}`, {
        name: form.name.trim(), location: form.location.trim(), description: form.description || null,
      });
      onUpdate({ ...property, name: updated.name, location: updated.location, description: updated.description });
      setEditModal(false);
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    try { await apiFetch("DELETE", `/api/properties/${property.id}`); onDelete(); }
    catch (e) { alert((e as Error).message); }
  };

  const addRoom = async () => {
    if (!roomForm.name.trim()) { setRoomErr("Nome obbligatorio"); return; }
    setRoomSaving(true); setRoomErr(null);
    try {
      const room = await apiFetch("POST", `/api/properties/${property.id}/rooms`, {
        name: roomForm.name.trim(),
        capacity: Number(roomForm.capacity) || 1,
        description: roomForm.description || null,
      });
      onUpdate({ ...property, rooms: [...property.rooms, { ...room, images: [], monthlyRates: [] }] });
      setRoomForm({ name: "", capacity: "2", description: "" });
    } catch (e) { setRoomErr((e as Error).message); }
    finally { setRoomSaving(false); }
  };

  const updateRoom = (updated: Room) => {
    onUpdate({ ...property, rooms: property.rooms.map(r => r.id === updated.id ? updated : r) });
  };

  const deleteRoom = (roomId: string) => {
    onUpdate({ ...property, rooms: property.rooms.filter(r => r.id !== roomId) });
  };

  const updatePropertyImages = async (imgs: string[]) => {
    try {
      const updated = await apiFetch("PATCH", `/api/properties/${property.id}`, { images: imgs });
      onUpdate({ ...property, images: updated.images ?? imgs });
    } catch (e) { alert((e as Error).message); }
  };

  return (
    <div className="bg-[#151A24] border border-[#2A3040] rounded-2xl overflow-hidden">
      {/* Property header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#2A3040]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[#C9A75F] text-xl font-bold" style={{ fontFamily: "serif" }}>{property.name}</h2>
            <div className="flex items-center gap-1 mt-1 text-[#A6A29A] text-sm">
              <MapPin className="w-3.5 h-3.5 text-[#D95D5D]" />
              {property.location}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setForm({ name: property.name, location: property.location, description: property.description ?? "" }); setEditModal(true); }}
              className="flex items-center gap-1.5 border border-[#2A3040] text-[#A6A29A] hover:text-[#F4F0E6] rounded-lg px-3 py-1.5 text-xs transition-colors">
              <Edit2 className="w-3 h-3" /> Modifica
            </button>
            <button onClick={() => setDeleteConfirm(true)}
              className="border border-[#D95D5D]/30 text-[#D95D5D] hover:bg-[#D95D5D]/10 rounded-lg p-1.5 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
            <span className="bg-[#10141C] border border-[#2A3040] text-[#F4F0E6] text-xs rounded-lg px-3 py-1.5 font-medium">
              {property.rooms.length} Unità
            </span>
          </div>
        </div>
        {property.description && (
          <p className="text-[#A6A29A] text-sm mt-3 leading-relaxed">{property.description}</p>
        )}
        <div className="mt-4">
          <ImagesSection images={property.images} onUpdate={updatePropertyImages} />
        </div>
      </div>

      {/* Body: rooms + right panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        {/* Left: rooms */}
        <div className="p-6 space-y-4 border-r border-[#2A3040]">
          {property.rooms.length === 0 ? (
            <p className="text-[#A6A29A] text-sm text-center py-8">Nessuna camera. Aggiungine una dal pannello a destra.</p>
          ) : (
            property.rooms.map((room) => (
              <RoomCard key={room.id} room={room} propertyId={property.id} onUpdate={updateRoom} onDelete={() => deleteRoom(room.id)} />
            ))
          )}
        </div>

        {/* Right panel */}
        <div className="p-6 space-y-8">
          {/* Add room form */}
          <div>
            <p className="text-[#A6A29A] text-[10px] uppercase tracking-wider mb-4">Nuova Camera</p>
            <div className="space-y-3">
              <div>
                <label className={LABEL}>Nome</label>
                <input className={INPUT} value={roomForm.name} onChange={(e) => setRoomForm(f => ({ ...f, name: e.target.value }))} placeholder="es. Deluxe Suite" />
              </div>
              <div>
                <label className={LABEL}>Capacità</label>
                <input type="number" min={1} className={INPUT} value={roomForm.capacity} onChange={(e) => setRoomForm(f => ({ ...f, capacity: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Descrizione</label>
                <textarea rows={3} className={INPUT + " resize-none"} value={roomForm.description} onChange={(e) => setRoomForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrizione iniziale..." />
              </div>
              {roomErr && <p className="text-[#D95D5D] text-xs">{roomErr}</p>}
              <button onClick={addRoom} disabled={roomSaving}
                className="w-full bg-[#C9A75F] hover:bg-[#E0C27A] disabled:opacity-50 text-[#070A0D] font-semibold rounded-lg py-2.5 text-xs tracking-widest uppercase transition-colors">
                {roomSaving ? "..." : "Aggiungi Camera"}
              </button>
            </div>
          </div>

          {/* Collaborators */}
          <CollaboratorsSection propertyId={property.id} initial={property.collaborators} />
        </div>
      </div>

      {/* Edit modal */}
      {editModal && (
        <Modal title="Modifica Proprietà" onClose={() => setEditModal(false)}>
          <div className="space-y-3">
            <div><label className={LABEL}>Nome *</label>
              <input className={INPUT} value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className={LABEL}>Posizione *</label>
              <input className={INPUT} value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div><label className={LABEL}>Descrizione</label>
              <textarea rows={4} className={INPUT + " resize-none"} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            {err && <p className="text-[#D95D5D] text-xs">{err}</p>}
            <button onClick={saveEdit} disabled={saving}
              className="w-full bg-[#C9A75F] hover:bg-[#E0C27A] disabled:opacity-50 text-[#070A0D] font-semibold rounded-lg py-2.5 text-sm transition-colors">
              {saving ? "Salvataggio..." : "Salva Modifiche"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <Modal title="Elimina Proprietà" onClose={() => setDeleteConfirm(false)}>
          <p className="text-[#A6A29A] text-sm mb-5">Eliminare <span className="text-[#F4F0E6] font-medium">{property.name}</span>? Verranno eliminate anche tutte le stanze e prenotazioni associate.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(false)} className="flex-1 border border-[#2A3040] text-[#A6A29A] rounded-lg py-2 text-sm hover:text-[#F4F0E6] transition-colors">Annulla</button>
            <button onClick={confirmDelete} className="flex-1 bg-[#D95D5D] hover:bg-[#C04A4A] text-white font-semibold rounded-lg py-2 text-sm transition-colors">Elimina</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────
export function PropertiesClient({ properties: initial }: { properties: Property[] }) {
  const [properties, setProperties] = useState<Property[]>(initial);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  const create = async () => {
    if (!form.name.trim() || !form.location.trim()) { setErr("Nome e posizione obbligatori"); return; }
    setSaving(true); setErr(null);
    try {
      const p = await apiFetch("POST", "/api/properties", { name: form.name.trim(), location: form.location.trim(), description: form.description || null });
      setProperties(prev => [{ ...p, rooms: [], collaborators: [], images: [] }, ...prev]);
      setCreateModal(false);
      setForm({ name: "", location: "", description: "" });
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F0E6]">Le Tue Proprietà</h1>
          <p className="text-[#A6A29A] text-sm mt-1">{properties.length} struttur{properties.length === 1 ? "a" : "e"}</p>
        </div>
        <button onClick={() => { setCreateModal(true); setErr(null); setForm({ name: "", location: "", description: "" }); }}
          className="flex items-center gap-2 bg-[#C9A75F] hover:bg-[#E0C27A] text-[#070A0D] font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors">
          <Plus className="w-4 h-4" /> Nuova Proprietà
        </button>
      </div>

      {/* Empty state */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="text-[#F4F0E6] font-semibold mb-2">Nessuna proprietà</h3>
          <p className="text-[#A6A29A] text-sm max-w-xs">Inizia aggiungendo la tua prima struttura con il pulsante qui sopra.</p>
        </div>
      )}

      {/* Properties list */}
      <div className="space-y-6">
        {properties.map((p) => (
          <PropertyPanel
            key={p.id}
            property={p}
            onUpdate={(updated) => setProperties(prev => prev.map(x => x.id === updated.id ? updated : x))}
            onDelete={() => setProperties(prev => prev.filter(x => x.id !== p.id))}
          />
        ))}
      </div>

      {/* Create modal */}
      {createModal && (
        <Modal title="Nuova Proprietà" onClose={() => setCreateModal(false)}>
          <div className="space-y-3">
            <div><label className={LABEL}>Nome *</label>
              <input className={INPUT} value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="es. Villa Marina" /></div>
            <div><label className={LABEL}>Posizione *</label>
              <input className={INPUT} value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} placeholder="es. Porto di Ibiza" /></div>
            <div><label className={LABEL}>Descrizione</label>
              <textarea rows={4} className={INPUT + " resize-none"} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrizione della struttura..." /></div>
            {err && <p className="text-[#D95D5D] text-xs">{err}</p>}
            <button onClick={create} disabled={saving}
              className="w-full bg-[#C9A75F] hover:bg-[#E0C27A] disabled:opacity-50 text-[#070A0D] font-semibold rounded-lg py-2.5 text-sm transition-colors">
              {saving ? "Creazione..." : "Crea Proprietà"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
