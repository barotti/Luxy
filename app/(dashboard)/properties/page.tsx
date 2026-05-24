import { prisma } from "@/lib/db";
import { PropertiesClient } from "@/components/PropertiesClient";

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    include: { rooms: { orderBy: { name: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PropertiesClient
      properties={properties.map((p) => ({
        id: p.id,
        name: p.name,
        location: p.location,
        description: p.description,
        rooms: p.rooms.map((r) => ({
          id: r.id,
          name: r.name,
          capacity: r.capacity,
          description: r.description,
        })),
      }))}
    />
  );
}
