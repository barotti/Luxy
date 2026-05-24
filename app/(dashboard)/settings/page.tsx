import { prisma } from "@/lib/db";
import { Plus, Trash2 } from "lucide-react";

export default async function SettingsPage() {
  const paymentMethods = await prisma.paymentMethod.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F4F0E6]">Impostazioni</h1>
        <p className="text-[#A6A29A] text-sm mt-1">Metodi di pagamento e sicurezza account</p>
      </div>

      {/* Metodi di pagamento */}
      <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[#F4F0E6] font-semibold">Metodi di Pagamento</h2>
          <button className="flex items-center gap-1.5 text-sm bg-[#C9A75F] hover:bg-[#E0C27A] text-[#070A0D] font-semibold rounded-lg px-3 py-1.5 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Aggiungi
          </button>
        </div>

        {paymentMethods.length === 0 ? (
          <p className="text-[#A6A29A] text-sm text-center py-6">
            Nessun metodo configurato.
          </p>
        ) : (
          <div className="space-y-2">
            {paymentMethods.map((pm) => (
              <div
                key={pm.id}
                className="flex items-center justify-between bg-[#10141C] rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${pm.active ? "bg-[#3BB273]" : "bg-[#A6A29A]"}`}
                  />
                  <span className="text-[#F4F0E6] text-sm">{pm.name}</span>
                </div>
                <button className="text-[#A6A29A] hover:text-[#D95D5D] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cambio password */}
      <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6">
        <h2 className="text-[#F4F0E6] font-semibold mb-5">Cambia Password</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
              Password attuale *
            </label>
            <input
              type="password"
              className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm focus:border-[#C9A75F] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
              Nuova password * (min. 6 caratteri)
            </label>
            <input
              type="password"
              className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm focus:border-[#C9A75F] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
              Conferma nuova password *
            </label>
            <input
              type="password"
              className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm focus:border-[#C9A75F] focus:outline-none transition-colors"
            />
          </div>

          <button className="w-full bg-[#C9A75F] hover:bg-[#E0C27A] text-[#070A0D] font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors mt-2">
            Aggiorna Password
          </button>
        </div>
      </div>
    </div>
  );
}
