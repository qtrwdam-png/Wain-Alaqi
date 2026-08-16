"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithRetry } from "@/lib/fetch-retry";

// Destructive action — permanent store deletion. Cascades to products &
// reviews (schema onDelete: Cascade). Requires explicit confirmation.
export function StoreDeleteButton({ storeId, storeName }: { storeId: string; storeName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setError(null);
    const ok = window.confirm(
      `حذف المتجر «${storeName}» نهائياً؟\n\n` +
      `سيتم حذف جميع منتجاته وتقييماته معه. لا يمكن التراجع عن هذا الإجراء.\n\n` +
      `هل أنت متأكد؟`
    );
    if (!ok) return;
    setLoading(true);
    const res = await fetchWithRetry(`/api/admin/stores/${storeId}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(data.error || "حدث خطأ أثناء الحذف"); return; }
    router.push("/admin/stores");
    router.refresh();
  }

  return (
    <div>
      <button type="button" onClick={remove} disabled={loading} className="btn-danger w-full">
        {loading ? "جارٍ الحذف…" : "حذف المتجر نهائياً"}
      </button>
      {error && <p className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
