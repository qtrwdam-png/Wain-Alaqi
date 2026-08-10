import { prisma } from "@/lib/prisma";
import { CategoriesAdminClient } from "@/components/admin-categories";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة القطاعات" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { stores: true, products: true } } },
  });
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">إدارة القطاعات</h1>
      <CategoriesAdminClient categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon, sortOrder: c.sortOrder, active: c.active, _count: { stores: c._count.stores, products: c._count.products } }))} />
    </div>
  );
}
