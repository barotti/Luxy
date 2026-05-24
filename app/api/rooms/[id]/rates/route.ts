import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: roomId } = await params;

  const rates = await prisma.monthlyRate.findMany({
    where: { roomId },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  return NextResponse.json(rates);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: roomId } = await params;
  const body = await req.json();
  const { rates } = body;

  if (!Array.isArray(rates)) {
    return NextResponse.json({ error: "Rates deve essere un array" }, { status: 400 });
  }

  for (const rate of rates) {
    if (
      typeof rate.year !== "number" ||
      typeof rate.month !== "number" ||
      typeof rate.price !== "number" ||
      typeof rate.cleaningFee !== "number"
    ) {
      return NextResponse.json({ error: "Dati listino non validi" }, { status: 400 });
    }
  }

  // Neon HTTP adapter does not support interactive transactions — run sequentially
  await prisma.monthlyRate.deleteMany({ where: { roomId } });

  if (rates.length > 0) {
    await prisma.monthlyRate.createMany({
      data: rates.map((r: { year: number; month: number; price: number; cleaningFee: number }) => ({
        roomId,
        year: r.year,
        month: r.month,
        price: r.price,
        cleaningFee: r.cleaningFee,
      })),
    });
  }

  const updatedRates = await prisma.monthlyRate.findMany({
    where: { roomId },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });

  return NextResponse.json(updatedRates);
}
