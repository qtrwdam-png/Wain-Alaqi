"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "الرئيسية", icon: "📊" },
  { href: "/admin/content", label: "المحتوى", icon: "📝" },
  { href: "/admin/categories", label: "القطاعات", icon: "🏷️" },
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
    <aside className="card h-fit p-4 lg:sticky lg:top-6">
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
  );
}
