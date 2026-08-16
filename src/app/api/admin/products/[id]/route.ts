import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { bustProductsCache } from "@/lib/cache-bust";

type Ctx = { params: { id: string } };

async function canEdit(id: string, userId: string, role: string) {
  const product = await prisma.product.findUnique({ where: { id }, include: { store: true } });
  if (!product) return null;
  if (role === "ADMIN") return product;
  if (product.store.ownerId === userId) return product;
  return null;
}

// Single-product fetch used by the store-owner edit page. Verifies ownership
// server-side: a store owner only receives their own product; any other id
// returns 403/404, preventing IDOR via URL tampering.
export async function GET(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  try {
    const product = await canEdit(params.id, session.user.id, session.user.role as string);
    if (!product) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
    return NextResponse.json({ product });
  } catch (error) {
    logger.error("api.admin.products.get", { error: String(error) });
    return NextResponse.json({ error: "فشل تحميل المنتج" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  try {
    const product = await canEdit(params.id, session.user.id, session.user.role);
    if (!product) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
    const body = await req.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const data: any = { ...parsed.data };
    if (parsed.data.availability) data.lastStockUpdate = new Date();
    const updated = await prisma.product.update({ where: { id: params.id }, data });

    // Bust products cache so updated data appears on public store pages
    bustProductsCache(product.store.slug);

    return NextResponse.json({ ok: true, product: updated });
  } catch (error) {
    logger.error("api.admin.products.patch", { error: String(error) });
    return NextResponse.json({ error: "فشل التحديث — حاول مرة أخرى" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  try {
    const product = await canEdit(params.id, session.user.id, session.user.role);
    if (!product) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
    await prisma.product.delete({ where: { id: params.id } });
    logger.info("product.deleted", { productId: params.id });

    // Bust products cache so the deleted product is removed from public pages
    bustProductsCache(product.store.slug);

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("api.admin.products.delete", { error: String(error) });
    return NextResponse.json({ error: "فشل الحذف — حاول مرة أخرى" }, { status: 500 });
  }
}
