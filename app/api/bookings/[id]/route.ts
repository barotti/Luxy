import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const {
    status,
    feeAmount,
    collectedAmount,
    paymentMethodId,
    notes,
    ownerAmount,
    totalAmount,
    stayAmount,
    cleaningAmount,
  } = body;

  const data: Record<string, unknown> = {};

  const validStatuses = ["in_trattativa", "bloccato", "prenotato", "finalizzato", "cancellato"];
  if (status !== undefined) {
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Stato non valido" }, { status: 400 });
    }
    data.status = status;
  }
  if (feeAmount !== undefined) data.feeAmount = Number(feeAmount);
  if (collectedAmount !== undefined) data.collectedAmount = Number(collectedAmount);
  if (paymentMethodId !== undefined) data.paymentMethodId = paymentMethodId || null;
  if (notes !== undefined) data.notes = notes || null;
  if (ownerAmount !== undefined) data.ownerAmount = Number(ownerAmount);
  if (totalAmount !== undefined) data.totalAmount = Number(totalAmount);
  if (stayAmount !== undefined) data.stayAmount = Number(stayAmount);
  if (cleaningAmount !== undefined) data.cleaningAmount = Number(cleaningAmount);

  const booking = await prisma.booking.update({
    where: { id },
    data,
    include: { property: true, room: true, paymentMethod: true },
  });

  return NextResponse.json(booking);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const booking = await prisma.booking.update({
    where: { id },
    data: { status: "cancellato" },
  });

  return NextResponse.json({ id: booking.id, status: booking.status });
}
