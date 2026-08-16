import { prisma } from "@/lib/prisma";
import { AVAILABILITY_LABELS } from "@/config/constants";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { VerifiedBadge } from "@/components/verified-badge";
import { StoreMap } from "@/components/store-map";
import { ReviewsSection } from "@/components/reviews-section";
import { LocalBusinessSchema, BreadcrumbSchema } from "@/components/structured-data";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const store = await prisma.store.findUnique({
    where: { slug },
    include: { category: true, city: { select: { name: true } } },
  });
  if (!store) return { title: "المتجر غير موجود" };
  const title = `${store.name} — ${store.category?.name || "متجر"} في الرمثا`;
  const description =
    store.description || `تفاصيل متجر ${store.name}${store.category?.name ? ` (${store.category.name})` : ""} في الرمثا: المنتجات والأسعار والموقع ووسائل التواصل.`;
  const images = store.coverImage || store.logo ? [store.coverImage || store.logo!] : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/stores/${store.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl(`/stores/${store.slug}`),
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export default async function StorePage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  let store: any = null;
  try {
    store = await prisma.store.findUnique({
      where: { slug },
      include: {
        category: true,
        city: { select: { name: true } },
        owner: { select: { name: true } },
        products: { where: { active: true }, orderBy: { updatedAt: "desc" } },
      },
    });
  } catch {
    // DB not ready
  }
  if (!store || store.status !== "APPROVED") notFound();

  // increment views (fire and forget)
  await prisma.store.update({ where: { id: store.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const phoneHref = store.phone ? `tel:${store.phone.replace(/\s/g, "")}` : null;
  const waHref = store.whatsapp ? `https://wa.me/${store.whatsapp.replace(/[^\d]/g, "")}` : null;
  const directionsHref = store.latitude && store.longitude ? `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}` : null;

  return (
    <div>
      <LocalBusinessSchema
        store={{
          name: store.name,
          slug: store.slug,
          description: store.description,
          phone: store.phone,
          whatsapp: store.whatsapp,
          address: store.address,
          latitude: store.latitude,
          longitude: store.longitude,
          logo: store.logo,
          coverImage: store.coverImage,
          rating: store.rating,
          reviewCount: store.reviewCount,
          category: store.category ? { name: store.category.name } : null,
          city: store.city ? { name: store.city.name } : null,
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", path: "/" },
          { name: "المتاجر", path: "/stores" },
          ...(store.category
            ? [{ name: store.category.name, path: `/categories/${store.category.slug}` }]
            : []),
          { name: store.name, path: `/stores/${store.slug}` },
        ]}
      />
      {/* Cover + Header متداخل */}
      <div className="relative">
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-l from-brand-300 to-brand-100 sm:h-64">
          {store.coverImage
            ? <img src={store.coverImage} alt={store.name} className="h-full w-full object-cover" loading="lazy" />
            : <div className="h-full w-full bg-gradient-to-l from-brand-300 via-brand-200 to-brand-100" />}
          {store.isDemo && <span className="absolute right-3 top-3 badge-blue sm:right-4 sm:top-4">بيانات تجريبية</span>}
        </div>

        <div className="container-app mt-4 sm:mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-100 sm:h-24 sm:w-24">
              {store.logo ? <img src={store.logo} alt={store.name} className="h-full w-full object-cover" loading="lazy" /> : <span className="text-3xl sm:text-4xl">🏪</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-gray-900 sm:text-3xl">{store.name}</h1>
                {store.verified && <VerifiedBadge size={20} />}
              </div>
              {store.category && <Link href={`/categories/${store.category.slug}`} className="text-sm text-brand-600 hover:underline">{store.category.name}</Link>}
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
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
        </div>

        <div className="container-app">
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {store.description && (
              <div className="card p-4 sm:p-6">
                <h2 className="mb-2 text-lg font-bold">عن المتجر</h2>
                <p className="text-gray-600">{store.description}</p>
              </div>
            )}

            <div className="mt-6">
              <h2 className="mb-4 text-lg font-bold">المنتجات ({store.products.length})</h2>
              {store.products.length === 0 ? (
                <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">لا توجد منتجات بعد.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {store.products.map((p: any) => (
                    <div key={p.id} className="card overflow-hidden">
                      <div className="aspect-square bg-gray-50">
                        {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-3xl text-gray-300">📦</div>}
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
            <div className="card p-4 sm:p-6">
              <h2 className="mb-3 text-lg font-bold">معلومات التواصل</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-2"><dt className="shrink-0 text-gray-500">الهاتف</dt><dd className="text-left">{store.phone || "—"}</dd></div>
                <div className="flex justify-between gap-2"><dt className="shrink-0 text-gray-500">واتساب</dt><dd className="text-left">{store.whatsapp || "—"}</dd></div>
                <div className="flex justify-between gap-2"><dt className="shrink-0 text-gray-500">العنوان</dt><dd className="text-left">{store.address || "—"}</dd></div>
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
    </div>
  );
}
