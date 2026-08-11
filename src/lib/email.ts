import { logger } from "./logger";

/**
 * خدمة إرسال البريد الإلكتروني لتأكيد الحساب.
 *
 * تعمل في وضعين:
 *  - وضع الإنتاج: تستخدم Resend API عند توفّر RESEND_API_KEY.
 *  - وضع التطوير: عند غياب المفتاح، تُطبع محتوى الرسالة (والرمز) في سجل الخادم
 *    فقط ولا تُرسل بريداً فعلياً — حتى يمكن اختبار التدفّق دون خدمة بريد.
 *
 * جميع القيم تُقرأ من متغيرات البيئة ولا تُكتَب ثابتةً في الكود.
 */

const APP_NAME = "وين ألاقي؟";
const SUPPORT_EMAIL = "support@wain-alaqi.com";

function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== "");
}

function getFromAddress(): string {
  return process.env.RESEND_FROM || "onboarding@resend.dev";
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export interface SendMailResult {
  delivered: "resend" | "dev";
  messageId?: string;
}

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * إرسال بريد. في وضع التطوير تُطبع الرسالة في السجل فقط.
 */
export async function sendMail(message: MailMessage): Promise<SendMailResult> {
  if (!isResendConfigured()) {
    // وضع التطوير: اطبع المحتوى في السجل بدل الإرسال الفعلي.
    logger.info("email.dev_mode", {
      to: message.to,
      subject: message.subject,
      body: message.text,
    });
    // اطبع نصاً واضحاً للرمز ليسهل نسخه أثناء التطوير.
    // eslint-disable-next-line no-console
    console.log(`\n========== [DEV EMAIL] ==========\nTo: ${message.to}\nSubject: ${message.subject}\n${message.text}\n==================================\n`);
    return { delivered: "dev" };
  }

  // وضع الإنتاج: استخدم Resend.
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const { data, error } = await resend.emails.send({
    from: `${APP_NAME} <${getFromAddress()}>`,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  if (error) {
    logger.error("email.send.failed", { to: message.to, error: String(error) });
    throw new Error("فشل إرسال البريد الإلكتروني");
  }

  logger.info("email.sent", { to: message.to, messageId: data?.id });
  return { delivered: "resend", messageId: data?.id };
}

/**
 * بريد رمز تأكيد البريد الإلكتروني (OTP).
 */
export function buildVerificationEmail(to: string, code: string, expiresInMinutes = 10) {
  const subject = `رمز تأكيد بريدك الإلكتروني — ${APP_NAME}`;
  const text = `مرحباً،

رمز تأكيد بريدك الإلكتروني على منصة ${APP_NAME} هو:

    ${code}

الرمز صالح لمدة ${expiresInMinutes} دقائق. إن لم تكن أنت من طلبت إنشاء الحساب، تجاهل هذه الرسالة.

— فريق ${APP_NAME}
${SUPPORT_EMAIL}`;
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2937">
  <h2 style="color:#111827">${APP_NAME}</h2>
  <p>مرحباً،</p>
  <p>رمز تأكيد بريدك الإلكتروني هو:</p>
  <p style="font-size:32px;font-weight:800;letter-spacing:6px;direction:ltr;text-align:center;
            background:#f3f4f6;border-radius:12px;padding:16px;margin:16px 0">${code}</p>
  <p style="color:#6b7280;font-size:14px">الرمز صالح لمدة ${expiresInMinutes} دقائق.</p>
  <p style="color:#6b7280;font-size:14px">إن لم تكن أنت من طلبت إنشاء الحساب، تجاهل هذه الرسالة.</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
  <p style="color:#9ca3af;font-size:12px">— فريق ${APP_NAME}<br>${SUPPORT_EMAIL}</p>
</div>`;
  return { to, subject, text, html };
}
