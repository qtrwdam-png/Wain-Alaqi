import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { sendMail, buildVerificationEmail } from "@/lib/email";
import { issueCode, recentIssuedCount, MAX_RESENDS, CODE_TTL_MINUTES } from "@/lib/verification-codes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "بيانات غير صالحة" }, { status: 400 });
    }
    const { name, email, phone, password } = parsed.data;
    const lowerEmail = email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (exists) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
    }
    // Public registration always creates a regular USER account. Staff/admin
    // accounts can only be created by an existing admin from the admin panel.
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email: lowerEmail, phone, passwordHash: hash, role: "USER" },
    });

    // أرسل رمز تأكيد البريد الإلكتروني (OTP) لإثبات ملكية البريد.
    let mailWarning = false;
    try {
      const { code, expiresAt } = await issueCode(user.id, "EMAIL_VERIFICATION");
      const mail = buildVerificationEmail(lowerEmail, code, CODE_TTL_MINUTES);
      const result = await sendMail(mail);
      mailWarning = result.delivered !== "resend";
      logger.info("user.registered", { userId: user.id, delivered: result.delivered, expiresAt });
    } catch (mailErr) {
      mailWarning = true;
      logger.error("user.register.verification_mail_failed", { userId: user.id, error: String(mailErr) });
    }

    return NextResponse.json(
      { ok: true, userId: user.id, needsVerification: true, mailWarning },
      { status: 201 }
    );
  } catch (e) {
    logger.error("user.register.failed", { error: String(e) });
    return NextResponse.json({ error: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}

// إعادة إرسال رمز التأكيد (مع rate-limit).
export async function PUT(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }
    const lowerEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (!user) {
      // لا نكشف وجود البريد — نُرجع رسالة عامة.
      return NextResponse.json({ ok: true, needsVerification: true });
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: "هذا البريد مُؤكَّد بالفعل" }, { status: 400 });
    }
    const sent = await recentIssuedCount(user.id, 10);
    if (sent >= MAX_RESENDS) {
      return NextResponse.json({ error: "تم إرسال رموز كثيرة. حاول لاحقاً." }, { status: 429 });
    }
    const { code, expiresAt } = await issueCode(user.id, "EMAIL_VERIFICATION");
    const mail = buildVerificationEmail(lowerEmail, code, CODE_TTL_MINUTES);
    const result = await sendMail(mail);
    logger.info("user.resend_verification", { userId: user.id, delivered: result.delivered, expiresAt });
    return NextResponse.json({ ok: true, needsVerification: true, expiresInMinutes: CODE_TTL_MINUTES, mailWarning: result.delivered !== "resend" });
  } catch (e) {
    logger.error("user.resend_verification.failed", { error: String(e) });
    return NextResponse.json({ error: "حدث خطأ أثناء إعادة إرسال الرمز" }, { status: 500 });
  }
}
