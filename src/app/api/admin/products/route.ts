import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { bustProductsCache } from "@/lib/cache-bust";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  const role = session.user.role as string;

  const where: any = {};
  if (searchParams.get("storeId")) where.storeId = searchParams.get("storeId");
  if (searchParams.get("categoryId")) where.categoryId = searchParams.get("categoryId");

  // Authorization: only staff see the full catalog. Store owners see their
  // own store's products only. Regular users are denied entirely.
  if (role === "ADMIN" || role === "CONTENT_MANAGER") {
    // full access (filters above apply)
  } else if (role === "STORE_OWNER") {
    const store = await prisma.store.findFirst({ where: { ownerId: session.user.id } });
    if (!store) return NextResponse.json({ products: [] });
    where.storeId = store.id;
  } else {
    return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  }

  try {
    const products = await prisma.product.findMany({
      where,
      include: { store: { select: { name: true, slug: true } } },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ products });
  } catch (error) {
    logger.error("api.admin.products.list", { error: String(error) });
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const store = await prisma.store.findFirst({ where: { ownerId: session.user.id } });
  if (!store) return NextResponse.json({ error: "ليس لديك متجر" }, { status: 404 });

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let n = 1;
  while (await prisma.product.findFirst({ where: { storeId: store.id, slug } })) {
    slug = `${baseSlug}-${n++}`;
  }
  const product = await prisma.product.create({
    data: {
      storeId: store.id,
      categoryId: parsed.data.categoryId || store.categoryId,
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      availability: parsed.data.availability,
      image: parsed.data.image,
      active: parsed.data.active,
    },
  });
  logger.info("product.created", { productId: product.id, storeId: store.id });

  // Bust products cache so the new product appears on public store pages
  bustProductsCache(store.slug);

  return NextResponse.json({ ok: true, product }, { status: 201 });
}
