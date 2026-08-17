import Link from "next/link";
import { Suspense } from "react";
import { SearchBox } from "@/components/search-box";
import { APP_NAME, APP_TAGLINE } from "@/config/constants";
import { CategoryCard } from "@/components/category-card";
import { StoreCard } from "@/components/store-card";
import { Content } from "@/lib/content";
import { getCategories, getFeaturedStores } from "@/lib/cached-queries";
import { getTrendingKeywords, seedPinnedKeywords } from "@/lib/keywords";

export const revalidate = 3600;

async function getPopular() {
  try {
    // ensure pinned (fixed) keywords exist before reading trending list
    await seedPinnedKeywords();
    return await getTrendingKeywords();
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
      getCategories(),
      getFeaturedStores(),
      getPopular(),
    ]);
  } catch {
    // DB not ready — render with empty data
  }

  const hero = await Content.getHomeHero();
  const sectionOrder = await Content.get("home_section_order");
  const featuredFirst = sectionOrder === "featured_first";
  // getPopular() returns the pinned (fixed) keywords + any trending dynamic
  // keywords (auto-expire after 3 days of no searches). It never returns the
  // old demo fallback list.
  const popularDefault = popular;

  const categoriesSection = (
    <section className="container-app py-10 sm:py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">القطاعات</h2>
        <Link href="/categories" className="text-sm font-medium text-brand-700 hover:underline">
          عرض الكل
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {categories.map((c) => (
          <CategoryCard key={c.id} category={c} />
        ))}
      </div>
    </section>
  );

  const featuredSection = featuredStores.length > 0 ? (
    <section className="bg-gray-50 py-10 sm:py-12">
      <div className="container-app">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">متاجر مميزة</h2>
          <Link href="/stores" className="text-sm font-medium text-brand-700 hover:underline">
            عرض الكل
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {featuredStores.map((s) => (
            <StoreCard key={s.id} store={s as any} />
          ))}
        </div>
      </div>
    </section>
  ) : null;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-app py-10 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs text-brand-700 sm:text-sm">
              📍 الرمثا، الأردن
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {APP_NAME}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-xl">
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

      {/* Categories / Featured stores (order controlled by admin) */}
      {featuredFirst ? (
        <>
          {featuredSection}
          {categoriesSection}
        </>
      ) : (
        <>
          {categoriesSection}
          {featuredSection}
        </>
      )}

      {/* CTA */}
      <section className="container-app py-10 sm:py-12">
        <div className="overflow-hidden rounded-2xl bg-brand-700 px-5 py-10 text-center text-white sm:px-12 sm:py-12">
          <h2 className="text-xl font-bold sm:text-3xl">هل لديك متجر؟</h2>
          <p className="mt-2 text-brand-100">أضف متجرك مجانًا واصل لعملاء الرمثا.</p>
          <Link href="/add-store" className="btn-primary mt-6 inline-block bg-white text-brand-700 hover:bg-brand-50">
            أضف متجرك مجانًا
          </Link>
        </div>
      </section>
    </div>
  );
}
