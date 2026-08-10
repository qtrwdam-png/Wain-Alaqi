import { prisma } from "@/lib/prisma";
import { getCurrentUser, getOwnedStore } from "@/lib/auth-guard";
import { AVAILABILITY_LABELS } from "@/config/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StoreDashboardHome() {
  const user = await getCurrentUser();
  const store = user ? await getOwnedStore(user.id) : null;

  if (!store) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-xl font-bold">ليس لديك متجر بعد</h1>
        <p className="mt-2 text-gray-500">أنشئ متجرك للبدء.</p>
        <Link href="/add-store" className="btn-primary mt-4 inline-block">أضف متجرك</Link>
      </div>
    );
  }

  const [products, searchAppearances] = await Promise.all([
    prisma.product.findMany({ where: { storeId: store.id }, orderBy: { updatedAt: "desc" } }),
    prisma.product.count({ where: { storeId: store.id, active: true } }),
  ]);

  const available = products.filter((p) => p.availability === "AVAILABLE").length;

  const stats = [
    { label: "مشاهدات المتجر", value: store.views },
    { label: "إجمالي المنتجات", value: products.length },
    { label: "المنتجات المتوفرة", value: available },
    { label: "المنتجات النشطة", value: searchAppearances },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">نظرة عامة</h1>
      {store.status !== "APPROVED" && (
        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
          متجرك حالياً {store.status === "PENDING_REVIEW" ? "بانتظار المراجعة من الإدارة" : "غير معتمد"}. لن يظهر للعامة حتى تتم الموافقة.
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-brand-700">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-bold">أحدث المنتجات</h2>
        <div className="space-y-2">
          {products.slice(0, 5).map((p) => (
            <div key={p.id} className="card flex items-center justify-between p-3">
              <div>
                <p className="font-medium text-gray-800">{p.name}</p>
                <span className="text-xs text-gray-400">{AVAILABILITY_LABELS[p.availability]} · {p.price ? `${p.price} د.أ` : "—"}</span>
              </div>
              <Link href={`/dashboard/store/products/${p.id}`} className="btn-ghost text-sm">تعديل</Link>
            </div>
          ))}
          {products.length === 0 && <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">لا توجد منتجات بعد.</p>}
        </div>
      </div>
    </div>
  );
}
