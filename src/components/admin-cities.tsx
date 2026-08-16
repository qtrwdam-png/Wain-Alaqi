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

type District = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  _count: { stores: number };
};

export function CitiesAdminClient({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", country: "الأردن", latitude: undefined as number | undefined, longitude: undefined as number | undefined });
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);

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
          <div key={c.id} className="card overflow-hidden">
            <div className="flex items-center justify-between p-3">
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
                  onClick={() => setExpandedCity(expandedCity === c.id ? null : c.id)}
                  className="btn-secondary px-3 py-1 text-sm"
                  aria-label={`إدارة أحياء ${c.name}`}
                >
                  {expandedCity === c.id ? "إغلاق" : "الأحياء"}
                </button>
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
            {expandedCity === c.id && (
              <DistrictsPanel cityId={c.id} cityName={c.name} cityLat={c.latitude} cityLng={c.longitude} />
            )}
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

/** Collapsible panel for managing districts within a city. */
function DistrictsPanel({ cityId, cityName, cityLat, cityLng }: { cityId: string; cityName: string; cityLat: number; cityLng: number }) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [indexing, setIndexing] = useState(false);
  const [indexResult, setIndexResult] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function loadDistricts() {
    setLoading(true);
    try {
      const res = await fetchWithRetry(`/api/admin/cities/${cityId}/districts`);
      const data = await res.json();
      setDistricts(data.districts || []);
    } catch {
      setDistricts([]);
    }
    setLoading(false);
  }

  // Load once when panel mounts
  useState(() => { loadDistricts(); });

  async function autoIndex() {
    setIndexing(true);
    setIndexResult(null);
    try {
      const res = await fetchWithRetry(`/api/admin/cities/${cityId}/districts`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        setIndexResult(`تم العثور على ${data.found} حي وإضافة ${data.created} منها.`);
        await loadDistricts();
      } else {
        setIndexResult(data.error || "تعذّر الفهرسة التلقائية.");
      }
    } catch {
      setIndexResult("تعذّر الاتصال بالخادم. حاول لاحقاً.");
    }
    setIndexing(false);
  }

  async function addDistrict(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    if (!newName.trim()) return;
    const res = await fetchWithRetry(`/api/admin/cities/${cityId}/districts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), latitude: cityLat, longitude: cityLng }),
    });
    const data = await res.json();
    if (!res.ok) { setAddError(data.error || "حدث خطأ"); return; }
    setNewName("");
    await loadDistricts();
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    await fetchWithRetry(`/api/admin/districts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditingId(null);
    await loadDistricts();
  }

  async function toggleActive(d: District) {
    await fetchWithRetry(`/api/admin/districts/${d.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !d.active }),
    });
    await loadDistricts();
  }

  async function deleteDistrict(d: District) {
    const hint = d._count.stores > 0
      ? `سيتم فصل ${d._count.stores} متجر عن هذا الحي ثم حذفه.`
      : "سيتم حذف الحي نهائياً.";
    if (!window.confirm(`حذف الحي «${d.name}»؟\n${hint}\nهل أنت متأكد؟`)) return;
    await fetchWithRetry(`/api/admin/districts/${d.id}`, { method: "DELETE" });
    await loadDistricts();
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50/50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold text-gray-700">أحياء {cityName}</h3>
        <button
          type="button"
          onClick={autoIndex}
          disabled={indexing}
          className="btn-accent px-3 py-1.5 text-sm"
        >
          {indexing ? "جارٍ الفهرسة…" : "⚡ فهرسة تلقائية"}
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-400">
        الفهرسة التلقائية تجلب الأحياء من OpenStreetMap. راجع النتائج وأضف/عدّل ما يلزم.
      </p>

      {indexResult && (
        <p className="mt-2 rounded bg-blue-50 p-2 text-sm text-blue-700">{indexResult}</p>
      )}

      {/* Add district form */}
      <form onSubmit={addDistrict} className="mt-3 flex gap-2">
        <input
          className="input flex-1"
          placeholder="اسم حي جديد…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" className="btn-primary shrink-0 px-4 text-sm">إضافة</button>
      </form>
      {addError && <p className="mt-1 text-sm text-red-600">{addError}</p>}

      {/* Districts list */}
      {loading ? (
        <p className="mt-3 text-sm text-gray-400">جارٍ التحميل…</p>
      ) : districts.length === 0 ? (
        <p className="mt-3 rounded bg-white p-3 text-center text-sm text-gray-400">
          لا توجد أحياء بعد. استخدم الفهرسة التلقائية أو أضف يدوياً.
        </p>
      ) : (
        <div className="mt-3 space-y-1">
          {districts.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded bg-white p-2 ring-1 ring-gray-100">
              {editingId === d.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    className="input flex-1 text-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => saveEdit(d.id)} className="btn-primary px-2 py-1 text-xs">حفظ</button>
                  <button onClick={() => setEditingId(null)} className="btn-ghost px-2 py-1 text-xs">إلغاء</button>
                </div>
              ) : (
                <>
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-sm text-gray-700">🏘️</span>
                    <span className="truncate text-sm font-medium text-gray-700">{d.name}</span>
                    {d._count.stores > 0 && <span className="text-xs text-gray-400">{d._count.stores} متجر</span>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span
                      className={`badge ${d.active ? "badge-green" : "badge-gray"} cursor-pointer`}
                      onClick={() => toggleActive(d)}
                      title="تبديل الحالة"
                    >
                      {d.active ? "نشط" : "معطل"}
                    </span>
                    <button
                      onClick={() => { setEditingId(d.id); setEditName(d.name); }}
                      className="btn-ghost px-2 py-1 text-xs"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => deleteDistrict(d)}
                      className="btn-danger px-2 py-1 text-xs"
                    >
                      حذف
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
