"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-10 text-center">
      <div className="text-6xl">⚠️</div>
      <h1 className="mt-4 text-2xl font-extrabold text-gray-900">حدث خطأ ما</h1>
      <p className="mt-2 text-gray-500">عذراً، حدث خطأ غير متوقع. حاول مرة أخرى.</p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="btn-primary">إعادة المحاولة</button>
        <Link href="/" className="btn-secondary">العودة للرئيسية</Link>
      </div>
    </div>
  );
}
