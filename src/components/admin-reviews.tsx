"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Review = { id: string; rating: number; comment: string | null; status: string; storeName: string; storeSlug: string; userName: string; createdAt: string };

export function AdminReviewsClient({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    setLoading(id);
    await fetch(`/api/admin/reviews`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setLoading(null);
    router.refresh();
  }
  async function del(id: string) {
    if (!confirm("حذف التقييم نهائياً؟")) return;
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-2">
      {reviews.map((r) => (
        <div key={r.id} className="card p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400">{"★".repeat(r.rating)}<span className="text-gray-200">{"★".repeat(5 - r.rating)}</span></span>
                <Link href={`/stores/${r.storeSlug}`} className="font-bold text-gray-800 hover:underline">{r.storeName}</Link>
                <span className={`badge ${r.status === "VISIBLE" ? "badge-green" : "badge-gray"}`}>{r.status === "VISIBLE" ? "ظاهر" : "مخفي"}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{r.comment || "بدون تعليق"}</p>
              <p className="mt-1 text-xs text-gray-400">{r.userName} · {new Date(r.createdAt).toLocaleDateString("ar")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.status === "VISIBLE"
                ? <button onClick={() => setStatus(r.id, "HIDDEN")} disabled={loading === r.id} className="btn-ghost text-sm">إخفاء</button>
                : <button onClick={() => setStatus(r.id, "VISIBLE")} disabled={loading === r.id} className="btn-secondary text-sm">إظهار</button>}
              <button onClick={() => del(r.id)} className="btn-danger text-sm">حذف</button>
            </div>
          </div>
        </div>
      ))}
      {reviews.length === 0 && <p className="rounded-lg bg-white p-6 text-center text-gray-500 ring-1 ring-gray-100">لا توجد تقييمات.</p>}
    </div>
  );
}
