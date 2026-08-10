"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function AdminProductsFilters({ categories, stores, current }: {
  categories: { id: string; name: string }[];
  stores: { id: string; name: string }[];
  current: { categoryId?: string; storeId?: string; q?: string };
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [, start] = useTransition();

  function update(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value); else p.delete(key);
    start(() => router.push(`/admin/products?${p.toString()}`));
  }

  return (
    <div className="mt-4 rounded-lg bg-white p-4 ring-1 ring-gray-100">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label">بحث</label>
          <input defaultValue={current.q || ""} onKeyDown={(e) => { if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value); }} placeholder="اسم المنتج…" className="input w-full" />
        </div>
        <div>
          <label className="label">القطاع</label>
          <select defaultValue={current.categoryId || ""} onChange={(e) => update("categoryId", e.target.value)} className="input w-full">
            <option value="">الكل</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">المتجر</label>
          <select defaultValue={current.storeId || ""} onChange={(e) => update("storeId", e.target.value)} className="input w-full">
            <option value="">الكل</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
