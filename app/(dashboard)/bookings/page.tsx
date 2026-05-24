import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { formatEuro, formatDate } from "@/lib/utils";

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: { property: true; room: true; collaborator: true; paymentMethod: true };
}>;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  in_trattativa: { label: "In Trattativa", color: "text-[#C9A75F] bg-[#C9A75F]/10 border-[#C9A75F]/20" },
  bloccato: { label: "Bloccato", color: "text-[#4A90E2] bg-[#4A90E2]/10 border-[#4A90E2]/20" },
  prenotato: { label: "Prenotato", color: "text-[#D95D5D] bg-[#D95D5D]/10 border-[#D95D5D]/20" },
  finalizzato: { label: "Finalizzato", color: "text-[#3BB273] bg-[#3BB273]/10 border-[#3BB273]/20" },
  cancellato: { label: "Cancellato", color: "text-[#A6A29A] bg-[#A6A29A]/10 border-[#A6A29A]/20" },
};

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      property: true,
      room: true,
      collaborator: true,
      paymentMethod: true,
    },
    orderBy: { checkIn: "desc" },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F0E6]">Prenotazioni</h1>
          <p className="text-[#A6A29A] text-sm mt-1">
            {bookings.length} prenotazion{bookings.length === 1 ? "e" : "i"}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🧾</div>
          <h3 className="text-[#F4F0E6] font-semibold mb-2">
            Nessuna prenotazione
          </h3>
          <p className="text-[#A6A29A] text-sm max-w-xs">
            Crea la prima prenotazione dalla sezione Nuova Prenotazione.
          </p>
        </div>
      )}

      {/* Table */}
      {bookings.length > 0 && (
        <div className="bg-[#151A24] border border-[#2A3040] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A3040]">
                  {["Cliente", "App./Stanza", "Date", "Soggiorno", "Pulizie", "Owner", "Fee", "Totale", "Stato", "Azioni"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[#A6A29A] text-xs uppercase tracking-wider px-4 py-3 font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: BookingWithRelations) => {
                  const status = STATUS_LABELS[b.status] ?? STATUS_LABELS.in_trattativa;
                  return (
                    <tr
                      key={b.id}
                      className="border-b border-[#2A3040] last:border-0 hover:bg-[#1A2030] transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-[#F4F0E6] whitespace-nowrap">
                        {b.clientFirstName} {b.clientLastName ?? ""}
                      </td>
                      <td className="px-4 py-3 text-[#A6A29A] whitespace-nowrap">
                        <span className="block text-[#F4F0E6]">{b.property.name}</span>
                        <span className="text-xs">{b.room.name}</span>
                      </td>
                      <td className="px-4 py-3 text-[#A6A29A] whitespace-nowrap">
                        <span className="block">{formatDate(b.checkIn)}</span>
                        <span className="text-xs">→ {formatDate(b.checkOut)}</span>
                      </td>
                      <td className="px-4 py-3 text-[#F4F0E6] whitespace-nowrap">{formatEuro(b.stayAmount)}</td>
                      <td className="px-4 py-3 text-[#A6A29A] whitespace-nowrap">{formatEuro(b.cleaningAmount)}</td>
                      <td className="px-4 py-3 text-[#F4F0E6] whitespace-nowrap">{formatEuro(b.ownerAmount)}</td>
                      <td className="px-4 py-3 text-[#C9A75F] whitespace-nowrap">{formatEuro(b.feeAmount)}</td>
                      <td className="px-4 py-3 font-semibold text-[#F4F0E6] whitespace-nowrap">{formatEuro(b.totalAmount)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex text-xs px-2 py-1 rounded border font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button className="text-xs text-[#4A90E2] hover:text-[#C9A75F] transition-colors">
                          Modifica
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
