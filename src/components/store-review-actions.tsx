"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithRetry } from "@/lib/fetch-retry";

export function StoreReviewActions({ storeId, currentStatus, rejectionReason }: {
  storeId: string; currentStatus: string; rejectionReason: string | null;
}) {
  const router = useRouter();
  const [reason, setReason] = useState(rejectionReason || "");
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function act(action: string) {
    setLoading(true); setError(null); setMsg(null);
    if (action === "reject" && !reason.trim()) {
      setError("يرجى تحديد سبب الرفض.");
      setLoading(false);
      return;
    }
    const res = await fetchWithRetry(`/api/admin/stores/${storeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, rejectionReason: reason || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
    setMsg(action === "approve" ? "تمت الموافقة على المتجر بنجاح." : action === "reject" ? "تم رفض المتجر." : "تم تنفيذ الإجراء.");
    router.refresh();
  }

  return (
    <div className="card p-4">
      <h2 className="mb-3 font-bold">مراجعة المتجر</h2>
      <p className="mb-3 text-sm text-gray-500">الحالة الحالية: <strong>{currentStatus}</strong></p>
      <div className="space-y-2">
        <div>
          <label className="label">سبب الرفض (عند الرفض)</label>
          <textarea className="input" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="مثال: يرجى إضافة عنوان واضح للمتجر." />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => act("approve")} disabled={loading} className="btn-primary">موافقة</button>
          <button onClick={() => act("reject")} disabled={loading} className="btn-danger">رفض</button>
          <button onClick={() => act("suspend")} disabled={loading} className="btn-ghost">إيقاف</button>
          <button onClick={() => act("archive")} disabled={loading} className="btn-ghost">أرشفة</button>
          <button onClick={() => act("feature")} disabled={loading} className="btn-ghost text-sm">تمييز</button>
          <button onClick={() => act("unfeature")} disabled={loading} className="btn-ghost text-sm">إلغاء التمييز</button>
        </div>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        {msg && <p className="rounded bg-brand-50 p-2 text-sm text-brand-700">{msg}</p>}
      </div>
    </div>
  );
}
