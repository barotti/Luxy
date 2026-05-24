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
  const { name, location, description } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Nome proprietà non valido" }, { status: 400 });
    }
    data.name = name.trim();
  }
  if (location !== undefined) {
    if (typeof location !== "string" || location.trim() === "") {
      return NextResponse.json({ error: "Posizione non valida" }, { status: 400 });
    }
    data.location = location.trim();
  }
  if (description !== undefined) {
    data.description = description ? String(description).trim() : null;
  }

  const property = await prisma.property.update({
    where: { id },
    data,
  });

  return NextResponse.json(property);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.property.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
