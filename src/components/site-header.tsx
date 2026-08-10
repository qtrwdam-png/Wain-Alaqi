import Link from "next/link";
import { Suspense } from "react";
import { APP_NAME } from "@/config/constants";
import { SearchBox } from "@/components/search-box";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-app">
        <div className="flex h-16 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
              و
            </span>
            <span className="text-xl font-extrabold text-brand-700">{APP_NAME}</span>
          </Link>

          <Suspense fallback={null}>
            <SearchBox compact />
          </Suspense>

          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/categories" className="nav-link">القطاعات</Link>
            <Link href="/stores" className="nav-link">المتاجر</Link>
            <Link href="/map" className="nav-link">الخريطة</Link>
            <Link href="/add-store" className="nav-link">أضف متجرك</Link>
          </nav>

          <div className="mr-auto flex items-center gap-2">
            <Link href="/dashboard/store" className="btn-secondary hidden sm:inline-flex">
              لوحة التاجر
            </Link>
            <Link href="/login" className="btn-primary">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
