import { prisma } from "@/lib/db";
import { BookingsClient } from "@/components/BookingsClient";

export default async function BookingsPage() {
  const [bookings, paymentMethods] = await Promise.all([
    prisma.booking.findMany({
      include: { property: true, room: true, paymentMethod: true },
      orderBy: { checkIn: "desc" },
    }),
    prisma.paymentMethod.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serialized = bookings.map((b) => ({
    id: b.id,
    clientFirstName: b.clientFirstName,
    clientLastName: b.clientLastName,
    checkIn: b.checkIn.toISOString().slice(0, 10),
    checkOut: b.checkOut.toISOString().slice(0, 10),
    nights: b.nights,
    stayAmount: b.stayAmount,
    cleaningAmount: b.cleaningAmount,
    ownerAmount: b.ownerAmount,
    feeAmount: b.feeAmount,
    totalAmount: b.totalAmount,
    collectedAmount: b.collectedAmount,
    status: b.status,
    notes: b.notes,
    property: { name: b.property.name },
    room: { name: b.room.name },
    paymentMethod: b.paymentMethod
      ? { id: b.paymentMethod.id, name: b.paymentMethod.name }
      : null,
  }));

  return <BookingsClient bookings={serialized} paymentMethods={paymentMethods} />;
}
