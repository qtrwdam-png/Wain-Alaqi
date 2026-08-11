import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { sendMail, buildVerificationEmail } from "@/lib/email";
import { issueCode, recentIssuedCount, MAX_RESENDS, RESEND_WINDOW_MINUTES, CODE_TTL_MINUTES } from "@/lib/verification-codes";

// يُصدِر رمز OTP ويُرسله بالبريد. لا يرمي أخطاء أبداً — يُرجع نتيجة بريديّة.
async function sendVerificationCode(userId: string, email: string) {
  try {
    const { code, expiresAt } = await issueCode(userId, "EMAIL_VERIFICATION");
    const mail = buildVerificationEmail(email, code, CODE_TTL_MINUTES);
    const result = await sendMail(mail);
    return { delivered: result.delivered, expiresAt, mailWarning: result.delivered !== "resend" };
  } catch (e) {
    logger.error("verification_code.send_failed", { userId, error: String(e) });
    return { delivered: "error" as const, mailWarning: true };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "بيانات غير صالحة" }, { status: 400 });
    }
    const { name, email, phone, password } = parsed.data;
    const lowerEmail = email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: lowerEmail } });

    if (existing) {
      // البريد مسجّل ومُؤكَّد بالفعل — لا يمكن إعادة التسجيل.
      if (existing.emailVerified) {
        return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
      }
      // البريد مسجّل لكنه غير مُؤكَّد — استئناف التحقق بدل الطريق المسدود:
      // حدّث البيانات (الاسم/الهاتف/كلمة المرور) وأرسل رمزاً جديداً.
      const hash = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: existing.id },
        data: { name, phone, passwordHash: hash },
      });
      // احترم حد إعادة الإرسال لتجنّب الإساءة.
      const sent = await recentIssuedCount(existing.id);
      if (sent >= MAX_RESENDS) {
        return NextResponse.json(
          { error: `تم إرسال عدة رموز. انتظر ${RESEND_WINDOW_MINUTES} دقيقة ثم حاول تسجيل الدخول بدلاً من إنشاء حساب.` },
          { status: 429 }
        );
      }
      const resent = await sendVerificationCode(existing.id, lowerEmail);
      logger.info("user.register.resume_unverified", { userId: existing.id, delivered: resent.delivered });
      return NextResponse.json(
        { ok: true, userId: existing.id, needsVerification: true, resumed: true, mailWarning: resent.mailWarning },
        { status: 201 }
      );
    }

    // حساب جديد كلياً.
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email: lowerEmail, phone, passwordHash: hash, role: "USER" },
    });
    const sent = await sendVerificationCode(user.id, lowerEmail);
    logger.info("user.registered", { userId: user.id, delivered: sent.delivered });

    return NextResponse.json(
      { ok: true, userId: user.id, needsVerification: true, mailWarning: sent.mailWarning },
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
    const sent = await recentIssuedCount(user.id);
    if (sent >= MAX_RESENDS) {
      return NextResponse.json(
        { error: `تم إرسال ${MAX_RESENDS} رموز خلال آخر ${RESEND_WINDOW_MINUTES} دقيقة. انتظر قليلاً ثم حاول مجدداً.` },
        { status: 429 }
      );
    }
    const result = await sendVerificationCode(user.id, lowerEmail);
    logger.info("user.resend_verification", { userId: user.id, delivered: result.delivered, expiresAt: result.expiresAt });
    return NextResponse.json({ ok: true, needsVerification: true, expiresInMinutes: CODE_TTL_MINUTES, mailWarning: result.mailWarning });
  } catch (e) {
    logger.error("user.resend_verification.failed", { error: String(e) });
    return NextResponse.json({ error: "حدث خطأ أثناء إعادة إرسال الرمز" }, { status: 500 });
  }
}
