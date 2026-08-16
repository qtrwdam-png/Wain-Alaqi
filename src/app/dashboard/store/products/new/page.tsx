"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithRetry } from "@/lib/fetch-retry";
import { ImageInput } from "@/components/image-input";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ name: "", categoryId: "", description: "", price: "", availability: "AVAILABLE", image: "", active: true });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchWithRetry("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || [])); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        categoryId: form.categoryId || undefined,
        description: form.description || undefined,
        price: form.price ? Number(form.price) : undefined,
        availability: form.availability,
        image: form.image || undefined,
        active: form.active,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
    router.push("/dashboard/store/products");
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">إضافة منتج</h1>
      <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
        <div><label className="label">اسم المنتج *</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">القطاع</label>
          <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">بدون قطاع</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className="label">الوصف</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">السعر (د.أ)</label><input type="number" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          <div><label className="label">حالة التوفر</label>
            <select className="input" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
              <option value="AVAILABLE">متوفر</option>
              <option value="LOW_STOCK">كمية محدودة</option>
              <option value="OUT_OF_STOCK">غير متوفر</option>
              <option value="UNKNOWN">غير معروف</option>
            </select>
          </div>
        </div>
        <ImageInput label="صورة المنتج" value={form.image} onChange={(image) => setForm({ ...form, image })} hint="ارفع صورة من جهازك أو الصق رابطاً خارجياً" kind="product" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> نشط (ظاهر للعامة)</label>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "جارٍ الحفظ…" : "حفظ المنتج"}</button>
      </form>
    </div>
  );
}
