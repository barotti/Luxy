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
  const { name, capacity, description } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Nome camera non valido" }, { status: 400 });
    }
    data.name = name.trim();
  }
  if (capacity !== undefined) {
    const cap = Number(capacity);
    if (isNaN(cap) || cap < 1) {
      return NextResponse.json({ error: "Capacità minima 1" }, { status: 400 });
    }
    data.capacity = cap;
  }
  if (description !== undefined) {
    data.description = description ? String(description).trim() : null;
  }

  const room = await prisma.room.update({
    where: { id },
    data,
  });

  return NextResponse.json(room);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.room.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
