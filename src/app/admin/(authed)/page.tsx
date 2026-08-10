import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { STORE_STATUS_LABELS } from "@/config/constants";

export const dynamic = "force-dynamic";

export const metadata = { title: "لوحة الإدارة" };

export default async function AdminDashboard() {
  const [stores, products, users, searchRequests, categories, pendingStores] = await Promise.all([
    prisma.store.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.searchRequest.count(),
    prisma.category.count(),
    prisma.store.findMany({ where: { status: "PENDING_REVIEW" }, include: { owner: true, category: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const approved = await prisma.store.count({ where: { status: "APPROVED" } });
  const pending = await prisma.store.count({ where: { status: "PENDING_REVIEW" } });
  const rejected = await prisma.store.count({ where: { status: "REJECTED" } });

  const stats = [
    { label: "إجمالي المتاجر", value: stores, color: "text-brand-700" },
    { label: "المتاجر المعتمدة", value: approved, color: "text-brand-600" },
    { label: "بانتظار الموافقة", value: pending, color: "text-amber-600" },
    { label: "المتاجر المرفوضة", value: rejected, color: "text-red-600" },
    { label: "إجمالي المنتجات", value: products, color: "text-blue-600" },
    { label: "المستخدمون", value: users, color: "text-gray-800" },
    { label: "طلبات البحث", value: searchRequests, color: "text-purple-600" },
    { label: "القطاعات", value: categories, color: "text-brand-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">لوحة الإدارة</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className={`mt-1 text-2xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">متاجر بانتظار المراجعة</h2>
          <Link href="/admin/stores?status=PENDING_REVIEW" className="text-sm text-brand-700 hover:underline">عرض الكل</Link>
        </div>
        {pendingStores.length === 0 ? (
          <p className="rounded-lg bg-white p-6 text-center text-gray-500 ring-1 ring-gray-100">لا توجد متاجر بانتظار المراجعة.</p>
        ) : (
          <div className="space-y-2">
            {pendingStores.slice(0, 5).map((s) => (
              <div key={s.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-bold text-gray-800">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.category?.name} · {s.owner.name} · {s.owner.email}</p>
                </div>
                <Link href={`/admin/stores/${s.id}`} className="btn-secondary shrink-0 text-sm">مراجعة</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
