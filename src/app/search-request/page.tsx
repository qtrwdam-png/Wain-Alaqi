"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SearchRequestForm() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("query") || "");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await fetch("/api/search-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, notes, phone, email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="container-app py-20 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl">✓</div>
          <h1 className="text-2xl font-extrabold text-gray-900">تم إرسال طلبك بنجاح</h1>
          <p className="mt-2 text-gray-500">سنبذل جهدنا للعثور على ما تبحث عنه في الرمثا.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-extrabold text-gray-900">أرسل طلب بحث</h1>
        <p className="mt-2 text-gray-500">لم تجد ما تبحث عنه؟ أرسل لنا تفاصيل وسنبذل جهدنا لإيجاده.</p>
        <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
          <div><label className="label">ما الذي تبحث عنه؟ *</label><input className="input" required value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          <div><label className="label">ملاحظات</label><textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">رقم الهاتف</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div><label className="label">البريد الإلكتروني</label><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          </div>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "جارٍ الإرسال…" : "إرسال الطلب"}</button>
        </form>
      </div>
    </div>
  );
}

export default function SearchRequestPage() {
  return (
    <Suspense fallback={<div className="container-app py-20 text-center text-gray-400">جارٍ التحميل…</div>}>
      <SearchRequestForm />
    </Suspense>
  );
}
