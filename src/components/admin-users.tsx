"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithRetry } from "@/lib/fetch-retry";
import { ROLE_LABELS } from "@/config/constants";

type User = { id: string; name: string; email: string; phone: string | null; role: string; active: boolean; isDemo: boolean; createdAt: string; _count: { stores: number } };

export function AdminUsersClient({ users }: { users: User[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // New staff form state
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "CONTENT_MANAGER" as "ADMIN" | "CONTENT_MANAGER" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    const res = await fetchWithRetry(`/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) { setCreateError(data.error || "حدث خطأ"); return; }
    setForm({ name: "", email: "", phone: "", password: "", role: "CONTENT_MANAGER" });
    setShowCreate(false);
    router.refresh();
  }

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
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">إدارة المستخدمين، التجار، والمشرفين.</p>
        <button onClick={() => setShowCreate((v) => !v)} className="btn-primary text-sm">+ إضافة مشرف</button>
      </div>

      {showCreate && (
        <form onSubmit={createStaff} className="card mb-6 space-y-4 p-6">
          <h3 className="text-lg font-bold">إنشاء حساب مشرف جديد</h3>
          <p className="text-sm text-gray-500">يمكن إنشاء مدير أو محرر محتوى فقط من هنا. الحساب العادي أو التاجر يُنشأ عبر صفحة التسجيل العامة.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">الاسم *</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label">البريد الإلكتروني *</label><input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="label">الهاتف</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="label">كلمة المرور *</label><input type="password" className="input" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div><label className="label">الدور *</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })}>
                <option value="CONTENT_MANAGER">محرر محتوى</option>
                <option value="ADMIN">مدير</option>
              </select>
            </div>
          </div>
          {createError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{createError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="btn-primary">{creating ? "جارٍ الإنشاء…" : "إنشاء المشرف"}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">إلغاء</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
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
    </div>
  );
}
