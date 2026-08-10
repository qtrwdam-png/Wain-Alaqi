import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { SearchBox } from "@/components/search-box";
import { APP_NAME, APP_TAGLINE } from "@/config/constants";
import { CategoryCard } from "@/components/category-card";
import { StoreCard } from "@/components/store-card";
import { Content } from "@/lib/content";

export const dynamic = "force-dynamic";

async function getPopularSearches() {
  try {
    const rows = await prisma.searchQuery.groupBy({
      by: ["query"],
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 8,
    });
    return rows.map((r) => r.query);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  let categories: any[] = [];
  let featuredStores: any[] = [];
  let popular: string[] = [];
  try {
    [categories, featuredStores, popular] = await Promise.all([
      prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.store.findMany({
        where: { status: "APPROVED", isFeatured: true },
        take: 8,
        orderBy: { rating: "desc" },
        include: { category: true },
      }),
      getPopularSearches(),
    ]);
  } catch {
    // DB not ready — render with empty data
  }

  const hero = await Content.getHomeHero();
  const popularDefault = popular.length ? popular : ["بطارية كيا سيراتو", "شاحن آيفون 20 واط", "سباك", "قطع غيار تويوتا", "دهانات"];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-app py-12 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-sm text-brand-700">
              📍 الرمثا، الأردن
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              {APP_NAME}
            </h1>
            <p className="mt-4 text-lg text-gray-600 sm:text-xl">
              {hero.description || APP_TAGLINE}
            </p>
            <div className="mt-8">
              <Suspense fallback={<div className="h-14 text-gray-400">جارٍ التحميل…</div>}>
                <SearchBox />
              </Suspense>
            </div>
            {popularDefault.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="text-gray-500">الأكثر بحثاً:</span>
                {popularDefault.map((p) => (
                  <Link
                    key={p}
                    href={`/search?q=${encodeURIComponent(p)}`}
                    className="rounded-full bg-white px-3 py-1 text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-app py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">القطاعات</h2>
          <Link href="/categories" className="text-sm font-medium text-brand-700 hover:underline">
            عرض الكل
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* Featured stores */}
      {featuredStores.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="container-app">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">متاجر مميزة</h2>
              <Link href="/stores" className="text-sm font-medium text-brand-700 hover:underline">
                عرض الكل
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredStores.map((s) => (
                <StoreCard key={s.id} store={s as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-app py-12">
        <div className="overflow-hidden rounded-2xl bg-brand-700 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">هل لديك متجر؟</h2>
          <p className="mt-2 text-brand-100">أضف متجرك مجانًا واصل لعملاء الرمثا.</p>
          <Link href="/add-store" className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-bold text-brand-700 hover:bg-brand-50">
            أضف متجرك مجانًا
          </Link>
        </div>
      </section>
    </div>
  );
}
