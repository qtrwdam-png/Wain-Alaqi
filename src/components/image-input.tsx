"use client";

import { useRef, useState } from "react";
import { fetchWithRetry } from "@/lib/fetch-retry";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  /** "product" uses the products folder on Cloudinary, otherwise stores folder */
  kind?: "store" | "product";
};

/**
 * Image input with two modes:
 * 1. External URL — paste a link
 * 2. Upload from device — uploads to Cloudinary via /api/upload
 *
 * Shows a live preview when a URL is present.
 */
export function ImageInput({ label, value, onChange, hint, kind = "store" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"url" | "upload">(value ? "url" : "upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    // Append "product" to filename so the server routes to the products folder
    const renamed = new File([file], `${kind}-${file.name}`, { type: file.type });

    const formData = new FormData();
    formData.append("file", renamed);

    try {
      const res = await fetchWithRetry("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذّر رفع الصورة");
      } else {
        onChange(data.url);
      }
    } catch {
      setError("تعذّر الاتصال بالخادم");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      <label className="label">{label}</label>

      {/* Mode toggle */}
      <div className="mb-2 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            mode === "upload" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          📁 رفع من الجهاز
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            mode === "url" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          🔗 رابط خارجي
        </button>
      </div>

      {mode === "upload" ? (
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:ml-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
          />
          {uploading && <span className="shrink-0 text-sm text-gray-400">جارٍ الرفع…</span>}
        </div>
      ) : (
        <input
          type="url"
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          dir="ltr"
        />
      )}

      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Preview */}
      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt={label}
            className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}
