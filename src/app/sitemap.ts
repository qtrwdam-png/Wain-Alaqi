import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

// Static, publicly-indexable pages (auth/dashboard/admin pages are excluded).
// /search is excluded — it is user-generated query results (noindex).
const STATIC_ROUTES: { path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFreq: "daily" },
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
    url: `${SITE_URL}${r.path}` || SITE_URL,
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
