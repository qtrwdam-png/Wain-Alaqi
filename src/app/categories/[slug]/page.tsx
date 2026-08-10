import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StoreCard } from "@/components/store-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const cat = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!cat) return { title: "القطاع غير موجود" };
  return {
    title: `${cat.name} في الرمثا`,
    description: cat.description || `متاجر ${cat.name} في الرمثا`,
    alternates: { canonical: `/categories/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      stores: {
        where: { status: "APPROVED" },
        orderBy: { rating: "desc" },
        include: { category: true },
      },
      _count: { select: { products: { where: { active: true } } } },
    },
  });
  if (!category) notFound();

  return (
    <div className="container-app py-10">
      <nav className="text-sm text-gray-500">
        <Link href="/categories" className="hover:text-brand-700">القطاعات</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700">{category.name}</span>
      </nav>

      <div className="mt-4 flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-3xl text-brand-600">
          {category.icon || "🏷️"}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{category.name}</h1>
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
            <button type="submit" className="btn-primary">بحث</button>
          </form>
        </div>

        {category.stores.length === 0 ? (
          <p className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">لا توجد متاجر في هذا القطاع بعد.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {category.stores.map((s) => (
              <StoreCard key={s.id} store={s as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
