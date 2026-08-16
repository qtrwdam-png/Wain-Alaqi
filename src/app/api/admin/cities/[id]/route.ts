import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { bustCitiesCache } from "@/lib/cache-bust";

type Ctx = { params: { id: string } };

async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) return null;
  return session.user;
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });

  const city = await prisma.city.findUnique({
    where: { id: params.id },
    include: { _count: { select: { stores: true } } },
  });
  if (!city) return NextResponse.json({ error: "المدينة غير موجودة" }, { status: 404 });

  if (city._count.stores > 0) {
    return NextResponse.json(
      { error: `لا يمكن حذف هذه المدينة لأنها تحتوي على ${city._count.stores} متجر. انقل المتاجر إلى مدينة أخرى أولاً.` },
      { status: 400 }
    );
  }

  await prisma.city.delete({ where: { id: params.id } });

  // Bust cities cache so the deleted city is removed from dropdowns
  bustCitiesCache();

  return NextResponse.json({ ok: true });
}
