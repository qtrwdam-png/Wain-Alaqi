"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWithRetry } from "@/lib/fetch-retry";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/";
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetchWithRetry("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
    // خزّن كلمة المرور مؤقتاً للدخول التلقائي بعد تأكيد البريد.
    try {
      sessionStorage.setItem("pending_login_password", form.password);
    } catch {}
    router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
  }

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-10">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">إنشاء حساب</h1>
        {from === "/add-store" && (
          <p className="mt-1 text-sm text-brand-700">سجّل حسابك أولاً، ثم ستنتقل لإنشاء متجرك.</p>
        )}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">الاسم</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">الهاتف (اختياري)</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">كلمة المرور</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" required />
          </div>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "جارٍ الإنشاء…" : "إنشاء الحساب"}</button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          لديك حساب؟ <Link href="/login" className="text-brand-700 hover:underline">سجّل الدخول</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container-app py-20 text-center text-gray-400">جارٍ التحميل…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
