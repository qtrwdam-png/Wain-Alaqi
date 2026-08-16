import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

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

  return NextResponse.json({ ok: true });
}
