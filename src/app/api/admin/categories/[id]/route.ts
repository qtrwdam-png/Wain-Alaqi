import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { slugify } from "@/lib/utils";
import { bustCategoriesCache } from "@/lib/cache-bust";

type Ctx = { params: { id: string } };

async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) return null;
  return session.user;
}

// Delete a category. Stores have a REQUIRED categoryId (NOT NULL), so the
// category cannot be removed while stores reference it — block with a clear
// message. Products have an OPTIONAL categoryId, so they are detached
// (set to null) inside a transaction before the category is deleted.
export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });

  const category = await prisma.category.findUnique({
    where: { id: params.id },
    include: { _count: { select: { stores: true, products: true } } },
  });
  if (!category) return NextResponse.json({ error: "القطاع غير موجود" }, { status: 404 });

  if (category._count.stores > 0) {
    return NextResponse.json(
      { error: `لا يمكن حذف هذا القطاع لأنه يحتوي على ${category._count.stores} متجر. انقل المتاجر إلى قطاع آخر أولاً.` },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.product.updateMany({ where: { categoryId: params.id }, data: { categoryId: null } }),
    prisma.category.delete({ where: { id: params.id } }),
  ]);
  logger.audit(user.id, "category.delete", "category", params.id);

  // Bust categories cache so the deleted category is removed from public pages
  bustCategoriesCache(category.slug);

  return NextResponse.json({ ok: true });
}

// Edit a category: name, icon, sortOrder, active, description, image.
export async function PATCH(req: Request, { params }: Ctx) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });

  const body = await req.json();
  const { name, icon, sortOrder, active, description, image } = body;

  const existing = await prisma.category.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "القطاع غير موجود" }, { status: 404 });

  // If the name changed, regenerate a unique slug.
  let slug = existing.slug;
  if (name && name !== existing.name) {
    slug = slugify(name);
    let n = 1;
    while (await prisma.category.findFirst({ where: { slug, NOT: { id: params.id } } })) slug = `${slugify(name)}-${n++}`;
  }

  const updated = await prisma.category.update({
    where: { id: params.id },
    data: {
      ...(name != null ? { name } : {}),
      ...(slug !== existing.slug ? { slug } : {}),
      ...(icon != null ? { icon: icon || null } : {}),
      ...(sortOrder != null ? { sortOrder: Number(sortOrder) } : {}),
      ...(active != null ? { active: Boolean(active) } : {}),
      ...(description != null ? { description: description || null } : {}),
      ...(image != null ? { image: image || null } : {}),
    },
  });
  logger.audit(user.id, "category.update", "category", params.id);

  // Bust categories cache so updated data appears on public pages
  bustCategoriesCache(updated.slug);

  return NextResponse.json({ ok: true, category: updated });
}
