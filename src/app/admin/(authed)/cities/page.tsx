import { prisma } from "@/lib/prisma";
import { CitiesAdminClient } from "@/components/admin-cities";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة المدن" };

export default async function AdminCitiesPage() {
  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { stores: true } } },
  });

  return (
    <div>
      <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">إدارة المدن</h1>
      <CitiesAdminClient
        cities={cities.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          country: c.country,
          latitude: c.latitude,
          longitude: c.longitude,
          active: c.active,
          _count: { stores: c._count.stores },
        }))}
      />
    </div>
  );
}
