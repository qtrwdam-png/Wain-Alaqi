import { prisma } from "@/lib/prisma";
import { AVAILABILITY_LABELS } from "@/config/constants";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StoreReviewActions } from "@/components/store-review-actions";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminStoreDetailPage({ params }: { params: { id: string } }) {
  const store = await prisma.store.findUnique({
    where: { id: params.id },
    include: { category: true, owner: true, city: true, products: true, reviews: { include: { user: true } } },
  });
  if (!store) notFound();

  return (
    <div>
      <nav className="text-sm text-gray-500">
        <Link href="/admin/stores" className="hover:text-brand-700">المتاجر</Link> <span>/</span> <span className="text-gray-700">{store.name}</span>
      </nav>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{store.name}</h1>
          <p className="text-gray-500">{store.category?.name} · {store.city?.name}</p>
          <p className="mt-1 text-sm text-gray-400">التاجر: {store.owner.name} ({store.owner.email})</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`badge ${store.status === "APPROVED" ? "badge-green" : store.status === "PENDING_REVIEW" ? "badge-yellow" : "badge-gray"}`}>
            {store.status}
          </span>
          {store.verified && <span className="badge-blue">موثق</span>}
          {store.isDemo && <span className="badge-gray">تجريبي</span>}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="mb-3 font-bold">تفاصيل المتجر</h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-gray-400">الوصف</dt><dd>{store.description || "—"}</dd>
              <dt className="text-gray-400">الهاتف</dt><dd>{store.phone || "—"}</dd>
              <dt className="text-gray-400">واتساب</dt><dd>{store.whatsapp || "—"}</dd>
              <dt className="text-gray-400">العنوان</dt><dd>{store.address || "—"}</dd>
              <dt className="text-gray-400">الإحداثيات</dt><dd>{store.latitude && store.longitude ? `${store.latitude}, ${store.longitude}` : "—"}</dd>
              <dt className="text-gray-400">سبب الرفض</dt><dd>{store.rejectionReason || "—"}</dd>
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="mb-3 font-bold">المنتجات ({store.products.length})</h2>
            <div className="space-y-2">
              {store.products.map((p) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 text-sm">
                  <span>{p.name}</span>
                  <span className="text-gray-500">{formatPrice(p.price)} · {AVAILABILITY_LABELS[p.availability]}</span>
                </div>
              ))}
              {store.products.length === 0 && <p className="text-gray-400">لا توجد منتجات.</p>}
            </div>
          </div>
        </div>

        <div>
          <StoreReviewActions storeId={store.id} currentStatus={store.status} rejectionReason={store.rejectionReason} />
          <div className="card mt-4 p-4">
            <h2 className="mb-2 font-bold">إجراءات إضافية</h2>
            <div className="space-y-2 text-sm">
              <Link href={`/stores/${store.slug}`} className="btn-secondary w-full">عرض المتجر</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
