import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// GET — current user profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) {
    logger.error("api.account.get", { error: String(error) });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// PATCH — update profile (name, email, phone) and/or password
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, email, phone, currentPassword, newPassword } = body as {
      name?: string; email?: string; phone?: string;
      currentPassword?: string; newPassword?: string;
    };

    const data: any = {};
    if (name && name.trim()) data.name = name.trim();
    if (phone !== undefined) data.phone = phone.trim() || null;
    if (email && email.trim()) {
      const newEmail = email.trim().toLowerCase();
      if (newEmail !== session.user.email) {
        const exists = await prisma.user.findUnique({ where: { email: newEmail } });
        if (exists) return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
        data.email = newEmail;
      }
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
      }
      if (!currentPassword) {
        return NextResponse.json({ error: "يجب إدخال كلمة المرور الحالية" }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
      data.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "لا توجد تغييرات" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    logger.info("account.updated", { userId: session.user.id });
    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    logger.error("api.account.update", { error: String(error) });
    return NextResponse.json({ error: "حدث خطأ أثناء التحديث" }, { status: 500 });
  }
}
