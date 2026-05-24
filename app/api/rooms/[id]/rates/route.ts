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

  try {
    const { id: roomId } = await params;
    const body = await req.json();
    const { rates } = body;

    if (!Array.isArray(rates)) {
      return NextResponse.json({ error: "Rates deve essere un array" }, { status: 400 });
    }

    const cleanRates = new Map<
      string,
      { year: number; month: number; price: number; cleaningFee: number }
    >();

    for (const rate of rates) {
      if (
        typeof rate.year !== "number" ||
        typeof rate.month !== "number" ||
        typeof rate.price !== "number" ||
        typeof rate.cleaningFee !== "number" ||
        !Number.isInteger(rate.year) ||
        !Number.isInteger(rate.month) ||
        !Number.isFinite(rate.price) ||
        !Number.isFinite(rate.cleaningFee) ||
        rate.month < 1 ||
        rate.month > 12 ||
        rate.price < 0 ||
        rate.cleaningFee < 0
      ) {
        return NextResponse.json({ error: "Dati listino non validi" }, { status: 400 });
      }

      cleanRates.set(`${rate.year}-${rate.month}`, {
        year: rate.year,
        month: rate.month,
        price: rate.price,
        cleaningFee: rate.cleaningFee,
      });
    }

    const normalizedRates = [...cleanRates.values()];
    const keepKeys = normalizedRates.map((rate) => ({
      year: rate.year,
      month: rate.month,
    }));

    await prisma.monthlyRate.deleteMany({
      where: {
        roomId,
        ...(keepKeys.length > 0 ? { NOT: keepKeys } : {}),
      },
    });

    for (const rate of normalizedRates) {
      await prisma.monthlyRate.upsert({
        where: {
          roomId_year_month: {
            roomId,
            year: rate.year,
            month: rate.month,
          },
        },
        update: {
          price: rate.price,
          cleaningFee: rate.cleaningFee,
        },
        create: {
          roomId,
          year: rate.year,
          month: rate.month,
          price: rate.price,
          cleaningFee: rate.cleaningFee,
        },
      });
    }

    const updatedRates = await prisma.monthlyRate.findMany({
      where: { roomId },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    return NextResponse.json(updatedRates);
  } catch (error) {
    console.error("Monthly rates save failed", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio del listino mensile" },
      { status: 500 }
    );
  }
}
