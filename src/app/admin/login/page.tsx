"use client";

import { useState } from "react";
import { signIn, getSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { APP_NAME } from "@/config/constants";
import { Logo } from "@/components/logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("البريد أو كلمة المرور غير صحيحة");
      setLoading(false);
      return;
    }
    const session = await getSession();
    const role = (session?.user as any)?.role as string | undefined;
    // Only staff (ADMIN / CONTENT_MANAGER) may enter the admin area.
    if (role !== "ADMIN" && role !== "CONTENT_MANAGER") {
      await signOut({ redirect: false });
      setError("هذه الصفحة مخصصة لإدارة المنصة فقط. حسابك لا يملك صلاحية الإدارة.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <Logo size={44} withText={false} priority />
          <div>
            <p className="text-xs text-gray-400">{APP_NAME} — لوحة الإدارة</p>
            <h1 className="text-xl font-extrabold text-gray-900">تسجيل دخول الإدارة</h1>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          هذه الصفحة مخصصة لمديري المنصة والمحررين فقط. الحسابات العادية وتجار المتاجر لا يمكنها الدخول من هنا.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "جارٍ الدخول…" : "دخول الإدارة"}
          </button>
        </form>

        <div className="mt-6 border-t pt-4 text-center text-sm text-gray-500">
          <p>
            دخول التاجر أو المستخدم؟{" "}
            <Link href="/login" className="text-brand-700 hover:underline">
              صفحة الدخول العامة
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
