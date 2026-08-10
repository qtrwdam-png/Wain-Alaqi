import { prisma } from "@/lib/prisma";
import { StoreMap } from "@/components/store-map";

export const dynamic = "force-dynamic";
export const metadata = { title: "خريطة المتاجر", description: "تصفح المتاجر على الخريطة" };

export default async function MapPage() {
  let city: any = null;
  let stores: any[] = [];
  try {
    city = await prisma.city.findFirst({ where: { slug: "al-ramtha" } }) ||
      await prisma.city.findFirst();
    stores = await prisma.store.findMany({
      where: { status: "APPROVED", latitude: { not: null }, longitude: { not: null } },
      select: { slug: true, name: true, latitude: true, longitude: true, address: true, phone: true },
    });
  } catch {
    // DB not ready
  }

  const centerLat = city?.latitude || stores[0]?.latitude || 32.5567;
  const centerLng = city?.longitude || stores[0]?.longitude || 36.0;

  return (
    <div className="container-app py-6 sm:py-8">
      <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">خريطة المتاجر في الرمثا</h1>
      <p className="mt-1 text-sm text-gray-500 sm:text-base">{stores.length} متجر على الخريطة. اضغط على أي علامة لعرض المتجر.</p>
      <div className="mt-6 overflow-hidden rounded-xl ring-1 ring-gray-200">
        <StoreMap
          lat={centerLat}
          lng={centerLng}
          markers={stores.map((s) => ({ lat: s.latitude!, lng: s.longitude!, name: s.name, slug: s.slug }))}
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stores.slice(0, 30).map((s) => (
          <a key={s.slug} href={`/stores/${s.slug}`} className="card flex items-center gap-3 p-3 hover:shadow-card-hover">
            <span className="text-xl">📍</span>
            <div className="min-w-0">
              <p className="truncate font-bold text-gray-800">{s.name}</p>
              <p className="truncate text-xs text-gray-500">{s.address || "—"}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
