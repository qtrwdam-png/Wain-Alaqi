import Link from "next/link";
import { APP_NAME_EN } from "@/config/constants";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="container-app py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size={36} />
            <p className="mt-3 max-w-xs text-sm text-gray-500">
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
          <p>© {new Date().getFullYear()} {APP_NAME_EN}. جميع الحقوق محفوظة.</p>
          <p className="mt-1">
            تصميم وتطوير{" "}
            <a
              href="/about"
              className="font-medium text-gray-500 hover:text-brand-700"
              aria-label="فايز أبو العيلة — مطور المنصة"
            >
              فايز أبو العيلة
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
