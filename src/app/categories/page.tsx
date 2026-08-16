import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { ItemListSchema } from "@/components/structured-data";
import { getCategoriesWithStoreCount } from "@/lib/cached-queries";

export const revalidate = 3600;

export const metadata = {
  title: "قطاعات الرمثا",
  description: "تصفح قطاعات المتاجر في الرمثا، الأردن — قطاع سيارات، إلكترونيات، مواد بناء، أغذية وغيرها.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  let categories: any[] = [];
  try {
    categories = await getCategoriesWithStoreCount();
  } catch {
    // DB not ready
  }

  return (
    <div className="container-app py-8 sm:py-10">
      {categories.length > 0 && (
        <ItemListSchema
          name="قطاعات المتاجر في الرمثا"
          items={categories.map((c) => ({ name: c.name, path: `/categories/${c.slug}` }))}
        />
      )}
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">القطاعات</h1>
      <p className="mt-2 text-gray-500">تصفح المتاجر حسب القطاع في الرمثا.</p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {categories.map((c) => (
          <Link key={c.id} href={`/categories/${c.slug}`} className="card group flex flex-col items-center justify-center p-4 text-center transition hover:shadow-card-hover sm:p-5">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-100 sm:h-14 sm:w-14"
              aria-label={c.name}
            >
              <CategoryIcon slug={c.slug} className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-gray-900">{c.name}</h3>
            <span className="mt-1 text-xs text-gray-400">{c._count.stores} متجر</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
