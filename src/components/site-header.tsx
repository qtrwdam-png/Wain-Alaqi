"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/config/constants";
import { SearchBox } from "@/components/search-box";
import { NotificationBell } from "@/components/notification-bell";
import { Logo } from "@/components/logo";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const isAuthed = status === "authenticated" && !!session?.user;
  const role = (session?.user as any)?.role as string | undefined;
  const isAdmin = role === "ADMIN";
  const isStaff = role === "ADMIN" || role === "CONTENT_MANAGER";
  const isStoreOwner = role === "STORE_OWNER";
  const canAddStore = isAuthed && (role === "USER" || isStoreOwner);
  const showStoreDashboard = isStoreOwner || isAdmin;
  const showAdminPanel = isStaff;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-app">
        <div className="flex h-14 items-center gap-2 sm:h-16 sm:gap-3">
          <Link href="/" className="flex shrink-0 items-center" aria-label={APP_NAME}>
            <Logo size={34} withText={false} priority className="sm:hidden" />
            <Logo size={36} withText priority className="hidden sm:inline-flex" />
          </Link>

          <Suspense fallback={null}>
            <SearchBox compact />
          </Suspense>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
            ))}
          </nav>

          <div className="mr-auto flex items-center gap-1 sm:gap-2">
            {/* Mobile search trigger */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 md:hidden"
              aria-label="بحث"
              aria-expanded={searchOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            </button>

            {isAuthed ? (
              <>
                <NotificationBell />
                <div className="hidden items-center gap-1 sm:flex">
                  {showAdminPanel && (
                    <Link href="/admin" className="btn-secondary">🛡️ لوحة الإدارة</Link>
                  )}
                  {showStoreDashboard && (
                    <Link href="/dashboard/store" className="btn-secondary">🏪 لوحة المتجر</Link>
                  )}
                  <Link href="/account/settings" className="btn-ghost">حسابي</Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-ghost text-red-600">خروج</button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-primary hidden sm:inline-flex">تسجيل الدخول</Link>
                <Link href="/register" className="btn-secondary hidden sm:inline-flex">حساب جديد</Link>
              </>
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

      {/* Mobile search bar (collapsible) */}
      {searchOpen && (
        <div className="border-t border-gray-200 bg-white px-3 pb-3 pt-2 md:hidden">
          <Suspense fallback={<div className="h-12 text-gray-400">جارٍ التحميل…</div>}>
            <SearchBox compact={false} />
          </Suspense>
        </div>
      )}

      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <nav className="container-app flex flex-col py-3">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
            ))}
            <div className="my-2 border-t border-gray-100" />
            {isAuthed ? (
              <>
                <Link href="/account/settings" className="nav-link">👤 إعدادات الحساب</Link>
                {canAddStore && (
                  <Link href="/add-store" className="nav-link">🏪 أضف متجرك</Link>
                )}
                {showStoreDashboard && (
                  <Link href="/dashboard/store" className="nav-link">📊 لوحة المتجر</Link>
                )}
                {showAdminPanel && (
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
