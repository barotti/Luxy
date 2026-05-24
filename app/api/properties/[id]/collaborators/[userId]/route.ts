import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: propertyId, userId } = await params;

  await prisma.propertyCollaborator.delete({
    where: { propertyId_userId: { propertyId, userId } },
  });

  return NextResponse.json({ ok: true });
}
