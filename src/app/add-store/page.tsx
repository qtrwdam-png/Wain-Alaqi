"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AddStorePage() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    storeName: "", categoryId: "", cityId: "", description: "", phone: "", whatsapp: "", address: "",
    latitude: undefined as number | undefined, longitude: undefined as number | undefined,
    logo: "", coverImage: "", openingHours: "",
    ownerName: "", ownerEmail: "", ownerPhone: "", ownerPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/cities").then((r) => r.json()),
    ]).then(([c, ci]) => {
      setCategories(c.categories || []);
      setCities(ci.cities || []);
      if (ci.cities?.[0]) setForm((f) => ({ ...f, cityId: ci.cities[0].id }));
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/stores/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="container-app py-20 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl">✓</div>
          <h1 className="text-2xl font-extrabold text-gray-900">تم إرسال طلبك بنجاح</h1>
          <p className="mt-2 text-gray-500">سيتم مراجعة المتجر من إدارة المنصة. يمكنك تسجيل الدخول بعد الموافقة.</p>
          <Link href="/login" className="btn-primary mt-6 inline-block">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-extrabold text-gray-900">أضف متجرك</h1>
        <p className="mt-2 text-gray-500">املأ النموذج، وسيتم مراجعة طلبك من إدارة المنصة قبل ظهوره للعامة.</p>

        <form onSubmit={submit} className="mt-8 space-y-8">
          <fieldset className="card space-y-4 p-6">
            <legend className="px-2 text-lg font-bold">معلومات المتجر</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">اسم المتجر *</label><input className="input" required value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} /></div>
              <div><label className="label">القطاع *</label>
                <select className="input" required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">اختر القطاع</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div><label className="label">الوصف</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">الهاتف</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="label">واتساب</label><input className="input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="9627XXXXXXXX" /></div>
            </div>
            <div><label className="label">العنوان *</label><input className="input" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className="label">خط العرض</label><input type="number" step="any" className="input" value={form.latitude ?? ""} onChange={(e) => setForm({ ...form, latitude: e.target.value ? Number(e.target.value) : undefined })} /></div>
              <div><label className="label">خط الطول</label><input type="number" step="any" className="input" value={form.longitude ?? ""} onChange={(e) => setForm({ ...form, longitude: e.target.value ? Number(e.target.value) : undefined })} /></div>
              <div><label className="label">المدينة *</label>
                <select className="input" required value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })}>
                  <option value="">اختر المدينة</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div><label className="label">ساعات العمل</label><input className="input" value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} placeholder="السبت-الخميس: 9 صباحاً - 9 مساءً" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">رابط الشعار</label><input className="input" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://…" /></div>
              <div><label className="label">رابط صورة الغلاف</label><input className="input" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://…" /></div>
            </div>
          </fieldset>

          <fieldset className="card space-y-4 p-6">
            <legend className="px-2 text-lg font-bold">معلومات المالك</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">الاسم *</label><input className="input" required value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} /></div>
              <div><label className="label">البريد الإلكتروني *</label><input type="email" className="input" required value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">رقم الهاتف</label><input className="input" value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} /></div>
              <div><label className="label">كلمة المرور *</label><input type="password" className="input" required value={form.ownerPassword} onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })} /></div>
            </div>
          </fieldset>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full text-base">{loading ? "جارٍ الإرسال…" : "إرسال الطلب"}</button>
        </form>
      </div>
    </div>
  );
}
