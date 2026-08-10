"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/admin/products?storeId=all`).then((r) => r.json()),
    ]).then(async ([c, _]) => {
      setCategories(c.categories || []);
      const pRes = await fetch("/api/admin/products");
      const pData = await pRes.json();
      const product = (pData.products || []).find((x: any) => x.id === id);
      if (product) setForm({ name: product.name, categoryId: product.categoryId || "", description: product.description || "", price: product.price ?? "", availability: product.availability, image: product.image || "", active: product.active });
    });
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
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

  async function del() {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard/store/products");
  }

  if (!form) return <p className="text-gray-500">جارٍ التحميل…</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-extrabold text-gray-900">تعديل المنتج</h1>
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
        <div><label className="label">رابط الصورة</label><input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> نشط (ظاهر للعامة)</label>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? "جارٍ الحفظ…" : "حفظ"}</button>
          <button type="button" onClick={del} className="btn-danger">حذف</button>
        </div>
      </form>
    </div>
  );
}
