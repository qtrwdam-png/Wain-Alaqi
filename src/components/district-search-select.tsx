"use client";

import { useEffect, useRef, useState } from "react";
import { fetchWithRetry } from "@/lib/fetch-retry";

type District = { id: string; name: string };

type Props = {
  cityId: string;
  value: string;
  onChange: (districtId: string) => void;
  /** When a new district is created, call this to reset any internal state */
  onDistrictCreated?: () => void;
};

/**
 * Searchable district dropdown.
 *
 * Behavior:
 * - Renders a text input that filters districts by name (Arabic, RTL).
 * - Shows a dropdown of matching districts; click to select.
 * - If no district matches the typed text, shows an "إضافة حي جديد" option.
 * - Clicking "add" creates the district via POST /api/districts and auto-selects it.
 *
 * The new district is saved to the DB and will appear for other merchants.
 */
export function DistrictSearchSelect({ cityId, value, onChange, onDistrictCreated }: Props) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addingName, setAddingName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Load districts when city changes
  useEffect(() => {
    if (!cityId) { setDistricts([]); return; }
    setLoading(true);
    fetchWithRetry(`/api/districts?cityId=${cityId}`)
      .then((r) => r.json())
      .then((d) => setDistricts(d.districts || []))
      .catch(() => setDistricts([]))
      .finally(() => setLoading(false));
  }, [cityId]);

  // Sync the selected name when value/districts change (e.g. after city load)
  useEffect(() => {
    if (value) {
      const d = districts.find((x) => x.id === value);
      setSelectedName(d ? d.name : selectedName);
    } else {
      setSelectedName("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, districts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query
    ? districts.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
    : districts;

  const exactMatch = districts.some(
    (d) => d.name.toLowerCase() === query.trim().toLowerCase(),
  );
  const canAdd = query.trim().length > 1 && !exactMatch && !adding;

  async function handleAdd() {
    const name = (addingName || query).trim();
    if (!name || !cityId) return;
    setError(null);
    setAdding(true);
    try {
      const res = await fetchWithRetry("/api/districts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cityId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذّر إضافة الحي");
        setAdding(false);
        return;
      }
      const newDistrict: District = data.district;
      setDistricts((prev) => [...prev, newDistrict].sort((a, b) => a.name.localeCompare(b.name, "ar")));
      onChange(newDistrict.id);
      setSelectedName(newDistrict.name);
      setQuery("");
      setOpen(false);
      setAdding(false);
      setAddingName("");
      onDistrictCreated?.();
    } catch {
      setError("تعذّر الاتصال بالخادم");
      setAdding(false);
    }
  }

  function selectDistrict(d: District) {
    onChange(d.id);
    setSelectedName(d.name);
    setQuery("");
    setOpen(false);
  }

  // When no city selected
  if (!cityId) {
    return (
      <div>
        <label className="label">الحي / المنطقة</label>
        <input className="input bg-gray-50" disabled placeholder="اختر المدينة أولاً" />
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <label className="label">الحي / المنطقة</label>

      {/* Searchable input */}
      <div className="relative">
        <input
          className="input"
          value={open ? query : selectedName}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); if (selectedName) { setSelectedName(""); onChange(""); } }}
          onFocus={() => { setOpen(true); setQuery(selectedName); }}
          placeholder={loading ? "جارٍ التحميل…" : districts.length === 0 ? "ابحث أو أضف حياً جديداً…" : "ابحث عن حي…"}
          disabled={loading}
        />
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
          {loading ? "⏳" : "🔍"}
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto">
          {filtered.length === 0 && !canAdd && (
            <div className="px-3 py-2 text-sm text-gray-400">
              {query ? "لا توجد نتائج مطابقة" : "ابدأ الكتابة للبحث…"}
            </div>
          )}

          {filtered.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => selectDistrict(d)}
              className="block w-full px-3 py-2 text-right text-sm hover:bg-brand-50 hover:text-brand-700"
            >
              {d.name}
            </button>
          ))}

          {/* Add new district option */}
          {canAdd && (
            <div className="border-t border-gray-100">
              {!adding ? (
                <button
                  type="button"
                  onClick={() => { setAddingName(query.trim()); setAdding(true); }}
                  className="block w-full px-3 py-2 text-right text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  + إضافة حي جديد: «{query.trim()}»
                </button>
              ) : (
                <div className="space-y-2 p-3">
                  <input
                    className="input"
                    value={addingName}
                    onChange={(e) => setAddingName(e.target.value)}
                    placeholder="اسم الحي الجديد"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAdd}
                      className="btn-primary flex-1 py-1.5 text-sm"
                    >
                      حفظ الحي
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAdding(false); setAddingName(""); }}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {selectedName && !open && (
        <p className="mt-1 text-xs text-gray-400">المحدد: {selectedName}</p>
      )}
    </div>
  );
}
