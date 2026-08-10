import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { storeRegistrationSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = storeRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "بيانات غير صالحة" }, { status: 400 });
    }
    const d = parsed.data;
    const email = d.ownerEmail.toLowerCase();

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
    }

    const hash = await bcrypt.hash(d.ownerPassword, 12);
    const baseSlug = slugify(d.storeName);

    const result = await prisma.$transaction(async (tx) => {
      const owner = await tx.user.create({
        data: {
          name: d.ownerName,
          email,
          phone: d.ownerPhone,
          passwordHash: hash,
          role: "STORE_OWNER",
        },
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
          ownerId: owner.id,
          cityId: d.cityId,
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
      return { owner, store };
    });

    logger.info("store.registered", { storeId: result.store.id, ownerId: result.owner.id });
    return NextResponse.json({ ok: true, storeId: result.store.id, status: "PENDING_REVIEW" }, { status: 201 });
  } catch (e) {
    logger.error("store.register.failed", { error: String(e) });
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل المتجر" }, { status: 500 });
  }
}
