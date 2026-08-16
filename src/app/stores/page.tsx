import { prisma } from "@/lib/prisma";
import { StoreCard } from "@/components/store-card";
import Link from "next/link";
import { ItemListSchema } from "@/components/structured-data";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "المتاجر في الرمثا",
  description: "تصفح جميع المتاجر المعتمدة في الرمثا، الأردن — متاجر وقطاعات وأماكن البيع والأسعار.",
  alternates: { canonical: "/stores" },
};

export default async function StoresPage({ searchParams }: { searchParams: { cat?: string; q?: string } }) {
  const where = {
    status: "APPROVED" as const,
    ...(searchParams.cat ? { categoryId: searchParams.cat } : {}),
    ...(searchParams.q ? { name: { contains: searchParams.q, mode: "insensitive" as const } } : {}),
  };
  let stores: any[] = [];
  let categories: any[] = [];
  try {
    [stores, categories] = await Promise.all([
      prisma.store.findMany({ where, include: { category: true }, orderBy: { rating: "desc" } }),
      prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    ]);
  } catch {
    // DB not ready
  }

  return (
    <div className="container-app py-8 sm:py-10">
      {stores.length > 0 && (
        <ItemListSchema
          name="متاجر الرمثا"
          items={stores.map((s: any) => ({ name: s.name, path: `/stores/${s.slug}` }))}
        />
      )}
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">المتاجر</h1>
      <p className="mt-2 text-gray-500">تصفح جميع المتاجر في الرمثا.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/stores" className={`rounded-full px-3 py-1.5 text-sm ${!searchParams.cat ? "bg-brand-600 text-white" : "bg-white ring-1 ring-gray-200"}`}>الكل</Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/stores?cat=${c.id}`} className={`rounded-full px-3 py-1.5 text-sm ${searchParams.cat === c.id ? "bg-brand-600 text-white" : "bg-white ring-1 ring-gray-200"}`}>
            {c.name}
          </Link>
        ))}
      </div>

      {stores.length === 0 ? (
        <p className="mt-8 rounded-lg bg-gray-50 p-8 text-center text-gray-500">لا توجد متاجر مطابقة.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stores.map((s) => <StoreCard key={s.id} store={s as any} />)}
        </div>
      )}
    </div>
  );
}
