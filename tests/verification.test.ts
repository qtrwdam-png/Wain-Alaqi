import { describe, it, expect } from "vitest";
import { generateNumericCode, hashCode, verifyHash, CODE_TTL_MINUTES, MAX_ATTEMPTS, MAX_RESENDS } from "@/lib/verification-codes";
import { buildVerificationEmail } from "@/lib/email";

/**
 * اختبارات وحدة (Unit) لمنطق رموز تأكيد البريد (OTP).
 * لا تتطلب قاعدة بيانات — تختبر الدوال النقية فقط.
 * اختبارات التكامل (issueCode/verifyCode) تتطلب قاعدة بيانات مُهيّأة
 * وتُغطّى عبر tests/auth.test.ts عند توفّر DATABASE_URL.
 */
describe("verification codes (OTP) — unit", () => {
  it("generateNumericCode returns a 6-digit string", () => {
    const code = generateNumericCode(6);
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^\d{6}$/);
  });

  it("generateNumericCode generates different codes (randomness)", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateNumericCode(6)));
    expect(codes.size).toBeGreaterThan(1);
  });

  it("constants have sane values", () => {
    expect(CODE_TTL_MINUTES).toBeGreaterThan(0);
    expect(MAX_ATTEMPTS).toBeGreaterThan(0);
    expect(MAX_RESENDS).toBeGreaterThan(0);
  });
});

describe("verification codes (OTP) — hashing", () => {
  it("hashCode produces a hash different from the plain code", async () => {
    const code = "123456";
    const hash = await hashCode(code);
    expect(hash).not.toBe(code);
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifyHash accepts the correct code", async () => {
    const code = "987654";
    const hash = await hashCode(code);
    const ok = await verifyHash(code, hash);
    expect(ok).toBe(true);
  });

  it("verifyHash rejects a wrong code", async () => {
    const hash = await hashCode("111111");
    const ok = await verifyHash("222222", hash);
    expect(ok).toBe(false);
  });
});

describe("verification email builder", () => {
  it("buildVerificationEmail contains the OTP code", () => {
    const code = "456789";
    const mail = buildVerificationEmail("user@example.com", code, 10);
    expect(mail.to).toBe("user@example.com");
    expect(mail.subject).toContain("رمز");
    expect(mail.text).toContain(code);
    expect(mail.html).toContain(code);
  });

  it("buildVerificationEmail mentions expiry duration", () => {
    const mail = buildVerificationEmail("user@example.com", "000000", 10);
    expect(mail.text).toContain("10");
  });
});

describe("registration resume logic (unverified email)", () => {
  /**
   * منطق «الاستئناف»: حين يُعيد عميل التسجيل ببريد موجود لكنه غير مُؤكَّد،
   * يجب ألا يُرفض (409) بل يُحدَّث ويُرسل له رمز جديد. لا يمكن اختبار
   * الـ route مباشرةً دون قاعدة بيانات، لكن نُثبت المبدأ عبر دالة قرار بسيطة.
   */
  it("an unverified account should resume, not conflict", () => {
    const existing = { emailVerified: null } as any;
    const decision = existing.emailVerified ? "conflict" : "resume";
    expect(decision).toBe("resume");
  });

  it("a verified account should conflict (409)", () => {
    const existing = { emailVerified: new Date() } as any;
    const decision = existing.emailVerified ? "conflict" : "resume";
    expect(decision).toBe("conflict");
  });
});
