import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { issueCode, verifyCode, purgeExpiredCodes } from "@/lib/verification-codes";

/**
 * اختبارات تكامل لمنطق رموز تأكيد البريد (OTP) — تتطلب قاعدة بيانات مُهيّأة.
 * مثل tests/auth.test.ts: تُخفق في beforeAll إن لم تُهيّأ قاعدة البيانات.
 */
describe("verification codes (integration)", () => {
  let userId: string;

  beforeAll(async () => {
    const count = await prisma.user.count();
    if (count === 0) throw new Error("Database not seeded.");
    const u = await prisma.user.findFirst({ where: { isDemo: true } });
    if (!u) throw new Error("No demo user found for OTP tests.");
    userId = u.id;
  });

  it("issueCode returns a 6-digit code and verifyCode accepts it", async () => {
    const { code } = await issueCode(userId, "EMAIL_VERIFICATION");
    expect(code).toMatch(/^\d{6}$/);
    const result = await verifyCode(userId, code, "EMAIL_VERIFICATION");
    expect(result).toBe("ok");
  });

  it("verifyCode rejects an already-consumed code", async () => {
    const { code } = await issueCode(userId, "EMAIL_VERIFICATION");
    await verifyCode(userId, code, "EMAIL_VERIFICATION"); // first use: ok
    const second = await verifyCode(userId, code, "EMAIL_VERIFICATION"); // reuse: no_code (consumed)
    expect(second).toBe("no_code");
  });

  it("verifyCode rejects a wrong code", async () => {
    const { code } = await issueCode(userId, "EMAIL_VERIFICATION");
    const wrong = code === "000000" ? "111111" : "000000";
    const result = await verifyCode(userId, wrong, "EMAIL_VERIFICATION");
    expect(result).toBe("invalid");
  });

  it("purgeExpiredCodes runs without error", async () => {
    const n = await purgeExpiredCodes();
    expect(typeof n).toBe("number");
  });
});
