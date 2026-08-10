import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة التجار" };

export default async function AdminStoreOwnersPage() {
  const owners = await prisma.user.findMany({
    where: { role: "STORE_OWNER" },
    include: { stores: { select: { name: true, slug: true, status: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">التجار ({owners.length})</h1>
      <div className="mt-6 space-y-2">
        {owners.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-gray-800">{o.name}</p>
                <p className="text-sm text-gray-500">{o.email} · {o.phone || "—"}</p>
                <p className="text-xs text-gray-400">تاريخ التسجيل: {new Date(o.createdAt).toLocaleDateString("ar")}</p>
              </div>
              <div className="text-sm">
                {o.stores.map((s) => (
                  <div key={s.slug} className="flex items-center gap-2">
                    <Link href={`/admin/stores?status=${s.status}`} className="text-brand-700 hover:underline">{s.name}</Link>
                    <span className="badge-gray">{s.status}</span>
                  </div>
                ))}
                {o.stores.length === 0 && <span className="text-gray-400">لا يملك متجراً بعد</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
