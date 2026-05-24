import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, location, description } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "Nome proprietà obbligatorio" }, { status: 400 });
  }
  if (!location || typeof location !== "string" || location.trim() === "") {
    return NextResponse.json({ error: "Posizione obbligatoria" }, { status: 400 });
  }

  const property = await prisma.property.create({
    data: {
      name: name.trim(),
      location: location.trim(),
      description: description ? String(description).trim() : null,
    },
  });

  return NextResponse.json(property, { status: 201 });
}
