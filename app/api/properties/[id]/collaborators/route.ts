import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: propertyId } = await params;
  const { nickname } = await req.json();

  if (!nickname?.trim()) {
    return NextResponse.json({ error: "Nickname obbligatorio" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { nickname: nickname.trim() } });
  if (!user) {
    return NextResponse.json({ error: `Utente "${nickname}" non trovato` }, { status: 404 });
  }

  const existing = await prisma.propertyCollaborator.findUnique({
    where: { propertyId_userId: { propertyId, userId: user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Collaboratore già presente" }, { status: 409 });
  }

  const collab = await prisma.propertyCollaborator.create({
    data: { propertyId, userId: user.id, roleOnProperty: "collaboratore" },
    include: { user: { select: { id: true, nickname: true, role: true } } },
  });

  return NextResponse.json(collab, { status: 201 });
}
