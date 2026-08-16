import { prisma } from "./prisma";
import { bustSearchesCache } from "./cache-bust";

export type SearchFilters = {
  categoryId?: string;
  cityId?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: string;
  lat?: number;
  lng?: number;
  sort?: "relevance" | "price_asc" | "price_desc" | "nearest" | "rating" | "recent";
};

export type SearchResult = {
  id: string;
  type: "product";
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  availability: string;
  image: string | null;
  lastStockUpdate: Date;
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeVerified: boolean;
  storeRating: number;
  storePhone: string | null;
  storeWhatsapp: string | null;
  storeLatitude: number | null;
  storeLongitude: number | null;
  categoryId: string | null;
  distance: number | null;
  score: number;
};

/**
 * Arabic-aware search: splits on whitespace, supports partial and
 * per-word matching. Products from approved stores only.
 */
export async function searchProducts(query: string, filters: SearchFilters = {}) {
  const q = query.trim();
  if (!q) return [];

  const tokens = q.split(/\s+/).filter(Boolean);

  const where = {
    active: true,
    store: {
      status: "APPROVED" as const,
      ...(filters.cityId ? { cityId: filters.cityId } : {}),
    },
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.availability ? { availability: filters.availability as any } : {}),
    ...(filters.minPrice != null || filters.maxPrice != null
      ? {
          price: {
            ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
    OR: tokens.flatMap((t) => [
      { name: { contains: t, mode: "insensitive" as const } },
      { description: { contains: t, mode: "insensitive" as const } },
      { store: { name: { contains: t, mode: "insensitive" as const } } },
    ]),
  };

  const products = await prisma.product.findMany({
    where,
    include: {
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          verified: true,
          rating: true,
          phone: true,
          whatsapp: true,
          latitude: true,
          longitude: true,
          cityId: true,
        },
      },
    },
    take: 200,
  });

  let results: SearchResult[] = products.map((p) => {
    let score = 0;
    const nameLower = p.name.toLowerCase();
    const descLower = (p.description || "").toLowerCase();
    for (const t of tokens) {
      const tl = t.toLowerCase();
      if (nameLower === tl) score += 100;
      if (nameLower.startsWith(tl)) score += 50;
      if (nameLower.includes(tl)) score += 30;
      if (descLower.includes(tl)) score += 10;
    }
    if (p.availability === "AVAILABLE") score += 20;
    if (p.store.verified) score += 15;
    if (p.store.rating > 0) score += p.store.rating * 4;

    let distance: number | null = null;
    if (filters.lat != null && filters.lng != null && p.store.latitude && p.store.longitude) {
      const R = 6371;
      const toRad = (d: number) => (d * Math.PI) / 180;
      const dLat = toRad(p.store.latitude - filters.lat);
      const dLon = toRad(p.store.longitude - filters.lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(filters.lat)) *
          Math.cos(toRad(p.store.latitude)) *
          Math.sin(dLon / 2) ** 2;
      distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    return {
      id: p.id,
      type: "product" as const,
      name: p.name,
      description: p.description,
      price: p.price,
      currency: p.currency,
      availability: p.availability,
      image: p.image,
      lastStockUpdate: p.lastStockUpdate,
      storeId: p.store.id,
      storeName: p.store.name,
      storeSlug: p.store.slug,
      storeVerified: p.store.verified,
      storeRating: p.store.rating,
      storePhone: p.store.phone,
      storeWhatsapp: p.store.whatsapp,
      storeLatitude: p.store.latitude,
      storeLongitude: p.store.longitude,
      categoryId: p.categoryId,
      distance,
      score,
    };
  });

  // sort
  const sort = filters.sort || "relevance";
  results.sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return (a.price ?? Infinity) - (b.price ?? Infinity);
      case "price_desc":
        return (b.price ?? -Infinity) - (a.price ?? -Infinity);
      case "nearest":
        return (a.distance ?? Infinity) - (b.distance ?? Infinity);
      case "rating":
        return b.storeRating - a.storeRating;
      case "recent":
        return +new Date(b.lastStockUpdate) - +new Date(a.lastStockUpdate);
      default:
        return b.score - a.score || b.storeRating - a.storeRating;
    }
  });

  // record search query for analytics
  try {
    await prisma.searchQuery.create({
      data: {
        query: q,
        cityId: filters.cityId,
        results: results.length,
      },
    });
    // Bust popular searches cache so the new query trends on the homepage
    bustSearchesCache();
  } catch {
    // non-critical
  }

  return results;
}
