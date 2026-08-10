"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function StoresListClient({ currentStatus, q, statuses, labels }: {
  currentStatus: string; q: string; statuses: string[]; labels: Record<string, string>;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  function update(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value); else p.delete(key);
    start(() => router.push(`/admin/stores?${p.toString()}`));
  }

  return (
    <div className="mt-4 rounded-lg bg-white p-4 ring-1 ring-gray-100">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label">بحث</label>
          <input defaultValue={q} onKeyDown={(e) => { if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value); }} placeholder="اسم المتجر…" className="input w-full" />
        </div>
        <div>
          <label className="label">الحالة</label>
          <select defaultValue={currentStatus} onChange={(e) => update("status", e.target.value)} className="input w-full">
            <option value="">الكل</option>
            {statuses.map((s) => <option key={s} value={s}>{labels[s] || s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
