"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/config/constants";
import { SearchBox } from "@/components/search-box";
import { NotificationBell } from "@/components/notification-bell";

const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/categories", label: "القطاعات" },
  { href: "/stores", label: "المتاجر" },
  { href: "/map", label: "الخريطة" },
  { href: "/add-store", label: "أضف متجرك" },
  { href: "/contact", label: "تواصل" },
  { href: "/about", label: "عن المنصة" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isAuthed = status === "authenticated" && !!session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-app">
        <div className="flex h-16 items-center gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
              و
            </span>
            <span className="text-xl font-extrabold text-brand-700">{APP_NAME}</span>
          </Link>

          <Suspense fallback={null}>
            <SearchBox compact />
          </Suspense>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
            ))}
          </nav>

          <div className="mr-auto flex items-center gap-2">
            {isAuthed ? (
              <>
                <NotificationBell />
                <div className="hidden items-center gap-1 sm:flex">
                  {session.user.role === "ADMIN" && (
                    <Link href="/admin" className="btn-secondary">لوحة الإدارة</Link>
                  )}
                  {(session.user.role === "STORE_OWNER" || session.user.role === "ADMIN") && (
                    <Link href="/dashboard/store" className="btn-secondary">لوحة التاجر</Link>
                  )}
                  <Link href="/account/settings" className="btn-ghost">حسابي</Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-ghost text-red-600">خروج</button>
                </div>
              </>
            ) : (
              <Link href="/login" className="btn-primary hidden sm:inline-flex">تسجيل الدخول</Link>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden"
              aria-label="القائمة"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <nav className="container-app flex flex-col py-3">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
            ))}
            <div className="my-2 border-t border-gray-100" />
            {isAuthed ? (
              <>
                <Link href="/account/settings" className="nav-link">⚙️ إعدادات الحساب</Link>
                {(session.user.role === "STORE_OWNER" || session.user.role === "ADMIN") && (
                  <Link href="/dashboard/store" className="nav-link">📊 لوحة التاجر</Link>
                )}
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="nav-link">🛡️ لوحة الإدارة</Link>
                )}
                <button onClick={() => signOut({ callbackUrl: "/" })} className="nav-link text-right text-red-600">🚪 تسجيل الخروج</button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-primary mt-2">تسجيل الدخول</Link>
                <Link href="/register" className="nav-link mt-2">إنشاء حساب جديد</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
