"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "الرئيسية", icon: "📊" },
  { href: "/admin/content", label: "المحتوى", icon: "📝" },
  { href: "/admin/categories", label: "القطاعات", icon: "🏷️" },
  { href: "/admin/cities", label: "المدن", icon: "📍" },
  { href: "/admin/stores", label: "المتاجر", icon: "🏪" },
  { href: "/admin/products", label: "المنتجات", icon: "📦" },
  { href: "/admin/reviews", label: "التقييمات", icon: "⭐" },
  { href: "/admin/users", label: "المستخدمون", icon: "👥" },
  { href: "/admin/store-owners", label: "التجار", icon: "🧑‍💼" },
  { href: "/admin/search-requests", label: "طلبات البحث", icon: "🔍" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <>
      {/* Mobile: icon grid (app-style) */}
      <aside className="card h-fit p-3 lg:hidden">
        <div className="mb-3 flex items-center justify-between gap-2 border-b pb-2">
          <p className="text-xs text-gray-400">لوحة الإدارة</p>
          <p className="font-bold text-brand-700">CMS</p>
        </div>
        <nav className="grid grid-cols-3 gap-2">
          {NAV.map((l) => {
            const active = l.href === "/admin" ? pathname === l.href : pathname.startsWith(l.href);
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
        <Link href="/" className="mt-2 flex items-center justify-center gap-1 border-t pt-2.5 text-xs text-gray-500 hover:text-brand-700">← العودة للموقع</Link>
      </aside>

      {/* Desktop: sticky sidebar */}
      <aside className="card hidden h-fit p-4 lg:sticky lg:top-6 lg:block">
        <div className="mb-4 border-b pb-3">
          <p className="text-xs text-gray-400">لوحة الإدارة</p>
          <p className="font-bold text-brand-700">CMS</p>
        </div>
        <nav className="space-y-1">
          {NAV.map((l) => {
            const active = l.href === "/admin" ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`nav-link flex items-center gap-2 ${active ? "nav-link-active" : ""}`}>
                <span>{l.icon}</span> {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 border-t pt-3">
          <Link href="/" className="nav-link flex items-center gap-2">← العودة للموقع</Link>
        </div>
      </aside>
    </>
  );
}
