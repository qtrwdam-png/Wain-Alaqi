"use client";

import { useState, useEffect } from "react";
import { fetchWithRetry } from "@/lib/fetch-retry";
import { ImageInput } from "@/components/image-input";
import { DistrictSearchSelect } from "@/components/district-search-select";

type StoreWithLocation = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  logo: string | null;
  coverImage: string | null;
  cityId: string | null;
  districtId: string | null;
  city?: { id: string; name: string } | null;
  district?: { id: string; name: string } | null;
};

export function StoreSettingsForm({ store }: { store: StoreWithLocation }) {
  const [form, setForm] = useState({
    name: store.name, description: store.description || "", phone: store.phone || "", whatsapp: store.whatsapp || "",
    address: store.address || "", logo: store.logo || "", coverImage: store.coverImage || "",
    cityId: store.cityId || "", districtId: store.districtId || "",
  });
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWithRetry("/api/cities").then((r) => r.json()).then((d) => setCities(d.cities || [])).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null); setSaved(false);
    const res = await fetchWithRetry(`/api/stores/${store.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
    setSaved(true);
  }

  return (
    <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
      <div><label className="label">اسم المتجر</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div><label className="label">الوصف</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">الهاتف</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div><label className="label">واتساب</label><input className="input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
      </div>
      <div><label className="label">العنوان</label><input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">المدينة *</label>
          <select className="input" required value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value, districtId: "" })}>
            <option value="">اختر المدينة</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <DistrictSearchSelect
          cityId={form.cityId}
          value={form.districtId}
          onChange={(districtId) => setForm({ ...form, districtId })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageInput label="شعار المتجر" value={form.logo} onChange={(logo) => setForm({ ...form, logo })} hint="ارفع صورة من جهازك أو الصق رابطاً خارجياً" kind="store" />
        <ImageInput label="صورة الغلاف" value={form.coverImage} onChange={(coverImage) => setForm({ ...form, coverImage })} hint="ارفع صورة من جهازك أو الصق رابطاً خارجياً" kind="store" />
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {saved && <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-700">تم حفظ التغييرات بنجاح.</p>}
      <button type="submit" disabled={loading} className="btn-primary">{loading ? "جارٍ الحفظ…" : "حفظ التغييرات"}</button>
    </form>
  );
}
