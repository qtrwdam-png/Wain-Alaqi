import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Cached data-fetching helpers for public pages.
 *
 * Each function wraps a Prisma query with `unstable_cache` + tags.
 * When a mutation happens (create/update/delete), the corresponding
 * mutation route calls `revalidateTag()` to bust the cache, and the
 * next request rebuilds it with fresh data.
 *
 * Revalidate fallback: 3600s (1 hour) — if revalidateTag is missed,
 * data still refreshes hourly.
 */

const REVALIDATE = 3600;

// ── Categories ──────────────────────────────────────────────
export const getCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  },
  ["categories"],
  { revalidate: REVALIDATE, tags: ["categories"] },
);

export const getCategoriesWithStoreCount = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { stores: { where: { status: "APPROVED" } } } } },
    });
  },
  ["categories-with-count"],
  { revalidate: REVALIDATE, tags: ["categories", "stores"] },
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.category.findUnique({ where: { slug } });
  },
  ["category-by-slug"],
  { revalidate: REVALIDATE, tags: ["categories"] },
);

export const getCategoryWithStores = unstable_cache(
  async (slug: string) => {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        stores: {
          where: { status: "APPROVED" },
          orderBy: { rating: "desc" },
          include: { category: true },
        },
        _count: { select: { products: { where: { active: true } } } },
      },
    });
  },
  ["category-with-stores"],
  { revalidate: REVALIDATE, tags: ["categories", "stores"] },
);

// ── Stores ──────────────────────────────────────────────────
export const getApprovedStores = unstable_cache(
  async () => {
    return prisma.store.findMany({
      where: { status: "APPROVED" },
      include: { category: true, city: { select: { name: true } }, district: { select: { name: true } } },
      orderBy: { rating: "desc" },
    });
  },
  ["approved-stores"],
  { revalidate: REVALIDATE, tags: ["stores"] },
);

export const getFeaturedStores = unstable_cache(
  async () => {
    return prisma.store.findMany({
      where: { status: "APPROVED", isFeatured: true },
      take: 8,
      orderBy: { rating: "desc" },
      include: { category: true },
    });
  },
  ["featured-stores"],
  { revalidate: REVALIDATE, tags: ["stores"] },
);

export const getStoreBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.store.findUnique({
      where: { slug },
      include: {
        category: true,
        city: { select: { name: true } },
        district: { select: { name: true } },
        products: { orderBy: { createdAt: "desc" } },
      },
    });
  },
  ["store-by-slug"],
  { revalidate: REVALIDATE, tags: ["stores", "products"] },
);

// ── Products ────────────────────────────────────────────────
export const getProductsByStore = unstable_cache(
  async (storeId: string) => {
    return prisma.product.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
  },
  ["products-by-store"],
  { revalidate: REVALIDATE, tags: ["products"] },
);

// ── Reviews ────────────────────────────────────────────────
export const getReviewsByStore = unstable_cache(
  async (storeId: string) => {
    return prisma.review.findMany({
      where: { storeId, status: "VISIBLE" },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
  ["reviews-by-store"],
  { revalidate: REVALIDATE, tags: ["reviews"] },
);

// ── Popular Searches ────────────────────────────────────────
export const getPopularSearches = unstable_cache(
  async () => {
    const rows = await prisma.searchQuery.groupBy({
      by: ["query"],
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 8,
    });
    return rows.map((r) => r.query);
  },
  ["popular-searches"],
  { revalidate: REVALIDATE, tags: ["searches"] },
);

// ── Cities ──────────────────────────────────────────────────
export const getCities = unstable_cache(
  async () => {
    return prisma.city.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    });
  },
  ["cities"],
  { revalidate: REVALIDATE, tags: ["cities"] },
);
