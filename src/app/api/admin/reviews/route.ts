import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  }
  const body = await req.json();
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: "id و status مطلوبان" }, { status: 400 });
  const review = await prisma.review.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true, review });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
