import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { STORE_STATUS_LABELS } from "@/config/constants";
import { StoresListClient } from "@/components/admin-stores-list";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة المتاجر" };

export default async function AdminStoresPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const where: any = {};
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.q) where.name = { contains: searchParams.q, mode: "insensitive" };
  const stores = await prisma.store.findMany({
    where,
    include: { category: true, owner: true },
    orderBy: { createdAt: "desc" },
  });

  const statuses = ["PENDING_REVIEW", "APPROVED", "REJECTED", "SUSPENDED", "ARCHIVED", "DRAFT"];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">إدارة المتاجر</h1>
      <Suspense fallback={<div className="mt-4 text-sm text-gray-400">جارٍ التحميل…</div>}>
        <StoresListClient currentStatus={searchParams.status || ""} q={searchParams.q || ""} statuses={statuses} labels={STORE_STATUS_LABELS} />
      </Suspense>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="border-b text-gray-400">
            <tr>
              <th className="p-2">المتجر</th><th className="p-2">القطاع</th><th className="p-2">التاجر</th>
              <th className="p-2">الحالة</th><th className="p-2">تجريبي</th><th className="p-2">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id} className="border-b border-gray-100">
                <td className="p-2 font-medium text-gray-800">{s.name}</td>
                <td className="p-2 text-gray-500">{s.category?.name}</td>
                <td className="p-2 text-gray-500">{s.owner.name}</td>
                <td className="p-2">
                  <span className={`badge ${s.status === "APPROVED" ? "badge-green" : s.status === "PENDING_REVIEW" ? "badge-yellow" : s.status === "REJECTED" ? "badge-red" : "badge-gray"}`}>
                    {STORE_STATUS_LABELS[s.status] || s.status}
                  </span>
                </td>
                <td className="p-2">{s.isDemo ? <span className="badge-blue">نعم</span> : "—"}</td>
                <td className="p-2"><Link href={`/admin/stores/${s.id}`} className="text-brand-700 hover:underline">إدارة</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {stores.length === 0 && <p className="mt-4 rounded-lg bg-white p-6 text-center text-gray-500 ring-1 ring-gray-100">لا توجد متاجر مطابقة.</p>}
      </div>
    </div>
  );
}
