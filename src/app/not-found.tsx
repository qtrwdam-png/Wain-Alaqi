import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-10 text-center">
      <div className="text-6xl">🔍</div>
      <h1 className="mt-4 text-2xl font-extrabold text-gray-900">الصفحة غير موجودة</h1>
      <p className="mt-2 text-gray-500">عذراً، لم نتمكن من العثور على هذه الصفحة.</p>
      <Link href="/" className="btn-primary mt-6">العودة للرئيسية</Link>
    </div>
  );
}
