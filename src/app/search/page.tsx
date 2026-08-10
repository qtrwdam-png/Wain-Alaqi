import { searchProducts, SearchFilters } from "@/lib/search";
import { prisma } from "@/lib/prisma";
import { AVAILABILITY_LABELS } from "@/config/constants";
import { formatPrice, formatDistance, timeAgo } from "@/lib/utils";
import Link from "next/link";
import { SearchResultsClient } from "@/components/search-results-client";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata = { title: "نتائج البحث" };

type SP = { q?: string; cat?: string; sort?: string; min?: string; max?: string; avail?: string; lat?: string; lng?: string };

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const q = (searchParams.q || "").trim();
  const filters: SearchFilters = {
    categoryId: searchParams.cat || undefined,
    sort: (searchParams.sort as SearchFilters["sort"]) || undefined,
    minPrice: searchParams.min ? Number(searchParams.min) : undefined,
    maxPrice: searchParams.max ? Number(searchParams.max) : undefined,
    availability: searchParams.avail || undefined,
    lat: searchParams.lat ? Number(searchParams.lat) : undefined,
    lng: searchParams.lng ? Number(searchParams.lng) : undefined,
  };

  const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }).catch(() => []);

  const results = q ? await searchProducts(q, filters).catch(() => []) : [];

  return (
    <div className="container-app py-6 sm:py-8">
      {q && (
        <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
          نتائج البحث عن: <span className="text-brand-700">«{q}»</span>
        </h1>
      )}
      <p className="mt-1 text-sm text-gray-500">{results.length} نتيجة</p>

      <Suspense fallback={<div className="mt-4 text-sm text-gray-400">جارٍ التحميل…</div>}>
        <SearchResultsClient q={q} categories={categories} searchParams={searchParams} />
      </Suspense>

      {!q ? (
        <p className="mt-8 rounded-lg bg-gray-50 p-8 text-center text-gray-500">اكتب كلمة بحث للبدء.</p>
      ) : results.length === 0 ? (
        <div className="mt-8 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-lg font-bold text-gray-700">لم تجد ما تبحث عنه؟</p>
          <p className="mt-1 text-gray-500">أرسل طلب بحث وسنبذل جهدنا للعثور عليه.</p>
          <Link href={`/search-request?query=${encodeURIComponent(q)}`} className="btn-accent mt-4 inline-block">أرسل طلب بحث</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {results.map((r) => {
            const phoneHref = r.storePhone ? `tel:${r.storePhone.replace(/\s/g, "")}` : null;
            const waHref = r.storeWhatsapp ? `https://wa.me/${r.storeWhatsapp.replace(/[^\d]/g, "")}` : null;
            const dirHref = r.storeLatitude && r.storeLongitude ? `https://www.openstreetmap.org/?mlat=${r.storeLatitude}&mlon=${r.storeLongitude}` : null;
            return (
              <div key={r.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50 sm:h-24 sm:w-24">
                  {r.image ? <img src={r.image} alt={r.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-3xl text-gray-300">📦</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-900">{r.name}</h3>
                    <span className={`badge ${r.availability === "AVAILABLE" ? "badge-green" : r.availability === "OUT_OF_STOCK" ? "badge-red" : "badge-gray"}`}>
                      {AVAILABILITY_LABELS[r.availability] || r.availability}
                    </span>
                  </div>
                  <Link href={`/stores/${r.storeSlug}`} className="text-sm text-brand-600 hover:underline">
                    {r.storeName}{r.storeVerified ? " ✓ موثق" : ""}
                  </Link>
                  {r.description && <p className="mt-1 line-clamp-1 text-sm text-gray-500">{r.description}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="font-bold text-brand-700">{formatPrice(r.price)}</span>
                    {r.distance != null && <span>📍 {formatDistance(r.distance)}</span>}
                    {r.storeRating > 0 && <span>⭐ {r.storeRating.toFixed(1)}</span>}
                    <span>آخر تحديث: {timeAgo(r.lastStockUpdate)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {phoneHref && <a href={phoneHref} className="btn-secondary text-xs">اتصل</a>}
                  {waHref && <a href={waHref} target="_blank" rel="noreferrer" className="btn-accent text-xs">واتساب</a>}
                  {dirHref && <a href={dirHref} target="_blank" rel="noreferrer" className="btn-ghost text-xs">الاتجاهات</a>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
