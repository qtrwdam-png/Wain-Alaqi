import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

type Ctx = { params: { id: string } };

export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, phone: true, role: true, active: true, isDemo: true, createdAt: true, _count: { select: { stores: true } } } });
  return NextResponse.json({ users });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  const body = await req.json();
  const data: any = {};
  if (body.role) data.role = body.role;
  if (typeof body.active === "boolean") data.active = body.active;
  const user = await prisma.user.update({ where: { id: params.id }, data });
  logger.audit(session.user.id, "user.update", "user", params.id, { role: body.role, active: body.active });
  return NextResponse.json({ ok: true, user });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  if (params.id === session.user.id) return NextResponse.json({ error: "لا يمكنك حذف حسابك" }, { status: 400 });
  await prisma.user.delete({ where: { id: params.id } });
  logger.audit(session.user.id, "user.delete", "user", params.id);
  return NextResponse.json({ ok: true });
}
