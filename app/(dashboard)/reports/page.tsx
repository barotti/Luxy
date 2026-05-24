import { prisma } from "@/lib/db";
import { formatEuro } from "@/lib/utils";

export default async function ReportsPage() {
  const bookings = await prisma.booking.findMany({
    include: { property: true, room: true, collaborator: true, paymentMethod: true },
  });

  const finalizzati = bookings.filter((b) => b.status === "finalizzato");

  const fatturatoLordo = finalizzati.reduce((s, b) => s + b.totalAmount, 0);
  const nettoAtteso = finalizzati.reduce((s, b) => s + b.ownerAmount, 0);
  const incassatoReale = finalizzati.reduce((s, b) => s + b.collectedAmount, 0);
  const commissioniPagate = finalizzati.reduce((s, b) => s + b.feeAmount, 0);

  const kpis = [
    { label: "Fatturato Lordo", value: formatEuro(fatturatoLordo), color: "text-[#C9A75F]" },
    { label: "Netto Atteso", value: formatEuro(nettoAtteso), color: "text-[#4A90E2]" },
    { label: "Incassato Reale", value: formatEuro(incassatoReale), color: "text-[#3BB273]" },
    { label: "Commissioni Pagate", value: formatEuro(commissioniPagate), color: "text-[#A6A29A]" },
    { label: "Prenotazioni Finalizzate", value: String(finalizzati.length), color: "text-[#F4F0E6]" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F4F0E6]">Report</h1>
        <p className="text-[#A6A29A] text-sm mt-1">Analisi economica e performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[#151A24] border border-[#2A3040] rounded-xl p-5"
          >
            <p className="text-[#A6A29A] text-xs uppercase tracking-wider mb-2">
              {kpi.label}
            </p>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Empty */}
      {finalizzati.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-[#F4F0E6] font-semibold mb-2">Nessun dato disponibile</h3>
          <p className="text-[#A6A29A] text-sm max-w-xs">
            I report si popolano con le prenotazioni finalizzate.
          </p>
        </div>
      )}
    </div>
  );
}
