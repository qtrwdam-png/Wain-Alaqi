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
      {store.status === "PENDING_REVIEW" && (
        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
          <p className="font-bold">⏳ متجرك بانتظار المراجعة</p>
          <p className="mt-1">تم إرسال طلبك وسيقوم فريق الإدارة بمراجعته. سيظهر المتجر للعامة بعد الموافقة، وستصلك إشعاراً عند تغيير الحالة.</p>
        </div>
      )}
      {store.status === "REJECTED" && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">
          <p className="font-bold">❌ تم رفض متجرك</p>
          <p className="mt-1">{store.rejectionReason || "يرجى مراجعة بيانات المتجر وتعديلها ثم إعادة الإرسال."}</p>
          <Link href="/dashboard/store/settings" className="btn-secondary mt-3 inline-block">تعديل بيانات المتجر</Link>
        </div>
      )}
      {store.status === "SUSPENDED" && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">
          <p className="font-bold">⛔ تم إيقاف متجرك</p>
          <p className="mt-1">تم إيقاف متجرك مؤقتاً من قبل الإدارة. يرجى التواصل مع الدعم.</p>
        </div>
      )}
      {store.status === "APPROVED" && (
        <div className="mt-4 rounded-lg bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-brand-200">
          <p className="font-bold">✅ متجرك معتمد ومباشر</p>
          <p className="mt-1">متجرك متاح للعامة. شاركه مع عملائك!</p>
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
            <div key={p.id} className="card flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-gray-800">{p.name}</p>
                <span className="text-xs text-gray-400">{AVAILABILITY_LABELS[p.availability]} · {p.price ? `${p.price} د.أ` : "—"}</span>
              </div>
              <Link href={`/dashboard/store/products/${p.id}`} className="btn-ghost shrink-0 text-sm">تعديل</Link>
            </div>
          ))}
          {products.length === 0 && <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">لا توجد منتجات بعد.</p>}
        </div>
      </div>
    </div>
  );
}
