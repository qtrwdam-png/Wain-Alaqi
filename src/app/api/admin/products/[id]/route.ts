import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

type Ctx = { params: { id: string } };

async function canEdit(id: string, userId: string, role: string) {
  const product = await prisma.product.findUnique({ where: { id }, include: { store: true } });
  if (!product) return null;
  if (role === "ADMIN") return product;
  if (product.store.ownerId === userId) return product;
  return null;
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  const product = await canEdit(params.id, session.user.id, session.user.role);
  if (!product) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  const body = await req.json();
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const data: any = { ...parsed.data };
  if (parsed.data.availability) data.lastStockUpdate = new Date();
  const updated = await prisma.product.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true, product: updated });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  const product = await canEdit(params.id, session.user.id, session.user.role);
  if (!product) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  await prisma.product.delete({ where: { id: params.id } });
  logger.info("product.deleted", { productId: params.id });
  return NextResponse.json({ ok: true });
}
