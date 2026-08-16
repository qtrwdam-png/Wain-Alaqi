"use client";

import { useState, useEffect } from "react";
import { fetchWithRetry } from "@/lib/fetch-retry";

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
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWithRetry("/api/cities").then((r) => r.json()).then((d) => setCities(d.cities || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.cityId) { setDistricts([]); return; }
    fetchWithRetry(`/api/districts?cityId=${form.cityId}`).then((r) => r.json()).then((d) => {
      setDistricts(d.districts || []);
    }).catch(() => setDistricts([]));
  }, [form.cityId]);

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
        <div>
          <label className="label">الحي / المنطقة</label>
          <select className="input" value={form.districtId} onChange={(e) => setForm({ ...form, districtId: e.target.value })} disabled={districts.length === 0}>
            <option value="">{districts.length === 0 ? "لا توجد أحياء مسجلة" : "اختر الحي (اختياري)"}</option>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">رابط الشعار</label><input className="input" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} /></div>
        <div><label className="label">رابط صورة الغلاف</label><input className="input" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} /></div>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {saved && <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-700">تم حفظ التغييرات بنجاح.</p>}
      <button type="submit" disabled={loading} className="btn-primary">{loading ? "جارٍ الحفظ…" : "حفظ التغييرات"}</button>
    </form>
  );
}
