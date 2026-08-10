"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Req = { id: string; query: string; notes: string | null; phone: string | null; email: string | null; status: string; count: number; createdAt: string };

export function AdminSearchRequestsClient({ requests, labels }: { requests: Req[]; labels: Record<string, string> }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    setLoading(id);
    await fetch(`/api/admin/search-requests`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-2">
      {requests.map((r) => (
        <div key={r.id} className="card p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-800">{r.query}</p>
                <span className="badge-blue">{r.count} طلب</span>
                <span className="badge-gray">{labels[r.status] || r.status}</span>
              </div>
              {r.notes && <p className="mt-1 text-sm text-gray-600">{r.notes}</p>}
              <p className="mt-1 text-xs text-gray-400">{r.phone || r.email || "مجهول"} · {new Date(r.createdAt).toLocaleDateString("ar")}</p>
            </div>
            <select defaultValue={r.status} onChange={(e) => setStatus(r.id, e.target.value)} disabled={loading === r.id} className="input text-sm">
              <option value="NEW">جديد</option>
              <option value="SEARCHING">قيد البحث</option>
              <option value="FOUND">تم الإيجاد</option>
              <option value="CLOSED">مغلق</option>
            </select>
          </div>
        </div>
      ))}
      {requests.length === 0 && <p className="rounded-lg bg-white p-6 text-center text-gray-500 ring-1 ring-gray-100">لا توجد طلبات بحث.</p>}
    </div>
  );
}
