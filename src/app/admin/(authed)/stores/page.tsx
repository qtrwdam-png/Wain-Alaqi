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

      <div className="mt-6 responsive-table">
        <table>
          <thead>
            <tr>
              <th>المتجر</th><th>القطاع</th><th>التاجر</th>
              <th>الحالة</th><th>تجريبي</th><th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id}>
                <td data-label="المتجر" className="font-medium text-gray-800">{s.name}</td>
                <td data-label="القطاع" className="text-gray-500">{s.category?.name}</td>
                <td data-label="التاجر" className="text-gray-500">{s.owner.name}</td>
                <td data-label="الحالة">
                  <span className={`badge ${s.status === "APPROVED" ? "badge-green" : s.status === "PENDING_REVIEW" ? "badge-yellow" : s.status === "REJECTED" ? "badge-red" : "badge-gray"}`}>
                    {STORE_STATUS_LABELS[s.status] || s.status}
                  </span>
                </td>
                <td data-label="تجريبي">{s.isDemo ? <span className="badge-blue">نعم</span> : "—"}</td>
                <td data-label=""><Link href={`/admin/stores/${s.id}`} className="text-brand-700 hover:underline">إدارة</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {stores.length === 0 && <p className="p-6 text-center text-gray-500">لا توجد متاجر مطابقة.</p>}
      </div>
    </div>
  );
}
