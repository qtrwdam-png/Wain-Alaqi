import { prisma } from "@/lib/prisma";
import { AVAILABILITY_LABELS } from "@/config/constants";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { AdminProductsFilters } from "@/components/admin-products-filters";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة المنتجات" };

export default async function AdminProductsPage({ searchParams }: { searchParams: { categoryId?: string; storeId?: string; q?: string } }) {
  const where: any = {};
  if (searchParams.categoryId) where.categoryId = searchParams.categoryId;
  if (searchParams.storeId) where.storeId = searchParams.storeId;
  if (searchParams.q) where.name = { contains: searchParams.q, mode: "insensitive" };
  const [products, categories, stores] = await Promise.all([
    prisma.product.findMany({ where, include: { store: { select: { name: true } }, category: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: 200 }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.store.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">إدارة المنتجات ({products.length})</h1>
      <Suspense fallback={<div className="mt-4 text-sm text-gray-400">جارٍ التحميل…</div>}>
        <AdminProductsFilters categories={categories} stores={stores} current={searchParams} />
      </Suspense>
      <div className="mt-4 responsive-table">
        <table>
          <thead>
            <tr><th>المنتج</th><th>المتجر</th><th>القطاع</th><th>السعر</th><th>التوفر</th><th>الحالة</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td data-label="المنتج" className="font-medium text-gray-800">{p.name}</td>
                <td data-label="المتجر" className="text-gray-500">{p.store.name}</td>
                <td data-label="القطاع" className="text-gray-500">{p.category?.name || "—"}</td>
                <td data-label="السعر">{formatPrice(p.price)}</td>
                <td data-label="التوفر">{AVAILABILITY_LABELS[p.availability]}</td>
                <td data-label="الحالة">{p.active ? <span className="badge-green">نشط</span> : <span className="badge-gray">مخفي</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-center text-gray-500">لا توجد منتجات مطابقة.</p>}
      </div>
    </div>
  );
}
