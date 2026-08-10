"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { fetchWithRetry } from "@/lib/fetch-retry";
import { LocationPickerMap } from "@/components/location-picker-map";

export default function AddStorePage() {
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    storeName: "", categoryId: "", cityId: "", description: "", phone: "", whatsapp: "", address: "",
    latitude: undefined as number | undefined, longitude: undefined as number | undefined,
    logo: "", coverImage: "", openingHours: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const role = (session?.user as any)?.role as string | undefined;
  const isStaff = role === "ADMIN" || role === "CONTENT_MANAGER";

  useEffect(() => {
    Promise.all([
      fetchWithRetry("/api/categories").then((r) => r.json()),
      fetchWithRetry("/api/cities").then((r) => r.json()),
    ]).then(([c, ci]) => {
      setCategories(c.categories || []);
      setCities(ci.cities || []);
      if (ci.cities?.[0]) setForm((f) => ({ ...f, cityId: ci.cities[0].id }));
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetchWithRetry("/api/stores/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
    setSuccess(true);
  }

  if (status === "loading") {
    return <div className="container-app py-20 text-center text-gray-400">جارٍ التحميل…</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="container-app py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl">🏪</div>
          <h1 className="text-2xl font-extrabold text-gray-900">أنشئ حساب التاجر أولاً</h1>
          <p className="mt-2 text-gray-500">يجب تسجيل حساب قبل إنشاء متجرك. سجّل بياناتك، ثم ستنتقل تلقائياً لصفحة إنشاء المتجر.</p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/register?from=/add-store" className="btn-primary">إنشاء حساب جديد</Link>
            <Link href="/login?from=/add-store" className="btn-secondary">لدي حساب — تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    );
  }

  // Staff manage stores from the admin panel — block the public flow.
  if (isStaff) {
    return (
      <div className="container-app py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl">🛡️</div>
          <h1 className="text-2xl font-extrabold text-gray-900">إدارة المتاجر من لوحة الإدارة</h1>
          <p className="mt-2 text-gray-500">حسابك الإداري لا ينشئ متجراً عبر هذه الصفحة. أدِر المتاجر من لوحة الإدارة.</p>
          <Link href="/admin/stores" className="btn-primary mt-6 inline-block">الذهاب إلى لوحة الإدارة</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container-app py-20 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl">✓</div>
          <h1 className="text-2xl font-extrabold text-gray-900">تم إرسال طلبك بنجاح</h1>
          <p className="mt-2 text-gray-500">سيتم مراجعة المتجر من إدارة المنصة. ستظهر حالة الطلب في لوحة التاجر، وستصلك إشعاراً عند الموافقة أو الرفض.</p>
          <Link href="/dashboard/store" className="btn-primary mt-6 inline-block">الذهاب إلى لوحة التاجر</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-extrabold text-gray-900">أضف متجرك</h1>
        <p className="mt-2 text-gray-500">املأ النموذج، وسيتم مراجعة طلبك من إدارة المنصة قبل ظهوره للعامة.</p>

        {role === "USER" && (
          <div className="mt-4 rounded-lg bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-brand-200">
            <p className="font-bold">ℹ️ ستتحول إلى تاجر</p>
            <p className="mt-1">بإنشاء متجر سيتحول حسابك إلى «تاجر» ويظهر لك زر «لوحة المتجر» لإدارة منتجاتك وإعدادات متجرك. يمكن متابعة حسابك من صفحة «حسابي».</p>
          </div>
        )}

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
            <div><label className="label">العنوان *</label><input className="input" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="مثال: شارع الملك حسين، الرمثا" /></div>
            <div><label className="label">المدينة *</label>
              <select className="input" required value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })}>
                <option value="">اختر المدينة</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">موقع المتجر على الخريطة *</label>
              <p className="mb-2 text-xs text-gray-400">ابحث عن مكان متجرك أو اسحب الدبوس الأزرق إلى الموقع الصحيح، ثم اضغط حفظ الموقع.</p>
              <LocationPickerMap
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
              />
              {(form.latitude || form.longitude) && (
                <p className="mt-2 text-xs text-brand-600">✓ تم تحديد الموقع: {form.latitude?.toFixed(5)}, {form.longitude?.toFixed(5)}</p>
              )}
            </div>
            <div><label className="label">ساعات العمل</label><input className="input" value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} placeholder="السبت-الخميس: 9 صباحاً - 9 مساءً" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">رابط الشعار</label><input className="input" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://…" /></div>
              <div><label className="label">رابط صورة الغلاف</label><input className="input" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://…" /></div>
            </div>
          </fieldset>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full text-base">{loading ? "جارٍ الإرسال…" : "إرسال الطلب"}</button>
        </form>
      </div>
    </div>
  );
}
