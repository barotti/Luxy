import { prisma } from "@/lib/db";
import { PropertiesClient } from "@/components/PropertiesClient";

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    include: {
      rooms: {
        include: {
          monthlyRates: { orderBy: [{ year: "asc" }, { month: "asc" }] },
        },
        orderBy: { name: "asc" },
      },
      collaborators: {
        include: { user: { select: { id: true, nickname: true, role: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PropertiesClient
      properties={properties.map((p) => ({
        id: p.id,
        name: p.name,
        location: p.location,
        description: p.description,
        images: p.images,
        rooms: p.rooms.map((r) => ({
          id: r.id,
          name: r.name,
          capacity: r.capacity,
          description: r.description,
          images: r.images,
          monthlyRates: r.monthlyRates,
        })),
        collaborators: p.collaborators.map((c) => ({
          id: c.id,
          userId: c.userId,
          roleOnProperty: c.roleOnProperty,
          user: c.user,
        })),
      }))}
    />
  );
}
