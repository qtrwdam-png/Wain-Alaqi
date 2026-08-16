// Canonical production URL for the marketplace. Individual pages build absolute
// URLs (canonical, Open Graph, JSON-LD) on top of this. Override locally or in
// preview envs via NEXT_PUBLIC_APP_URL.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://wainalaqi.com"
).replace(/\/$/, "");

export const SITE_NAME_AR = "وين ألاقي؟";
export const SITE_NAME_EN = "Wain Alaqi";
export const SITE_TAGLINE =
  "ابحث عن المنتج أو الخدمة التي تحتاجها في الرمثا، الأردن";
export const SITE_LOCALE = "ar_JO";

// Default geo for the platform (Ramtha, Jordan) — used in Organization schema.
export const SITE_GEO = {
  latitude: 32.5586,
  longitude: 36.0031,
  addressCountry: "JO",
  addressRegion: "Irbid",
  addressLocality: "الرمثا",
};

export function absoluteUrl(path: string = "/"): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}
