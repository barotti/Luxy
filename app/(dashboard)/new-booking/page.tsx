import { prisma } from "@/lib/db";

export default async function NewBookingPage() {
  const properties = await prisma.property.findMany({
    include: { rooms: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F4F0E6]">Nuova Prenotazione</h1>
        <p className="text-[#A6A29A] text-sm mt-1">
          Inserisci i dati per creare una nuova prenotazione
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blocco 1: Stanza & Date */}
        <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6">
          <h2 className="text-[#F4F0E6] font-semibold mb-5 flex items-center gap-2">
            <span>🗓️</span> Stanza & Date
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
                Stanza *
              </label>
              <select className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm focus:border-[#C9A75F] focus:outline-none transition-colors">
                <option value="">Seleziona struttura e stanza...</option>
                {properties.map((property: (typeof properties)[number]) =>
                  property.rooms.map((room: (typeof property.rooms)[number]) => (
                    <option key={room.id} value={room.id}>
                      {property.name} — {room.name}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
                  Check-in *
                </label>
                <input
                  type="date"
                  className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm focus:border-[#C9A75F] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
                  Check-out *
                </label>
                <input
                  type="date"
                  className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm focus:border-[#C9A75F] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Riepilogo calcolo */}
            <div className="bg-[#10141C] rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#A6A29A]">
                <span>Notti</span>
                <span className="text-[#F4F0E6]">—</span>
              </div>
              <div className="flex justify-between text-[#A6A29A]">
                <span>Soggiorno</span>
                <span className="text-[#F4F0E6]">—</span>
              </div>
              <div className="flex justify-between text-[#A6A29A]">
                <span>Pulizie</span>
                <span className="text-[#F4F0E6]">—</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-[#2A3040] pt-2">
                <span className="text-[#F4F0E6]">Totale</span>
                <span className="text-[#C9A75F]">—</span>
              </div>
            </div>
          </div>
        </div>

        {/* Blocco 2: Dati Cliente */}
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
                defaultValue={1}
                className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm focus:border-[#C9A75F] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
                Note
              </label>
              <textarea
                rows={3}
                placeholder="Note aggiuntive..."
                className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm placeholder-[#A6A29A] focus:border-[#C9A75F] focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <button className="px-6 py-2.5 text-sm border border-[#2A3040] text-[#A6A29A] hover:text-[#F4F0E6] hover:border-[#F4F0E6] rounded-lg transition-colors">
          Annulla
        </button>
        <button className="px-6 py-2.5 text-sm bg-[#C9A75F] hover:bg-[#E0C27A] text-[#070A0D] font-semibold rounded-lg transition-colors">
          Salva Prenotazione
        </button>
      </div>
    </div>
  );
}
