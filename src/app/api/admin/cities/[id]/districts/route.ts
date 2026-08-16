import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { autoIndexDistricts } from "@/lib/district-indexer";
import { slugify } from "@/lib/utils";

type Ctx = { params: { id: string } };

async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) return null;
  return session.user;
}

// List districts for a city
export async function GET(_req: Request, { params }: Ctx) {
  const districts = await prisma.district.findMany({
    where: { cityId: params.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { stores: true } } },
  });
  return NextResponse.json({ districts });
}

// Manually add a district to a city
export async function POST(req: Request, { params }: Ctx) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });

  const body = await req.json();
  const { name, latitude, longitude } = body;
  if (!name || typeof name !== "string") return NextResponse.json({ error: "اسم الحي مطلوب" }, { status: 400 });

  const city = await prisma.city.findUnique({ where: { id: params.id } });
  if (!city) return NextResponse.json({ error: "المدينة غير موجودة" }, { status: 404 });

  const slug = slugify(name);
  const district = await prisma.district.upsert({
    where: { cityId_slug: { cityId: params.id, slug } },
    update: { name },
    create: { name, slug, cityId: params.id, latitude: latitude ? Number(latitude) : null, longitude: longitude ? Number(longitude) : null },
  });
  return NextResponse.json({ ok: true, district }, { status: 201 });
}

// Auto-index: fetch districts from OpenStreetMap and create them
export async function PATCH(_req: Request, { params }: Ctx) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });

  try {
    const result = await autoIndexDistricts(params.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: "تعذّر جلب الأحياء من OpenStreetMap. حاول لاحقاً أو أضف الأحياء يدوياً." },
      { status: 502 }
    );
  }
}
