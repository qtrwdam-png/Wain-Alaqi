import { prisma } from "@/lib/prisma";
import { AVAILABILITY_LABELS } from "@/config/constants";
import { getCurrentUser, getOwnedStore } from "@/lib/auth-guard";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductsListPage() {
  const user = await getCurrentUser();
  const store = user ? await getOwnedStore(user.id) : null;
  if (!store) return <p className="card p-6">ليس لديك متجر.</p>;

  const products = await prisma.product.findMany({ where: { storeId: store.id }, orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">المنتجات</h1>
        <Link href="/dashboard/store/products/new" className="btn-primary">إضافة منتج</Link>
      </div>
      <div className="mt-6 space-y-2">
        {products.length === 0 ? (
          <p className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">لا توجد منتجات. اضغط «إضافة منتج» للبدء.</p>
        ) : (
          products.map((p) => (
            <div key={p.id} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-50">
                  {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-xl">📦</span>}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">{formatPrice(p.price)} · {AVAILABILITY_LABELS[p.availability]} {p.active ? "" : "· مخفي"}</p>
                </div>
              </div>
              <Link href={`/dashboard/store/products/${p.id}`} className="btn-secondary text-sm">تعديل</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
