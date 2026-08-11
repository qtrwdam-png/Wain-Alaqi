"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { fetchWithRetry } from "@/lib/fetch-retry";
import Link from "next/link";

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const emailParam = params.get("email") || "";
  const password = (typeof window !== "undefined" && sessionStorage.getItem("pending_login_password")) || "";
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetchWithRetry("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
    setSuccess(true);
    if (typeof window !== "undefined") sessionStorage.removeItem("pending_login_password");
    // حاول تسجيل الدخول تلقائياً إن كان لدينا كلمة المرور مؤقتاً.
    if (email && password) {
      const r = await signIn("credentials", { email, password, redirect: false });
      if (r && !r.error) {
        router.push("/account");
        router.refresh();
        return;
      }
    }
  }

  async function resend() {
    if (!email || cooldown > 0) return;
    setResending(true); setResendMsg(null); setError(null);
    const res = await fetchWithRetry("/api/auth/register", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setResending(false);
    if (!res.ok) { setResendMsg(data.error || "تعذّر إعادة الإرسال"); return; }
    setResendMsg("تم إرسال رمز جديد. تحقق من بريدك.");
    setCooldown(60);
  }

  if (success) {
    return (
      <div className="container-app flex min-h-[70vh] items-center justify-center py-10">
        <div className="card w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">✓</div>
          <h1 className="text-2xl font-extrabold text-gray-900">تم تأكيد بريدك</h1>
          <p className="mt-2 text-gray-500">تم تفعيل حسابك بنجاح. يمكنك الآن تسجيل الدخول.</p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/login" className="btn-primary">تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-10">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">تأكيد البريد الإلكتروني</h1>
        <p className="mt-1 text-sm text-gray-500">
          أرسلنا رمزاً من 6 أرقام إلى <span className="font-medium text-gray-700">{email || "بريدك"}</span>.
          أدخله أدناه لتفعيل حسابك.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">رمز التحقق</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="input text-center text-2xl tracking-[0.5em]"
              placeholder="●●●●●●"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "جارٍ التحقق…" : "تأكيد وتفعيل الحساب"}</button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={resend}
            disabled={resending || cooldown > 0 || !email}
            className="text-brand-700 hover:underline disabled:text-gray-400"
          >
            {cooldown > 0 ? `إعادة الإرسال خلال ${cooldown}ث` : resending ? "جارٍ الإرسال…" : "لم يصلك الرمز؟ أعد الإرسال"}
          </button>
        </div>
        {resendMsg && <p className="mt-2 text-sm text-gray-500">{resendMsg}</p>}
        <p className="mt-4 text-sm text-gray-600">
          <Link href="/login" className="text-brand-700 hover:underline">العودة لتسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="container-app py-20 text-center text-gray-400">جارٍ التحميل…</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
