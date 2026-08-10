import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = { title: "القطاعات", description: "تصفح القطاعات في الرمثا" };

export default async function CategoriesPage() {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { stores: { where: { status: "APPROVED" } } } } },
    });
  } catch {
    // DB not ready
  }

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-extrabold text-gray-900">القطاعات</h1>
      <p className="mt-2 text-gray-500">تصفح المتاجر حسب القطاع في الرمثا.</p>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => (
          <Link key={c.id} href={`/categories/${c.slug}`} className="card group flex flex-col items-center justify-center p-5 text-center transition hover:shadow-card-hover">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600 transition group-hover:bg-brand-100">
              {c.icon || "🏷️"}
            </div>
            <h3 className="mt-3 text-sm font-bold text-gray-900">{c.name}</h3>
            <span className="mt-1 text-xs text-gray-400">{c._count.stores} متجر</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
