import { prisma } from "@/lib/prisma";
import { AVAILABILITY_LABELS } from "@/config/constants";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { VerifiedBadge } from "@/components/verified-badge";
import { StoreMap } from "@/components/store-map";
import { ReviewsSection } from "@/components/reviews-section";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const store = await prisma.store.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!store) return { title: "المتجر غير موجود" };
  return {
    title: `${store.name} — ${store.category?.name || ""} في الرمثا`,
    description: store.description || `تفاصيل متجر ${store.name} في الرمثا`,
    alternates: { canonical: `/stores/${store.slug}` },
    openGraph: { title: store.name, description: store.description || "" },
  };
}

export default async function StorePage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      category: true,
      owner: { select: { name: true } },
      products: { where: { active: true }, orderBy: { updatedAt: "desc" } },
    },
  });
  if (!store || store.status !== "APPROVED") notFound();

  // increment views (fire and forget)
  await prisma.store.update({ where: { id: store.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const phoneHref = store.phone ? `tel:${store.phone.replace(/\s/g, "")}` : null;
  const waHref = store.whatsapp ? `https://wa.me/${store.whatsapp.replace(/[^\d]/g, "")}` : null;
  const directionsHref = store.latitude && store.longitude ? `https://www.openstreetmap.org/?mlat=${store.latitude}&mlon=${store.longitude}#map=17/${store.latitude}/${store.longitude}` : null;

  return (
    <div>
      {/* Cover */}
      <div className="relative h-48 w-full bg-gradient-to-l from-brand-200 to-brand-100 sm:h-64">
        {store.coverImage && <img src={store.coverImage} alt={store.name} className="h-full w-full object-cover" />}
        {store.isDemo && <span className="absolute right-4 top-4 badge-blue">بيانات تجريبية</span>}
      </div>

      <div className="container-app">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-100">
            {store.logo ? <img src={store.logo} alt={store.name} className="h-full w-full object-cover" /> : <span className="text-4xl">🏪</span>}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{store.name}</h1>
              {store.verified && <VerifiedBadge size={20} />}
            </div>
            {store.category && <Link href={`/categories/${store.category.slug}`} className="text-sm text-brand-600 hover:underline">{store.category.name}</Link>}
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              <span>⭐ {store.rating > 0 ? store.rating.toFixed(1) : "—"} ({store.reviewCount} تقييم)</span>
              <span>👁️ {store.views} مشاهدة</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {phoneHref && <a href={phoneHref} className="btn-primary">اتصل</a>}
            {waHref && <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-accent">واتساب</a>}
            {directionsHref && <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="btn-secondary">الاتجاهات</a>}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {store.description && (
              <div className="card p-6">
                <h2 className="mb-2 text-lg font-bold">عن المتجر</h2>
                <p className="text-gray-600">{store.description}</p>
              </div>
            )}

            <div className="mt-6">
              <h2 className="mb-4 text-lg font-bold">المنتجات ({store.products.length})</h2>
              {store.products.length === 0 ? (
                <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">لا توجد منتجات بعد.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {store.products.map((p) => (
                    <div key={p.id} className="card overflow-hidden">
                      <div className="aspect-square bg-gray-50">
                        {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl text-gray-300">📦</div>}
                      </div>
                      <div className="p-3">
                        <h3 className="line-clamp-2 text-sm font-bold">{p.name}</h3>
                        <p className="mt-1 font-bold text-brand-700">{formatPrice(p.price)}</p>
                        <span className={`mt-1 inline-block text-xs ${p.availability === "AVAILABLE" ? "text-brand-600" : p.availability === "OUT_OF_STOCK" ? "text-red-600" : "text-gray-500"}`}>
                          {AVAILABILITY_LABELS[p.availability] || p.availability}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8">
              <ReviewsSection storeId={store.id} storeSlug={store.slug} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="mb-3 text-lg font-bold">معلومات التواصل</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">الهاتف</dt><dd>{store.phone || "—"}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">واتساب</dt><dd>{store.whatsapp || "—"}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">العنوان</dt><dd className="text-left">{store.address || "—"}</dd></div>
              </dl>
            </div>

            {store.latitude && store.longitude && (
              <div className="card overflow-hidden">
                <div className="p-4 pb-2"><h2 className="text-lg font-bold">الموقع</h2></div>
                <StoreMap lat={store.latitude} lng={store.longitude} name={store.name} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
