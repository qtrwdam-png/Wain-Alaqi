import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { verifyCode } from "@/lib/verification-codes";

const verifyEmailSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  code: z.string().min(4, "الرمز غير صحيح").max(8, "الرمز غير صحيح"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = verifyEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "بيانات غير صالحة" }, { status: 400 });
    }
    const email = parsed.data.email.toLowerCase().trim();
    const code = parsed.data.code.trim();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "البريد أو الرمز غير صحيح" }, { status: 400 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    const result = await verifyCode(user.id, code, "EMAIL_VERIFICATION");

    if (result === "expired") {
      return NextResponse.json({ error: "انتهت صلاحية الرمز. اطلب رمزاً جديداً." }, { status: 410 });
    }
    if (result === "no_code") {
      return NextResponse.json({ error: "لا يوجد رمز نشط. اطلب رمزاً جديداً." }, { status: 400 });
    }
    if (result !== "ok") {
      return NextResponse.json({ error: "الرمز غير صحيح" }, { status: 400 });
    }

    // تأكيد ناجح: فعّل البريد.
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date(), active: true },
    });
    logger.info("user.email_verified", { userId: user.id });

    return NextResponse.json({ ok: true, verified: true });
  } catch (e) {
    logger.error("user.verify_email.failed", { error: String(e) });
    return NextResponse.json({ error: "حدث خطأ أثناء التحقق" }, { status: 500 });
  }
}
