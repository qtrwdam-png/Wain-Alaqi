import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { bustCitiesCache } from "@/lib/cache-bust";

async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) return null;
  return session.user;
}

export async function GET() {
  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { stores: true } } },
  });
  return NextResponse.json({ cities });
}

export async function POST(req: Request) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });

  const body = await req.json();
  const { name, latitude, longitude, country } = body;
  if (!name || typeof name !== "string") return NextResponse.json({ error: "اسم المدينة مطلوب" }, { status: 400 });
  if (latitude == null || longitude == null) return NextResponse.json({ error: "الموقع مطلوب" }, { status: 400 });

  let slug = slugify(name);
  let n = 1;
  while (await prisma.city.findUnique({ where: { slug } })) slug = `${slugify(name)}-${n++}`;

  const city = await prisma.city.create({
    data: { name, slug, country: country || "الأردن", latitude: Number(latitude), longitude: Number(longitude) },
  });

  // Bust cities cache so the new city appears in dropdowns
  bustCitiesCache();

  return NextResponse.json({ ok: true, city }, { status: 201 });
}
