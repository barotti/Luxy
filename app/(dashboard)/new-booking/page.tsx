import { prisma } from "@/lib/db";
import { NewBookingClient } from "@/components/NewBookingClient";

export default async function NewBookingPage() {
  const properties = await prisma.property.findMany({
    include: {
      rooms: {
        select: { id: true, name: true, capacity: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <NewBookingClient
      properties={properties.map((p) => ({
        id: p.id,
        name: p.name,
        rooms: p.rooms,
      }))}
    />
  );
}
