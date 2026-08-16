"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchResultsClient({ q, categories, searchParams }: {
  q: string;
  categories: { id: string; name: string }[];
  searchParams: any;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [searchQ, setSearchQ] = useState(q || "");
  const [cat, setCat] = useState(searchParams.cat || "");
  const [sort, setSort] = useState(searchParams.sort || "relevance");
  const [avail, setAvail] = useState(searchParams.avail || "");

  function doSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams(params.toString());
    if (searchQ.trim()) p.set("q", searchQ.trim()); else p.delete("q");
    router.push(`/search?${p.toString()}`);
  }

  function apply() {
    const p = new URLSearchParams(params.toString());
    if (cat) p.set("cat", cat); else p.delete("cat");
    if (sort && sort !== "relevance") p.set("sort", sort); else p.delete("sort");
    if (avail) p.set("avail", avail); else p.delete("avail");
    router.push(`/search?${p.toString()}`);
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Persistent search bar — lets the user run a new query without going back */}
      <form onSubmit={doSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="ابحث عن منتج أو خدمة…"
          className="input flex-1"
          aria-label="حقل البحث"
        />
        <button type="submit" className="btn-primary shrink-0">بحث</button>
      </form>

      <div className="rounded-lg bg-white p-4 ring-1 ring-gray-100">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">القطاع</label>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="input w-full">
              <option value="">الكل</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">الترتيب</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input w-full">
              <option value="relevance">الأكثر صلة</option>
              <option value="price_asc">السعر: من الأقل</option>
              <option value="price_desc">السعر: من الأعلى</option>
              <option value="nearest">الأقرب</option>
              <option value="rating">الأعلى تقييماً</option>
              <option value="recent">الأحدث</option>
            </select>
          </div>
          <div>
            <label className="label">التوفر</label>
            <select value={avail} onChange={(e) => setAvail(e.target.value)} className="input w-full">
              <option value="">الكل</option>
              <option value="AVAILABLE">متوفر</option>
              <option value="LOW_STOCK">كمية محدودة</option>
              <option value="OUT_OF_STOCK">غير متوفر</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={apply} className="btn-primary w-full">تطبيق</button>
          </div>
        </div>
      </div>
    </div>
  );
}
