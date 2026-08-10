import Link from "next/link";
import { APP_NAME, APP_NAME_EN } from "@/config/constants";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="container-app py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">و</span>
              <span className="text-lg font-extrabold text-brand-700">{APP_NAME}</span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              منصة محلية للبحث عن المنتجات والخدمات والمتاجر في الرمثا، الأردن.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-800">روابط</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-brand-700">الرئيسية</Link></li>
              <li><Link href="/categories" className="hover:text-brand-700">القطاعات</Link></li>
              <li><Link href="/stores" className="hover:text-brand-700">المتاجر</Link></li>
              <li><Link href="/map" className="hover:text-brand-700">الخريطة</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-800">للتجار</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/add-store" className="hover:text-brand-700">أضف متجرك</Link></li>
              <li><Link href="/dashboard/store" className="hover:text-brand-700">لوحة التاجر</Link></li>
              <li><Link href="/login" className="hover:text-brand-700">تسجيل الدخول</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-800">حول</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-brand-700">عن المنصة</Link></li>
              <li><Link href="/contact" className="hover:text-brand-700">تواصل معنا</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {APP_NAME_EN}. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
