import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    roomId,
    clientFirstName,
    clientLastName,
    clientPhone,
    clientEmail,
    guests,
    checkIn,
    checkOut,
    nights,
    stayAmount,
    cleaningAmount,
    ownerAmount,
    feeAmount,
    totalAmount,
    notes,
    status,
  } = body;

  if (!roomId || !clientFirstName || !checkIn || !checkOut || !nights) {
    return NextResponse.json({ error: "Dati obbligatori mancanti." }, { status: 400 });
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { propertyId: true },
  });
  if (!room) return NextResponse.json({ error: "Stanza non trovata." }, { status: 404 });

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const overlap = await prisma.booking.findFirst({
    where: {
      roomId,
      status: { not: "cancellato" },
      checkIn: { lt: checkOutDate },
      checkOut: { gt: checkInDate },
    },
  });
  if (overlap) {
    return NextResponse.json(
      { error: "Date sovrapposte con prenotazione esistente." },
      { status: 409 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      propertyId: room.propertyId,
      roomId,
      clientFirstName,
      clientLastName: clientLastName ?? null,
      clientPhone: clientPhone ?? null,
      clientEmail: clientEmail ?? null,
      guests: guests ?? 1,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      stayAmount: stayAmount ?? 0,
      cleaningAmount: cleaningAmount ?? 0,
      ownerAmount: ownerAmount ?? 0,
      feeAmount: feeAmount ?? 0,
      totalAmount: totalAmount ?? 0,
      status: status ?? "in_trattativa",
      notes: notes ?? null,
    },
  });

  return NextResponse.json(
    {
      ...booking,
      checkIn: booking.checkIn.toISOString().slice(0, 10),
      checkOut: booking.checkOut.toISOString().slice(0, 10),
    },
    { status: 201 }
  );
}
