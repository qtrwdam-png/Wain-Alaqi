import { Category } from "@prisma/client";

/**
 * Stable SVG icons for categories, keyed by slug. Avoids relying on emoji
 * glyph support in the system font (which renders as a "tofu" box / question
 * mark on devices that lack a colour-emoji font).
 */
const ICONS: Record<string, JSX.Element> = {
  electronics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  ),
  "auto-parts": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 11l1.5-4.5h11L19 11" />
      <path d="M3 11h18v4a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" />
      <circle cx="7.5" cy="15.5" r="1.2" />
      <circle cx="16.5" cy="15.5" r="1.2" />
    </svg>
  ),
  "home-tools": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  ),
  "building-materials": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="5" rx="1" />
      <rect x="3" y="11" width="18" height="5" rx="1" />
      <path d="M7 4v5M12 11v5M17 4v5M9 16v4M15 16v4" />
    </svg>
  ),
  electrical: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
  fashion: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3l4 3h4l4-3 3 4-4 3v11H5V10L1 7z" />
    </svg>
  ),
  food: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 3v8a2 2 0 0 0 2 2h1v8" />
      <path d="M8 3v6" />
      <path d="M16 3c-2 0-3 2-3 5s1 4 3 4 3-1 3-4-1-5-3-5z" />
      <path d="M16 12v9" />
    </svg>
  ),
  pharmacy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8V4h-2M12 4h2" />
      <path d="M12 12v6M9 15h6" />
    </svg>
  ),
  furniture: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
      <path d="M3 10h18l-1 5H4z" />
      <path d="M5 15v5M19 15v5" />
      <path d="M8 20v-2M16 20v-2" />
    </svg>
  ),
  services: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 5.5a3.5 3.5 0 0 1 4 4l-9 9-4 1 1-4 8-8z" />
      <path d="M13 7l4 4" />
    </svg>
  ),
};

const FALLBACK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 7l-8 8-4-4-4 4" />
    <path d="M16 7h4v4" />
  </svg>
);

export function CategoryIcon({
  slug,
  className = "h-6 w-6",
}: {
  slug: string;
  className?: string;
}) {
  return <span className={className}>{ICONS[slug] || FALLBACK}</span>;
}

/** Human-readable label for accessibility, derived from the category name. */
export function categoryIconLabel(category: Pick<Category, "slug" | "name">) {
  return category.name;
}
