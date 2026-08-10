"use client";
import { fetchWithRetry } from "@/lib/fetch-retry";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { useState, useEffect } from "react";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  user: { name: string };
  createdAt: string;
};

export function ReviewsSection({ storeId, storeSlug }: { storeId: string; storeSlug: string }) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWithRetry(`/api/reviews?storeId=${storeId}`)
      .then((r) => r.json())
      .then((d) => { setReviews(d.reviews || []); })
      .finally(() => setLoading(false));
  }, [storeId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null);
    setSubmitting(true);
    const res = await fetchWithRetry("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, rating, comment }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "حدث خطأ");
      return;
    }
    setSuccess("تم إرسال تقييمك بنجاح. سيظهر بعد المراجعة.");
    setComment("");
    fetchWithRetry(`/api/reviews?storeId=${storeId}`).then((r) => r.json()).then((d) => setReviews(d.reviews || []));
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">التقييمات</h2>

      {status === "authenticated" ? (
        <form onSubmit={submit} className="card mb-6 p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-medium">تقييمك:</span>
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} onClick={() => setRating(n)} className="text-2xl" aria-label={`${n} نجوم`}>
                <span className={n <= rating ? "text-amber-400" : "text-gray-300"}>★</span>
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="أضف تعليقًا (اختياري)…"
            className="input mb-3"
            rows={3}
          />
          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
          {success && <p className="mb-2 text-sm text-brand-600">{success}</p>}
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "جارٍ الإرسال…" : "إرسال التقييم"}
          </button>
        </form>
      ) : (
        <div className="card mb-6 p-6 text-center">
          <p className="text-gray-600">يجب تسجيل الدخول لإضافة تقييم.</p>
          <Link
            href={`/login?from=/stores/${storeSlug}`}
            className="btn-primary mt-3 inline-block"
          >
            تسجيل الدخول للتقييم
          </Link>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">جارٍ التحميل…</p>
      ) : reviews.length === 0 ? (
        <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">{r.user.name}</span>
                <span className="text-amber-400">{"★".repeat(r.rating)}<span className="text-gray-200">{"★".repeat(5 - r.rating)}</span></span>
              </div>
              {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
              <p className="mt-2 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("ar")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
