"use client";

import { useState } from "react";

interface PaymentMethod {
  id: string;
  name: string;
  active: boolean;
}

const inputClass =
  "w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm placeholder-[#A6A29A] focus:border-[#C9A75F] focus:outline-none transition-colors";
const labelClass = "block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5";
const primaryBtn =
  "bg-[#C9A75F] hover:bg-[#E0C27A] text-[#070A0D] font-semibold px-4 py-2 rounded-lg text-sm transition-colors";
const secondaryBtn =
  "border border-[#2A3040] text-[#A6A29A] hover:text-[#F4F0E6] hover:border-[#F4F0E6] px-4 py-2 rounded-lg text-sm transition-colors";
const dangerBtn =
  "bg-[#D95D5D] hover:bg-[#C04A4A] text-white px-3 py-1.5 rounded-lg text-xs transition-colors font-semibold";

export function SettingsClient({
  paymentMethods: initial,
}: {
  paymentMethods: PaymentMethod[];
}) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initial);
  const [newMethodName, setNewMethodName] = useState("");
  const [addingMethod, setAddingMethod] = useState(false);
  const [methodError, setMethodError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deletingSaving, setDeletingSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // ─── Payment Methods ──────────────────────────────────────────────

  async function addMethod() {
    setMethodError(null);
    if (!newMethodName.trim()) {
      setMethodError("Nome metodo obbligatorio");
      return;
    }
    setAddingMethod(true);
    try {
      const res = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newMethodName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMethodError(data.error || "Errore nel salvataggio");
        return;
      }
      const created = await res.json();
      setPaymentMethods((prev) => [...prev, created]);
      setNewMethodName("");
    } catch {
      setMethodError("Errore di rete");
    } finally {
      setAddingMethod(false);
    }
  }

  async function deleteMethod(id: string) {
    setDeletingSaving(true);
    try {
      const res = await fetch(`/api/payment-methods/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setMethodError(data.error || "Errore nell'eliminazione");
        return;
      }
      setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
      setDeleteConfirm(null);
    } catch {
      setMethodError("Errore di rete");
    } finally {
      setDeletingSaving(false);
    }
  }

  // ─── Password Change ──────────────────────────────────────────────

  async function changePassword() {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Tutti i campi sono obbligatori");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("La nuova password deve avere almeno 6 caratteri");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("La nuova password e la conferma non coincidono");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        setPasswordError(data.error || "Errore nel cambio password");
        return;
      }
      setPasswordSuccess("Password aggiornata con successo");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Errore di rete");
    } finally {
      setPasswordSaving(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F4F0E6]" style={{ fontFamily: "Georgia, serif" }}>
          Impostazioni
        </h1>
        <p className="text-[#A6A29A] text-sm mt-1">Gestisci metodi di pagamento e sicurezza account</p>
      </div>

      {/* ─── Payment Methods Section ─── */}
      <section className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-[#C9A75F]/10 border border-[#C9A75F]/20 rounded-lg flex items-center justify-center">
            <span className="text-[#C9A75F] text-sm">₿</span>
          </div>
          <div>
            <h2 className="text-[#F4F0E6] font-semibold">Metodi di Pagamento</h2>
            <p className="text-[#A6A29A] text-xs">Gestisci i metodi accettati</p>
          </div>
        </div>

        {methodError && (
          <div className="bg-[#D95D5D]/10 border border-[#D95D5D]/30 text-[#D95D5D] text-sm rounded-lg px-4 py-2.5 mb-4">
            {methodError}
          </div>
        )}

        {/* Methods List */}
        {paymentMethods.length === 0 ? (
          <p className="text-[#A6A29A] text-sm text-center py-4 mb-4">Nessun metodo configurato</p>
        ) : (
          <div className="space-y-2 mb-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      method.active ? "bg-[#3BB273]" : "bg-[#A6A29A]"
                    }`}
                  />
                  <span className="text-[#F4F0E6] text-sm">{method.name}</span>
                </div>
                <button
                  onClick={() => setDeleteConfirm({ id: method.id, name: method.name })}
                  className="text-[#D95D5D] hover:text-[#C04A4A] text-xs px-2 py-1 border border-[#D95D5D]/30 hover:border-[#D95D5D] rounded transition-colors"
                >
                  Elimina
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Method Form */}
        <div className="flex gap-3">
          <input
            className={inputClass}
            placeholder="Es. Contanti, Banca, Wise..."
            value={newMethodName}
            onChange={(e) => setNewMethodName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addMethod(); }}
          />
          <button
            onClick={addMethod}
            disabled={addingMethod}
            className={primaryBtn + " whitespace-nowrap flex-shrink-0"}
          >
            {addingMethod ? "..." : "Aggiungi"}
          </button>
        </div>
      </section>

      {/* ─── Password Change Section ─── */}
      <section className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-[#4A90E2]/10 border border-[#4A90E2]/20 rounded-lg flex items-center justify-center">
            <span className="text-[#4A90E2] text-sm">🔒</span>
          </div>
          <div>
            <h2 className="text-[#F4F0E6] font-semibold">Sicurezza Account</h2>
            <p className="text-[#A6A29A] text-xs">Aggiorna la password di accesso</p>
          </div>
        </div>

        {passwordError && (
          <div className="bg-[#D95D5D]/10 border border-[#D95D5D]/30 text-[#D95D5D] text-sm rounded-lg px-4 py-2.5 mb-4">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="bg-[#3BB273]/10 border border-[#3BB273]/30 text-[#3BB273] text-sm rounded-lg px-4 py-2.5 mb-4">
            {passwordSuccess}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Password attuale *</label>
            <input
              type="password"
              className={inputClass}
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(null); setPasswordSuccess(null); }}
            />
          </div>
          <div>
            <label className={labelClass}>Nuova password *</label>
            <input
              type="password"
              className={inputClass}
              placeholder="Minimo 6 caratteri"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); setPasswordSuccess(null); }}
            />
          </div>
          <div>
            <label className={labelClass}>Conferma nuova password *</label>
            <input
              type="password"
              className={inputClass}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null); setPasswordSuccess(null); }}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={changePassword}
            disabled={passwordSaving}
            className={primaryBtn}
          >
            {passwordSaving ? "Aggiornamento..." : "Aggiorna Password"}
          </button>
        </div>
      </section>

      {/* ─── Delete Method Confirm ─── */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6 w-full max-w-sm">
            <h2 className="text-[#F4F0E6] font-semibold text-lg mb-2">Elimina metodo</h2>
            <p className="text-[#A6A29A] text-sm mb-6">
              Sei sicuro di voler eliminare il metodo{" "}
              <span className="text-[#F4F0E6] font-medium">{deleteConfirm.name}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className={secondaryBtn}>
                Annulla
              </button>
              <button
                onClick={() => deleteMethod(deleteConfirm.id)}
                disabled={deletingSaving}
                className={dangerBtn + " px-4 py-2 text-sm"}
              >
                {deletingSaving ? "Eliminazione..." : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
