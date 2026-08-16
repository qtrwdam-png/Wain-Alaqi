import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// GET /api/districts?cityId=... → returns active districts for that city
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get("cityId");
  if (!cityId) return NextResponse.json({ districts: [] });

  const districts = await prisma.district.findMany({
    where: { cityId, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json({ districts });
}

/**
 * POST /api/districts
 * Allows any logged-in merchant to add a new district to a city.
 * Used by the district search dropdown when a merchant can't find their neighborhood.
 * Returns the created/existing district so the caller can auto-select it.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const body = await req.json();
  const { name, cityId } = body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "اسم الحي مطلوب" }, { status: 400 });
  }
  if (!cityId) {
    return NextResponse.json({ error: "المدينة مطلوبة" }, { status: 400 });
  }

  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) return NextResponse.json({ error: "المدينة غير موجودة" }, { status: 404 });

  const trimmedName = name.trim();
  const slug = slugify(trimmedName);

  // upsert so adding an existing (possibly inactive) district reactivates it
  const district = await prisma.district.upsert({
    where: { cityId_slug: { cityId, slug } },
    update: { name: trimmedName, active: true },
    create: { name: trimmedName, slug, cityId, active: true },
  });

  revalidatePath("/add-store");
  revalidatePath("/dashboard/store/settings");

  return NextResponse.json({ ok: true, district }, { status: 201 });
}
