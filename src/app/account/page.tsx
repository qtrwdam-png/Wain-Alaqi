import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getOwnedStore } from "@/lib/auth-guard";
import { ROLE_LABELS } from "@/config/constants";
import { STORE_STATUS_LABELS } from "@/config/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "حسابي" };

export default async function AccountHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/account");

  const role = (user as any).role as string;
  const store = await getOwnedStore(user.id);
  const [myReviews, mySearchRequests] = await Promise.all([
    prisma.review.findMany({
      where: { userId: user.id },
      include: { store: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.searchRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const isStaff = role === "ADMIN" || role === "CONTENT_MANAGER";
  const isStoreOwner = role === "STORE_OWNER";

  return (
    <div className="container-app py-8 sm:py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
            {user.name?.charAt(0) || "؟"}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-extrabold text-gray-900 sm:text-2xl">{user.name}</h1>
            <p className="truncate text-sm text-gray-500">
              {ROLE_LABELS[role] || role} · {user.email}
            </p>
          </div>
          <Link href="/account/settings" className="btn-secondary shrink-0">⚙️ إعدادات الحساب</Link>
        </div>

        {/* Role-based shortcuts */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isStaff && (
            <Link href="/admin" className="card flex items-center gap-3 p-5 transition hover:ring-2 hover:ring-brand-200">
              <span className="text-3xl">🛡️</span>
              <div>
                <p className="font-bold text-gray-800">لوحة الإدارة</p>
                <p className="text-sm text-gray-500">إدارة المتاجر، المستخدمين، المحتوى والإعدادات.</p>
              </div>
            </Link>
          )}

          {(isStoreOwner || role === "ADMIN") && (
            <Link href="/dashboard/store" className="card flex items-center gap-3 p-5 transition hover:ring-2 hover:ring-brand-200">
              <span className="text-3xl">🏪</span>
              <div>
                <p className="font-bold text-gray-800">لوحة المتجر</p>
                <p className="text-sm text-gray-500">
                  {store ? `${store.name} · ${STORE_STATUS_LABELS[store.status] || store.status}` : "أنشئ متجرك وابدأ البيع."}
                </p>
              </div>
            </Link>
          )}

          {role === "USER" && !store && (
            <Link href="/add-store" className="card flex items-center gap-3 p-5 transition hover:ring-2 hover:ring-brand-200">
              <span className="text-3xl">🏪</span>
              <div>
                <p className="font-bold text-gray-800">أضف متجرك</p>
                <p className="text-sm text-gray-500">هل لديك متجر؟ أضفه مجاناً واصل لعملاء الرمثا.</p>
              </div>
            </Link>
          )}

          <Link href="/search" className="card flex items-center gap-3 p-5 transition hover:ring-2 hover:ring-brand-200">
            <span className="text-3xl">🔎</span>
            <div>
              <p className="font-bold text-gray-800">ابحث عن منتج</p>
              <p className="text-sm text-gray-500">ابحث عن المنتجات والخدمات في الرمثا.</p>
            </div>
          </Link>

          <Link href="/search-request" className="card flex items-center gap-3 p-5 transition hover:ring-2 hover:ring-brand-200">
            <span className="text-3xl">📩</span>
            <div>
              <p className="font-bold text-gray-800">لم تجد ما تبحث عنه؟</p>
              <p className="text-sm text-gray-500">أرسل طلب بحث وسنساعدك في إيجاده.</p>
            </div>
          </Link>
        </div>

        {/* My activity */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-bold">آخر تقييماتي</h2>
            {myReviews.length === 0 ? (
              <p className="card p-6 text-center text-sm text-gray-500">لم تقم بتقييم أي متجر بعد.</p>
            ) : (
              <div className="space-y-2">
                {myReviews.map((r) => (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-center justify-between">
                      <Link href={`/stores/${r.store.slug}`} className="font-medium text-brand-700 hover:underline">
                        {r.store.name}
                      </Link>
                      <span className="text-sm text-amber-600">{"★".repeat(r.rating)}</span>
                    </div>
                    {r.comment && <p className="mt-1 text-sm text-gray-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-lg font-bold">طلبات بحثي</h2>
            {mySearchRequests.length === 0 ? (
              <p className="card p-6 text-center text-sm text-gray-500">لا توجد طلبات بحث بعد.</p>
            ) : (
              <div className="space-y-2">
                {mySearchRequests.map((s) => (
                  <div key={s.id} className="card p-4">
                    <p className="font-medium text-gray-800">{s.query}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(s.createdAt).toLocaleDateString("ar")} · عدد الطلبات: {s.count}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
