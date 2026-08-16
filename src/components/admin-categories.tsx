"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithRetry } from "@/lib/fetch-retry";

type Cat = { id: string; name: string; slug: string; icon: string | null; sortOrder: number; active: boolean; _count: { stores: number; products: number } };

export function CategoriesAdminClient({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", icon: "", sortOrder: 0 });
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; icon: string; sortOrder: number; active: boolean }>({ name: "", icon: "", sortOrder: 0, active: true });
  const [editError, setEditError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetchWithRetry("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, icon: form.icon, sortOrder: Number(form.sortOrder), active: true }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
    setForm({ name: "", icon: "", sortOrder: 0 });
    router.refresh();
  }

  function startEdit(c: Cat) {
    setEditingId(c.id);
    setEditForm({ name: c.name, icon: c.icon || "", sortOrder: c.sortOrder, active: c.active });
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function saveEdit(id: string) {
    setSavingId(id);
    setEditError(null);
    const res = await fetchWithRetry(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        icon: editForm.icon,
        sortOrder: Number(editForm.sortOrder),
        active: editForm.active,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingId(null);
    if (!res.ok) { setEditError(data.error || "حدث خطأ"); return; }
    setEditingId(null);
    router.refresh();
  }

  async function toggleActive(c: Cat) {
    const res = await fetchWithRetry(`/api/admin/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    if (res.ok) router.refresh();
  }

  async function remove(id: string, name: string, storeCount: number) {
    setDeleteError(null);
    const hint = storeCount > 0
      ? `تنبيه: هذا القطاع يحتوي على ${storeCount} متجر. لا يمكن حذفه ما دام يحتوي على متاجر.`
      : "سيتم حذف القطاع نهائياً. المنتجات المرتبطة به (إن وجدت) ستفقد تصنيفها لكنها لن تُحذف.";
    const ok = window.confirm(`حذف القطاع «${name}»؟\n\n${hint}\n\nهل أنت متأكد؟`);
    if (!ok) return;
    setDeletingId(id);
    const res = await fetchWithRetry(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setDeletingId(null);
    if (!res.ok) { setDeleteError(data.error || "حدث خطأ أثناء الحذف"); return; }
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-2">
        {deleteError && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{deleteError}</p>}
        {categories.map((c) => (
          <div key={c.id} className="card p-3">
            {editingId === c.id ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="label">الاسم</label><input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                  <div><label className="label">الأيقونة (إيموجي)</label><input className="input" value={editForm.icon} onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })} placeholder="🏷️" /></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="label">الترتيب</label><input type="number" className="input" value={editForm.sortOrder} onChange={(e) => setEditForm({ ...editForm, sortOrder: Number(e.target.value) })} /></div>
                  <div><label className="label">الحالة</label>
                    <label className="flex items-center gap-2 py-2 text-sm"><input type="checkbox" checked={editForm.active} onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })} /> نشط (ظاهر للعامة)</label>
                  </div>
                </div>
                {editError && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{editError}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => saveEdit(c.id)} disabled={savingId === c.id} className="btn-primary px-4 py-2 text-sm">{savingId === c.id ? "جارٍ…" : "حفظ"}</button>
                  <button type="button" onClick={cancelEdit} className="btn-ghost px-4 py-2 text-sm">إلغاء</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-2xl">{c.icon || "🏷️"}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c._count.stores} متجر · {c._count.products} منتج · ترتيب {c.sortOrder}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" onClick={() => toggleActive(c)} className={`badge ${c.active ? "badge-green" : "badge-gray"}`} title="تبديل الحالة">{c.active ? "نشط" : "معطل"}</button>
                  <button type="button" onClick={() => startEdit(c)} className="btn-secondary px-3 py-1 text-sm" aria-label={`تعديل القطاع ${c.name}`}>تعديل</button>
                  <button type="button" onClick={() => remove(c.id, c.name, c._count.stores)} disabled={deletingId === c.id} className="btn-danger px-3 py-1 text-sm" aria-label={`حذف القطاع ${c.name}`}>{deletingId === c.id ? "جارٍ…" : "حذف"}</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {categories.length === 0 && <p className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">لا توجد قطاعات بعد.</p>}
      </div>

      <form onSubmit={create} className="card space-y-3 p-4">
        <h2 className="font-bold">إضافة قطاع</h2>
        <div><label className="label">الاسم</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">الأيقونة (إيموجي)</label><input className="input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🏷️" /></div>
        <div><label className="label">الترتيب</label><input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <button type="submit" className="btn-primary w-full">إضافة</button>
      </form>
    </div>
  );
}
