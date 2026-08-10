import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) return null;
  return session.user;
}

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { stores: true, products: true } } } });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  const body = await req.json();
  const { name, description, icon, image, sortOrder, active } = body;
  if (!name) return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  let slug = slugify(name);
  let n = 1;
  while (await prisma.category.findUnique({ where: { slug } })) slug = `${slugify(name)}-${n++}`;
  const category = await prisma.category.create({ data: { name, slug, description, icon, image, sortOrder: sortOrder || 0, active: active ?? true } });
  return NextResponse.json({ ok: true, category }, { status: 201 });
}
