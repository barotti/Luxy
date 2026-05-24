import { prisma } from "@/lib/db";
import { Plus } from "lucide-react";

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    include: {
      rooms: true,
      collaborators: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F0E6]">Proprietà</h1>
          <p className="text-[#A6A29A] text-sm mt-1">
            {properties.length} struttur{properties.length === 1 ? "a" : "e"}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#C9A75F] hover:bg-[#E0C27A] text-[#070A0D] font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors">
          <Plus className="w-4 h-4" />
          Nuova Proprietà
        </button>
      </div>

      {/* Empty state */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="text-[#F4F0E6] font-semibold mb-2">
            Nessuna proprietà
          </h3>
          <p className="text-[#A6A29A] text-sm max-w-xs">
            Inizia aggiungendo la tua prima struttura.
          </p>
        </div>
      )}

      {/* Grid */}
      {properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-[#151A24] border border-[#2A3040] rounded-xl p-6 hover:border-[#C9A75F]/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-[#F4F0E6] font-semibold">
                    {property.name}
                  </h3>
                  <p className="text-[#A6A29A] text-sm mt-0.5">
                    {property.location}
                  </p>
                </div>
              </div>
              {property.description && (
                <p className="text-[#A6A29A] text-sm mb-4 line-clamp-2">
                  {property.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-[#A6A29A] border-t border-[#2A3040] pt-3">
                <span>{property.rooms.length} stanz{property.rooms.length === 1 ? "a" : "e"}</span>
                <span>{property.collaborators.length} collaborator{property.collaborators.length === 1 ? "e" : "i"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
