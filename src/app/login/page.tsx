"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Default destination per role after a successful login.
function homeForRole(role?: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "STORE_OWNER") return "/dashboard/store";
  return "/account";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "";
  const registered = params.get("registered") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) { setError("البريد أو كلمة المرور غير صحيحة"); setLoading(false); return; }
    // Fetch the fresh session to read the role and route accordingly.
    const session = await getSession();
    const role = (session?.user as any)?.role as string | undefined;
    const dest = from && from !== "/" ? from : homeForRole(role);
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-10">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold text-gray-900">تسجيل الدخول</h1>
        <p className="mt-1 text-sm text-gray-500">ادخل بياناتك للوصول إلى لوحة التحكم.</p>
        {registered && (
          <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm text-brand-700">تم إنشاء حسابك بنجاح. سجّل الدخول للمتابعة.</p>
        )}
        {from === "/add-store" && !registered && (
          <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm text-brand-700">سجّل الدخول للمتابعة في إنشاء متجرك.</p>
        )}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required autoComplete="email" />
          </div>
          <div>
            <label className="label">كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required autoComplete="current-password" />
          </div>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "جارٍ الدخول…" : "دخول"}</button>
        </form>
        <div className="mt-6 space-y-2 text-sm text-gray-500">
          <p>حسابات تجريبية:</p>
          <p className="font-mono text-xs">store1@example.com / ChangeMe123! (تاجر)</p>
          <p className="font-mono text-xs">user@example.com / ChangeMe123! (مستخدم)</p>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          ليس لديك حساب؟ <Link href="/register" className="text-brand-700 hover:underline">أنشئ حساباً</Link>
        </p>
        <p className="mt-3 border-t pt-3 text-center text-sm text-gray-500">
          مدير المنصة؟ <Link href="/admin/login" className="font-medium text-brand-700 hover:underline">تسجيل دخول الإدارة</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container-app py-20 text-center text-gray-400">جارٍ التحميل…</div>}>
      <LoginForm />
    </Suspense>
  );
}
