"use client";

import { useState } from "react";
import type { Store } from "@prisma/client";
import { fetchWithRetry } from "@/lib/fetch-retry";

export function StoreSettingsForm({ store }: { store: Store }) {
  const [form, setForm] = useState({
    name: store.name, description: store.description || "", phone: store.phone || "", whatsapp: store.whatsapp || "",
    address: store.address || "", logo: store.logo || "", coverImage: store.coverImage || "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        <div><label className="label">رابط الشعار</label><input className="input" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} /></div>
        <div><label className="label">رابط صورة الغلاف</label><input className="input" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} /></div>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {saved && <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-700">تم حفظ التغييرات بنجاح.</p>}
      <button type="submit" disabled={loading} className="btn-primary">{loading ? "جارٍ الحفظ…" : "حفظ التغييرات"}</button>
    </form>
  );
}
