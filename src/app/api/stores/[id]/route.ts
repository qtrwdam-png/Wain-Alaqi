import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  const store = await prisma.store.findUnique({ where: { id: params.id } });
  if (!store) return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
  if (store.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "لا تملك صلاحية لتعديل هذا المتجر" }, { status: 403 });
  }
  const body = await req.json();
  const allowed = ["name", "description", "phone", "whatsapp", "address", "logo", "coverImage", "latitude", "longitude", "openingHours"];
  const data: any = {};
  for (const k of allowed) if (body[k] !== undefined) data[k] = body[k];
  const updated = await prisma.store.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true, store: updated });
}
