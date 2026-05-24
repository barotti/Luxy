import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "Nome metodo obbligatorio" }, { status: 400 });
  }

  const paymentMethod = await prisma.paymentMethod.create({
    data: { name: name.trim() },
  });

  return NextResponse.json(paymentMethod, { status: 201 });
}
