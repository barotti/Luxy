import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { checkIn, checkOut } = body;

  if (!checkIn || !checkOut) {
    return NextResponse.json({ error: "checkIn e checkOut obbligatori" }, { status: 400 });
  }

  const newCheckIn = new Date(checkIn);
  const newCheckOut = new Date(checkOut);
  const nights = Math.round(
    (newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (nights <= 0) {
    return NextResponse.json({ error: "checkOut deve essere dopo checkIn" }, { status: 400 });
  }

  const existing = await prisma.booking.findUnique({ where: { id }, select: { roomId: true } });
  if (!existing) return NextResponse.json({ error: "Prenotazione non trovata" }, { status: 404 });

  const overlap = await prisma.booking.findFirst({
    where: {
      id: { not: id },
      roomId: existing.roomId,
      status: { not: "cancellato" },
      checkIn: { lt: newCheckOut },
      checkOut: { gt: newCheckIn },
    },
  });

  if (overlap) {
    return NextResponse.json(
      { error: "Le date si sovrappongono con un'altra prenotazione" },
      { status: 409 }
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { checkIn: newCheckIn, checkOut: newCheckOut, nights },
  });

  return NextResponse.json({
    ...updated,
    checkIn: updated.checkIn.toISOString().slice(0, 10),
    checkOut: updated.checkOut.toISOString().slice(0, 10),
  });
}
