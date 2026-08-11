import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { z } from "zod";

type Ctx = { params: { id: string } };

const createStaffSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  phone: z.string().optional(),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  role: z.enum(["ADMIN", "CONTENT_MANAGER"]),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  }
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, phone: true, role: true, active: true, isDemo: true, createdAt: true, _count: { select: { stores: true } } } });
  return NextResponse.json({ users });
}

// Create a new staff account (ADMIN or CONTENT_MANAGER). Admin-only.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = createStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "بيانات غير صالحة" }, { status: 400 });
  }
  const { name, email, phone, password, role } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), phone, passwordHash: hash, role },
    select: { id: true, name: true, email: true, phone: true, role: true, active: true, isDemo: true, createdAt: true, _count: { select: { stores: true } } },
  });
  logger.audit(session.user.id, "user.create", "user", user.id, { role });
  return NextResponse.json({ ok: true, user }, { status: 201 });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  const body = await req.json();
  const data: any = {};
  if (body.role) data.role = body.role;
  if (typeof body.active === "boolean") data.active = body.active;
  const user = await prisma.user.update({ where: { id: params.id }, data });
  logger.audit(session.user.id, "user.update", "user", params.id, { role: body.role, active: body.active });
  return NextResponse.json({ ok: true, user });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  if (params.id === session.user.id) return NextResponse.json({ error: "لا يمكنك حذف حسابك" }, { status: 400 });
  await prisma.user.delete({ where: { id: params.id } });
  logger.audit(session.user.id, "user.delete", "user", params.id);
  return NextResponse.json({ ok: true });
}
