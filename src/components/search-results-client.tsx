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
  const [cat, setCat] = useState(searchParams.cat || "");
  const [sort, setSort] = useState(searchParams.sort || "relevance");
  const [avail, setAvail] = useState(searchParams.avail || "");

  function apply() {
    const p = new URLSearchParams(params.toString());
    if (cat) p.set("cat", cat); else p.delete("cat");
    if (sort && sort !== "relevance") p.set("sort", sort); else p.delete("sort");
    if (avail) p.set("avail", avail); else p.delete("avail");
    router.push(`/search?${p.toString()}`);
  }

  return (
    <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 ring-1 ring-gray-100">
      <div>
        <label className="label">القطاع</label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="input min-w-[150px]">
          <option value="">الكل</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label">الترتيب</label>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input min-w-[150px]">
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
        <select value={avail} onChange={(e) => setAvail(e.target.value)} className="input min-w-[140px]">
          <option value="">الكل</option>
          <option value="AVAILABLE">متوفر</option>
          <option value="LOW_STOCK">كمية محدودة</option>
          <option value="OUT_OF_STOCK">غير متوفر</option>
        </select>
      </div>
      <button onClick={apply} className="btn-primary">تطبيق</button>
    </div>
  );
}
