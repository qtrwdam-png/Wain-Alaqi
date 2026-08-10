import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  if (!storeId) return NextResponse.json({ error: "storeId مطلوب" }, { status: 400 });
  const reviews = await prisma.review.findMany({
    where: { storeId, status: "VISIBLE" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reviews });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const { storeId, rating, comment } = parsed.data;

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });

    const review = await prisma.review.create({
      data: { storeId, userId: session.user.id, rating, comment, status: "VISIBLE" },
    });

    // recompute store rating
    const agg = await prisma.review.aggregate({
      where: { storeId, status: "VISIBLE" },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.store.update({
      where: { id: storeId },
      data: { rating: agg._avg.rating || 0, reviewCount: agg._count.rating },
    });

    logger.info("review.created", { reviewId: review.id, storeId });
    return NextResponse.json({ ok: true, review }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
