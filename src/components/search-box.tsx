"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchBox({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  if (compact) {
    return (
      <form onSubmit={submit} className="relative hidden flex-1 max-w-md md:block">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ماذا تبحث عنه؟"
          className="input pr-10"
          aria-label="بحث"
        />
        <button
          type="submit"
          className="absolute inset-y-0 left-2 my-auto h-8 w-8 rounded-md bg-brand-600 text-white flex items-center justify-center"
          aria-label="بحث"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="relative w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ماذا تبحث عنه؟"
            className="input h-12 pr-11 text-base sm:h-14 sm:pr-12 sm:text-lg"
            aria-label="بحث"
          />
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <button type="submit" className="btn-primary h-12 px-8 text-base sm:h-14 sm:text-lg">
          بحث
        </button>
      </div>
    </form>
  );
}
