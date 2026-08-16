import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { storeRegistrationSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { bustStoresCache } from "@/lib/cache-bust";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
    }

    // Staff members manage stores from the admin panel; they should not
    // self-register a store through the public flow.
    if (session.user.role === "ADMIN" || session.user.role === "CONTENT_MANAGER") {
      return NextResponse.json({ error: "لا يمكن لمدير المنصة إنشاء متجر عبر هذه الصفحة. استخدم لوحة الإدارة." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = storeRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "بيانات غير صالحة" }, { status: 400 });
    }
    const d = parsed.data;

    // Check if user already owns a store (one store per owner).
    const existingStore = await prisma.store.findFirst({ where: { ownerId: session.user.id } });
    if (existingStore) {
      return NextResponse.json({ error: "لديك متجر مسجل بالفعل" }, { status: 409 });
    }

    const baseSlug = slugify(d.storeName);

    const result = await prisma.$transaction(async (tx) => {
      // Promote user to STORE_OWNER role if they're a regular user
      await tx.user.update({
        where: { id: session.user.id },
        data: { role: "STORE_OWNER" },
      });
      let slug = baseSlug;
      let n = 1;
      while (await tx.store.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${n++}`;
      }
      const openingHours = d.openingHours ? { text: d.openingHours } : undefined;
      const store = await tx.store.create({
        data: {
          name: d.storeName,
          slug,
          description: d.description,
          categoryId: d.categoryId,
          ownerId: session.user.id,
          cityId: d.cityId,
          districtId: d.districtId || null,
          phone: d.phone,
          whatsapp: d.whatsapp,
          address: d.address,
          latitude: d.latitude,
          longitude: d.longitude,
          logo: d.logo,
          coverImage: d.coverImage,
          openingHours: openingHours as any,
          status: "PENDING_REVIEW",
        },
      });
      return { store };
    });

    logger.info("store.registered", { storeId: result.store.id, ownerId: session.user.id });

    // Bust stores cache so the new store appears on public pages once approved
    bustStoresCache(result.store.slug);

    return NextResponse.json({ ok: true, storeId: result.store.id, status: "PENDING_REVIEW" }, { status: 201 });
  } catch (e) {
    logger.error("store.register.failed", { error: String(e) });
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل المتجر" }, { status: 500 });
  }
}
