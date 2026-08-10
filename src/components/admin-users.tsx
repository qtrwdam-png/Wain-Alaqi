"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithRetry } from "@/lib/fetch-retry";
import { ROLE_LABELS } from "@/config/constants";

type User = { id: string; name: string; email: string; phone: string | null; role: string; active: boolean; isDemo: boolean; createdAt: string; _count: { stores: number } };

export function AdminUsersClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  async function update(id: string, role: string, active: boolean) {
    await fetchWithRetry(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, active }),
    });
    router.refresh();
  }
  async function del(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    await fetchWithRetry(`/api/admin/users/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-2">
      {users.map((u) => (
        <div key={u.id} className="card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-800">{u.name}</p>
                {u.isDemo && <span className="badge-blue">تجريبي</span>}
                {!u.active && <span className="badge-red">معطل</span>}
              </div>
              <p className="text-sm text-gray-500">{u.email} · {u.phone || "—"}</p>
              <p className="text-xs text-gray-400">{ROLE_LABELS[u.role] || u.role} · {u._count.stores} متجر · {new Date(u.createdAt).toLocaleDateString("ar")}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setExpanded(expanded === u.id ? null : u.id)} className="btn-secondary text-sm">تعديل</button>
              <button onClick={() => del(u.id)} className="btn-danger text-sm">حذف</button>
            </div>
          </div>
          {expanded === u.id && (
            <div className="mt-4 border-t pt-3">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="label">الدور</label>
                  <select defaultValue={u.role} onChange={(e) => update(u.id, e.target.value, u.active)} className="input">
                    <option value="USER">مستخدم</option>
                    <option value="STORE_OWNER">تاجر</option>
                    <option value="CONTENT_MANAGER">محرر محتوى</option>
                    <option value="ADMIN">مدير</option>
                  </select>
                </div>
                <button onClick={() => update(u.id, u.role, !u.active)} className="btn-secondary">{u.active ? "تعطيل" : "تفعيل"}</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
