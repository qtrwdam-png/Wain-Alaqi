import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Base site URL — falls back to the Railway production domain when the env var
// is not set so the sitemap always resolves to absolute URLs.
const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://test-web-production-b6f1.up.railway.app";

// Static, publicly-indexable pages (auth/dashboard/admin pages are excluded).
const STATIC_ROUTES: { path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFreq: "daily" },
  { path: "/search", priority: 0.9, changeFreq: "daily" },
  { path: "/stores", priority: 0.9, changeFreq: "daily" },
  { path: "/categories", priority: 0.8, changeFreq: "weekly" },
  { path: "/map", priority: 0.7, changeFreq: "weekly" },
  { path: "/add-store", priority: 0.6, changeFreq: "monthly" },
  { path: "/about", priority: 0.4, changeFreq: "monthly" },
  { path: "/contact", priority: 0.4, changeFreq: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}/${r.path}`.replace(/\/$/, "") || SITE_URL,
    lastModified: now,
    changeFrequency: r.changeFreq,
    priority: r.priority,
  }));

  // Active categories.
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
      orderBy: { sortOrder: "asc" },
    });
    for (const c of categories) {
      entries.push({
        url: `${SITE_URL}/categories/${encodeURIComponent(c.slug)}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // DB unavailable at build/request time — skip dynamic entries.
  }

  // Approved stores only (PENDING_REVIEW/DRAFT/etc. are not public).
  try {
    const stores = await prisma.store.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    for (const s of stores) {
      entries.push({
        url: `${SITE_URL}/stores/${encodeURIComponent(s.slug)}`,
        lastModified: s.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // DB unavailable — skip.
  }

  return entries;
}
