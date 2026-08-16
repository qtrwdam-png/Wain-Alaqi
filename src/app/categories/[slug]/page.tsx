import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StoreCard } from "@/components/store-card";
import { CategoryIcon } from "@/components/category-icon";
import { BreadcrumbSchema, ItemListSchema } from "@/components/structured-data";
import { getCategoryWithStores } from "@/lib/cached-queries";

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  let cat: any = null;
  try {
    cat = await prisma.category.findUnique({ where: { slug: params.slug } });
  } catch {
    return { title: "القطاع غير موجود" };
  }
  if (!cat) return { title: "القطاع غير موجود" };
  const title = `${cat.name} في الرمثا`;
  const description = cat.description || `متاجر ومنتجات ${cat.name} في الرمثا، الأردن — تصفح المتاجر والأسعار وأماكن البيع.`;
  return {
    title,
    description,
    alternates: { canonical: `/categories/${cat.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  let category: any = null;
  try {
    category = await getCategoryWithStores(params.slug);
  } catch {
    // DB not ready
  }
  if (!category) notFound();

  return (
    <div className="container-app py-8 sm:py-10">
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", path: "/" },
          { name: "القطاعات", path: "/categories" },
          { name: category.name, path: `/categories/${category.slug}` },
        ]}
      />
      {category.stores.length > 0 && (
        <ItemListSchema
          name={`متاجر ${category.name} في الرمثا`}
          items={category.stores.map((s: any) => ({
            name: s.name,
            path: `/stores/${s.slug}`,
          }))}
        />
      )}
      <nav className="text-sm text-gray-500">
        <Link href="/categories" className="hover:text-brand-700">القطاعات</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700">{category.name}</span>
      </nav>

      <div className="mt-4 flex items-start gap-3 sm:gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 sm:h-16 sm:w-16"
          aria-label={category.name}
        >
          <CategoryIcon slug={category.slug} className="h-8 w-8 sm:h-9 sm:w-9" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{category.name}</h1>
          {category.description && <p className="mt-1 text-gray-500">{category.description}</p>}
          <p className="mt-2 text-sm text-gray-400">
            {category.stores.length} متجر · {category._count.products} منتج
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <form action={`/search`} className="flex flex-1 gap-2">
            <input type="hidden" name="cat" value={category.id} />
            <input type="text" name="q" placeholder={`ابحث داخل ${category.name}…`} className="input flex-1" />
            <button type="submit" className="btn-primary shrink-0">بحث</button>
          </form>
        </div>

        {category.stores.length === 0 ? (
          <p className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">لا توجد متاجر في هذا القطاع بعد.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {category.stores.map((s: any) => (
              <StoreCard key={s.id} store={s as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
