"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Store } from "@prisma/client";

export function StoreSidebar({ store }: { store: Store | null }) {
  const pathname = usePathname();
  const links = [
    { href: "/dashboard/store", label: "الرئيسية", icon: "📊" },
    { href: "/dashboard/store/products", label: "المنتجات", icon: "📦" },
    { href: "/dashboard/store/products/new", label: "إضافة منتج", icon: "➕" },
    { href: "/dashboard/store/settings", label: "إعدادات المتجر", icon: "⚙️" },
  ];

  const linkList = [
    ...links,
    { href: "/account/settings", label: "إعدادات الحساب", icon: "👤" },
  ];

  return (
    <>
      {/* Mobile: icon grid (app-style) */}
      <aside className="card h-fit p-3 lg:hidden">
        <div className="mb-3 flex items-center justify-between gap-2 border-b pb-2">
          <p className="text-xs text-gray-400">لوحة التاجر</p>
          <p className="truncate font-bold text-gray-800">{store?.name || "لا يوجد متجر"}</p>
        </div>
        {store && (
          <span className={`mb-2 inline-flex w-fit badge ${store.status === "APPROVED" ? "badge-green" : store.status === "PENDING_REVIEW" ? "badge-yellow" : store.status === "REJECTED" ? "badge-red" : "badge-gray"}`}>
            {store.status === "APPROVED" ? "معتمد" : store.status === "PENDING_REVIEW" ? "بانتظار المراجعة" : store.status === "REJECTED" ? "مرفوض" : store.status === "SUSPENDED" ? "موقوف" : store.status}
          </span>
        )}
        <nav className="grid grid-cols-3 gap-2">
          {linkList.map((l) => {
            const active = l.href === "/dashboard/store" ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex flex-col items-center gap-1 rounded-lg p-2.5 text-center text-xs font-medium transition ${active ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <span className="text-xl leading-none">{l.icon}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Desktop: sticky sidebar */}
      <aside className="card hidden h-fit p-4 lg:sticky lg:top-20 lg:block">
        <div className="mb-4 border-b pb-3">
          <p className="text-sm text-gray-400">لوحة التاجر</p>
          <p className="font-bold text-gray-800">{store?.name || "لا يوجد متجر"}</p>
          {store && (
            <span className={`badge mt-1 ${store.status === "APPROVED" ? "badge-green" : store.status === "PENDING_REVIEW" ? "badge-yellow" : store.status === "REJECTED" ? "badge-red" : "badge-gray"}`}>
              {store.status === "APPROVED" ? "معتمد" : store.status === "PENDING_REVIEW" ? "بانتظار المراجعة" : store.status === "REJECTED" ? "مرفوض" : store.status === "SUSPENDED" ? "موقوف" : store.status}
            </span>
          )}
        </div>
        <nav className="space-y-1">
          {links.map((l) => {
            const active = l.href === "/dashboard/store" ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`nav-link flex items-center gap-2 ${active ? "nav-link-active" : ""}`}>
                <span>{l.icon}</span> {l.label}
              </Link>
            );
          })}
          <Link href="/account/settings" className="nav-link flex items-center gap-2">
            <span>👤</span> إعدادات الحساب
          </Link>
        </nav>
      </aside>
    </>
  );
}
