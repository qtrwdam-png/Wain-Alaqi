"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Cat = { id: string; name: string; slug: string; icon: string | null; sortOrder: number; active: boolean; _count: { stores: number; products: number } };

export function CategoriesAdminClient({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", icon: "", sortOrder: 0 });
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, icon: form.icon, sortOrder: Number(form.sortOrder), active: true }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
    setForm({ name: "", icon: "", sortOrder: 0 });
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="card flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{c.icon || "🏷️"}</span>
              <div>
                <p className="font-bold text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400">{c._count.stores} متجر · {c._count.products} منتج · ترتيب {c.sortOrder}</p>
              </div>
            </div>
            <span className={`badge ${c.active ? "badge-green" : "badge-gray"}`}>{c.active ? "نشط" : "معطل"}</span>
          </div>
        ))}
      </div>
      <form onSubmit={create} className="card space-y-3 p-4">
        <h2 className="font-bold">إضافة قطاع</h2>
        <div><label className="label">الاسم</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">الأيقونة (إيموجي)</label><input className="input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🏷️" /></div>
        <div><label className="label">الترتيب</label><input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <button type="submit" className="btn-primary w-full">إضافة</button>
      </form>
    </div>
  );
}
