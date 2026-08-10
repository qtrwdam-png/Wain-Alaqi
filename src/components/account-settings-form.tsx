"use client";

import { useState } from "react";
import { fetchWithRetry } from "@/lib/fetch-retry";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string | Date;
};

export function AccountSettingsForm({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    setSaving(true);
    try {
      const res = await fetchWithRetry("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ");
      } else {
        setSuccess("تم حفظ التغييرات بنجاح");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        if (data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setPhone(data.user.phone || "");
        }
      }
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  }

  const roleLabel = profile.role === "ADMIN" ? "مدير" : profile.role === "STORE_OWNER" ? "تاجر" : "مستخدم";

  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-extrabold text-gray-900">إعدادات الحساب</h1>
        <p className="mt-1 text-sm text-gray-500">قم بتعديل بياناتك الشخصية وكلمة المرور.</p>

        <div className="card mt-6 flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
            {profile.name?.charAt(0) || "؟"}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-gray-800">{profile.name}</p>
            <p className="truncate text-sm text-gray-500">
              {roleLabel} · عضو منذ {new Date(profile.createdAt).toLocaleDateString("ar")}
            </p>
          </div>
        </div>

        <form onSubmit={save} className="mt-6 space-y-6">
          <fieldset className="card space-y-4 p-6">
            <legend className="px-2 text-lg font-bold">البيانات الشخصية</legend>
            <div>
              <label className="label">الاسم *</label>
              <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">البريد الإلكتروني *</label>
              <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">رقم الهاتف</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9627XXXXXXXX" />
            </div>
          </fieldset>

          <fieldset className="card space-y-4 p-6">
            <legend className="px-2 text-lg font-bold">تغيير كلمة المرور</legend>
            <p className="text-sm text-gray-400">اترك الحقول فارغة إذا لا تريد تغيير كلمة المرور.</p>
            <div>
              <label className="label">كلمة المرور الحالية</label>
              <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">كلمة المرور الجديدة</label>
                <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
              </div>
              <div>
                <label className="label">تأكيد كلمة المرور</label>
                <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              </div>
            </div>
          </fieldset>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {success && <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-700">{success}</p>}

          <button type="submit" disabled={saving} className="btn-primary w-full text-base">
            {saving ? "جارٍ الحفظ…" : "حفظ التغييرات"}
          </button>
        </form>
      </div>
    </div>
  );
}
