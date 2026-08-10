"use client";

import { useState } from "react";

import { fetchWithRetry } from "@/lib/fetch-retry";
const KEYS: { key: string; label: string; type: "text" | "textarea" | "json" }[] = [
  { key: "home_hero", label: "عنوان ووصف البطل", type: "json" },
  { key: "home_banner", label: "بانر الدعوة (هل لديك متجر؟)", type: "json" },
  { key: "footer", label: "نص التذييل", type: "json" },
  { key: "about", label: "صفحة عن المنصة", type: "json" },
  { key: "faq", label: "الأسئلة الشائعة", type: "json" },
  { key: "contact", label: "معلومات التواصل", type: "json" },
];

export function ContentEditorClient({ content }: { content: Record<string, any> }) {
  const [active, setActive] = useState("home_hero");
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function load(key: string) {
    setActive(key);
    const v = content[key];
    setValue(typeof v === "string" ? v : v ? JSON.stringify(v, null, 2) : "");
  }

  async function save() {
    setLoading(true); setMsg(null);
    const key = KEYS.find((k) => k.key === active)!;
    let val: any = value;
    if (key.type === "json") {
      try { val = JSON.parse(value || "{}"); } catch { setMsg("خطأ في صيغة JSON"); setLoading(false); return; }
    }
    const res = await fetchWithRetry("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: active, value: val }),
    });
    setLoading(false);
    setMsg(res.ok ? "تم الحفظ بنجاح." : "حدث خطأ أثناء الحفظ.");
  }

  // init
  if (!value && content[active] !== undefined) load(active);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
      <div className="card h-fit p-3">
        <nav className="space-y-1">
          {KEYS.map((k) => (
            <button key={k.key} onClick={() => load(k.key)} className={`nav-link w-full text-right ${active === k.key ? "nav-link-active" : ""}`}>{k.label}</button>
          ))}
        </nav>
      </div>
      <div className="card p-6">
        <h2 className="mb-3 font-bold">{KEYS.find((k) => k.key === active)?.label}</h2>
        {KEYS.find((k) => k.key === active)?.type === "textarea" ? (
          <textarea className="input min-h-[200px]" value={value} onChange={(e) => setValue(e.target.value)} />
        ) : KEYS.find((k) => k.key === active)?.type === "json" ? (
          <textarea className="input min-h-[300px] font-mono text-xs" dir="ltr" value={value} onChange={(e) => setValue(e.target.value)} />
        ) : (
          <input className="input" value={value} onChange={(e) => setValue(e.target.value)} />
        )}
        {msg && <p className={`mt-3 rounded p-2 text-sm ${msg.includes("خطأ") ? "bg-red-50 text-red-700" : "bg-brand-50 text-brand-700"}`}>{msg}</p>}
        <button onClick={save} disabled={loading} className="btn-primary mt-4">{loading ? "جارٍ الحفظ…" : "حفظ"}</button>
      </div>
    </div>
  );
}
