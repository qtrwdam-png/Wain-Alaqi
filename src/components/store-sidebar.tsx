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
  return (
    <aside className="card h-fit p-4 lg:sticky lg:top-20">
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
  );
}
