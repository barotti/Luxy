import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: roomId } = await params;
  const { searchParams } = request.nextUrl;
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  const [bookings, monthlyRate] = await Promise.all([
    prisma.booking.findMany({
      where: {
        roomId,
        status: { not: "cancellato" },
        checkIn: { lte: monthEnd },
        checkOut: { gte: monthStart },
      },
      include: {
        collaborator: { select: { nickname: true } },
      },
      orderBy: { checkIn: "asc" },
    }),
    prisma.monthlyRate.findUnique({
      where: { roomId_year_month: { roomId, year, month } },
    }),
  ]);

  const serialized = bookings.map((b) => ({
    ...b,
    checkIn: b.checkIn.toISOString().slice(0, 10),
    checkOut: b.checkOut.toISOString().slice(0, 10),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  return NextResponse.json({ bookings: serialized, monthlyRate });
}
