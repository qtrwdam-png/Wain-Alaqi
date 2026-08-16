"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithRetry } from "@/lib/fetch-retry";
import { LocationPickerMap } from "@/components/location-picker-map";

type City = {
  id: string;
  name: string;
  slug: string;
  country: string;
  latitude: number;
  longitude: number;
  active: boolean;
  _count: { stores: number };
};

export function CitiesAdminClient({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", country: "الأردن", latitude: undefined as number | undefined, longitude: undefined as number | undefined });
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.latitude || !form.longitude) {
      setError("يرجى تحديد موقع المدينة على الخريطة");
      return;
    }
    const res = await fetchWithRetry("/api/admin/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
    setForm({ name: "", country: "الأردن", latitude: undefined, longitude: undefined });
    router.refresh();
  }

  async function remove(id: string, name: string, storeCount: number) {
    setDeleteError(null);
    const hint = storeCount > 0
      ? `تنبيه: هذا القطاع يحتوي على ${storeCount} متجر. لا يمكن حذفها ما دام تحتوي على متاجر.`
      : "سيتم حذف المدينة نهائياً.";
    const ok = window.confirm(`حذف المدينة «${name}»؟\n\n${hint}\n\nهل أنت متأكد؟`);
    if (!ok) return;
    setDeletingId(id);
    const res = await fetchWithRetry(`/api/admin/cities/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setDeletingId(null);
    if (!res.ok) { setDeleteError(data.error || "حدث خطأ أثناء الحذف"); return; }
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-2">
        {deleteError && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{deleteError}</p>}
        {cities.map((c) => (
          <div key={c.id} className="card flex items-center justify-between p-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-2xl">📍</span>
              <div className="min-w-0">
                <p className="font-bold text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400">{c.country} · {c._count.stores} متجر · {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={`badge ${c.active ? "badge-green" : "badge-gray"}`}>{c.active ? "نشط" : "معطل"}</span>
              <button
                type="button"
                onClick={() => remove(c.id, c.name, c._count.stores)}
                disabled={deletingId === c.id}
                className="btn-danger px-3 py-1 text-sm"
                aria-label={`حذف المدينة ${c.name}`}
              >
                {deletingId === c.id ? "جارٍ…" : "حذف"}
              </button>
            </div>
          </div>
        ))}
        {cities.length === 0 && <p className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">لا توجد مدن بعد.</p>}
      </div>

      <form onSubmit={create} className="card space-y-3 p-4">
        <h2 className="font-bold">إضافة مدينة</h2>
        <div><label className="label">اسم المدينة *</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: إربد" /></div>
        <div><label className="label">الدولة</label><input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
        <div>
          <label className="label">موقع المدينة على الخريطة *</label>
          <p className="mb-2 text-xs text-gray-400">ابحث أو اسحب الدبوس إلى مركز المدينة.</p>
          <LocationPickerMap
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
          />
          {form.latitude != null && (
            <p className="mt-2 text-xs text-brand-600">✓ تم تحديد الموقع: {form.latitude.toFixed(5)}, {form.longitude?.toFixed(5)}</p>
          )}
        </div>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <button type="submit" className="btn-primary w-full">إضافة المدينة</button>
      </form>
    </div>
  );
}
