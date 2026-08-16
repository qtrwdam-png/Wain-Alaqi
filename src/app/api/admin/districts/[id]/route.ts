import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";

type Ctx = { params: { id: string } };

async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) return null;
  return session.user;
}

export async function PATCH(req: Request, { params }: Ctx) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });

  const body = await req.json();
  const { name, latitude, longitude, active } = body;

  const existing = await prisma.district.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "الحي غير موجود" }, { status: 404 });

  let slug = existing.slug;
  if (name && name !== existing.name) {
    slug = slugify(name);
    let n = 1;
    while (await prisma.district.findFirst({ where: { cityId: existing.cityId, slug, NOT: { id: params.id } } })) {
      slug = `${slugify(name)}-${n++}`;
    }
  }

  const updated = await prisma.district.update({
    where: { id: params.id },
    data: {
      ...(name != null ? { name } : {}),
      ...(slug !== existing.slug ? { slug } : {}),
      ...(latitude != null ? { latitude: latitude ? Number(latitude) : null } : {}),
      ...(longitude != null ? { longitude: longitude ? Number(longitude) : null } : {}),
      ...(active != null ? { active: Boolean(active) } : {}),
    },
  });
  return NextResponse.json({ ok: true, district: updated });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });

  const district = await prisma.district.findUnique({
    where: { id: params.id },
    include: { _count: { select: { stores: true } } },
  });
  if (!district) return NextResponse.json({ error: "الحي غير موجود" }, { status: 404 });

  if (district._count.stores > 0) {
    // Detach stores from this district (districtId is nullable), then delete
    await prisma.store.updateMany({ where: { districtId: params.id }, data: { districtId: null } });
  }

  await prisma.district.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
