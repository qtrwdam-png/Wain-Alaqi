import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { logger } from "./logger";

/**
 * منطق رموز تأكيد البريد الإلكتروني (OTP):
 *  - توليد رمز 6 أرقام عشوائي.
 *  - تخزين قيمته المُجزّأة (bcrypt) فقط — لا نخزّن الرمز الصريح في قاعدة البيانات.
 *  - صلاحية محدودة وحد أقصى للمحاولات.
 *  - تنظيف الرموز المنتهية لمنع التراكم.
 */

export const CODE_TTL_MINUTES = 10;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_SECONDS = 60; // الحد الأدنى بين إعادة الإرسال
export const MAX_RESENDS = 6; // أقصى عدد رموز تصدر ضمن نافذة إعادة الإرسال
export const RESEND_WINDOW_MINUTES = 30; // نافذة عدّ إعادة الإرسال

export function generateNumericCode(length = 6): string {
  const max = 10 ** length;
  // استخدم Math.random مع تعديل بسيط — للأغراض غير الأمنية الحرجة (OTP قصير المدى)
  // ونُجزّأ الرمز بـ bcrypt عند التخزين للحماية.
  const n = Math.floor(Math.random() * max);
  return n.toString().padStart(length, "0");
}

export async function hashCode(code: string): Promise<string> {
  // cost منخفض (8) لأن الرمز قصير وينتهي بسرعة، لكنه كافٍ لمقاومة الفحص.
  return bcrypt.hash(code, 8);
}

export async function verifyHash(code: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(code, hash);
  } catch {
    return false;
  }
}

/**
 * يُنشئ رمزاً جديداً لمستخدم ويُبطّل (يستهلك) أي رموز سابقة نشطة.
 * يعيد الرمز الصريح (ليُرسل بالبريد) ولا يُخزَّن إلّا المُجزّأ.
 */
export async function issueCode(userId: string, purpose: "EMAIL_VERIFICATION" = "EMAIL_VERIFICATION"): Promise<{ code: string; expiresAt: Date }> {
  // أبطِل الرموز النشطة السابقة لنفس الغرض.
  await prisma.emailVerificationCode.updateMany({
    where: { userId, purpose, consumedAt: null, expiresAt: { gt: new Date() } },
    data: { consumedAt: new Date() },
  });

  const code = generateNumericCode(6);
  const codeHash = await hashCode(code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await prisma.emailVerificationCode.create({
    data: { userId, codeHash, purpose, expiresAt },
  });

  logger.info("verification.code.issued", { userId, purpose });
  return { code, expiresAt };
}

/**
 * يتحقق من رمز مُدخَل لمستخدم.
 * يعيد:
 *  - "ok" + يسجّل الاستهلاك عند النجاح.
 *  - "invalid" عند عدم المطابقة (ويزيد عدّاد المحاولات).
 *  - "expired" عند انتهاء الصلاحية.
 *  - "no_code" عند عدم وجود رمز نشط.
 */
export type VerifyResult = "ok" | "invalid" | "expired" | "no_code";

export async function verifyCode(userId: string, code: string, purpose: "EMAIL_VERIFICATION" = "EMAIL_VERIFICATION"): Promise<VerifyResult> {
  const record = await prisma.emailVerificationCode.findFirst({
    where: { userId, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return "no_code";

  if (record.expiresAt <= new Date()) {
    return "expired";
  }

  const matched = await verifyHash(code, record.codeHash);

  // زِد عدّاد المحاولات مهما كانت النتيجة (لمنع التخمين).
  await prisma.emailVerificationCode.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 } },
  });

  if (!matched) {
    // تجاوز حد المحاولات: أبطِل الرمز.
    if (record.attempts + 1 >= MAX_ATTEMPTS) {
      await prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      });
      logger.warn("verification.code.max_attempts", { userId, purpose });
    }
    return "invalid";
  }

  // نجاح: سجّل الاستهلاك.
  await prisma.emailVerificationCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });
  logger.info("verification.code.verified", { userId, purpose });
  return "ok";
}

/**
 * عدد الرموز الصادرة خلال آخر نافذة زمنية (لمعرفة rate-limit لإعادة الإرسال).
 */
export async function recentIssuedCount(userId: string, windowMinutes = RESEND_WINDOW_MINUTES): Promise<number> {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);
  return prisma.emailVerificationCode.count({
    where: { userId, createdAt: { gte: since } },
  });
}

/**
 * متى يُسمح للمستخدم بإعادة الإرسال بعد الوصول للحد (بالدقائق).
 */
export function retryAfterMinutes(remaining: number): number {
  return Math.ceil(RESEND_WINDOW_MINUTES * (remaining / MAX_RESENDS));
}

/**
 * تنظيف الرموز المنتهية (يُستدعى دورياً).
 */
export async function purgeExpiredCodes(): Promise<number> {
  const result = await prisma.emailVerificationCode.deleteMany({
    where: { expiresAt: { lt: new Date() }, consumedAt: null },
  });
  return result.count;
}
