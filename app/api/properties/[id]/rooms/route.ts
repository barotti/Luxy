import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: propertyId } = await params;
  const body = await req.json();
  const { name, capacity, description } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "Nome camera obbligatorio" }, { status: 400 });
  }

  const cap = Number(capacity);
  if (!capacity || isNaN(cap) || cap < 1) {
    return NextResponse.json({ error: "Capacità minima 1" }, { status: 400 });
  }

  const room = await prisma.room.create({
    data: {
      propertyId,
      name: name.trim(),
      capacity: cap,
      description: description ? String(description).trim() : null,
    },
  });

  return NextResponse.json(room, { status: 201 });
}
