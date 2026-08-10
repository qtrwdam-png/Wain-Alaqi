import { NextResponse } from "next/server";
import { searchProducts, SearchFilters } from "@/lib/search";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const filters: SearchFilters = {
    categoryId: searchParams.get("cat") || undefined,
    sort: (searchParams.get("sort") as SearchFilters["sort"]) || undefined,
    minPrice: searchParams.get("min") ? Number(searchParams.get("min")) : undefined,
    maxPrice: searchParams.get("max") ? Number(searchParams.get("max")) : undefined,
    availability: searchParams.get("avail") || undefined,
    lat: searchParams.get("lat") ? Number(searchParams.get("lat")) : undefined,
    lng: searchParams.get("lng") ? Number(searchParams.get("lng")) : undefined,
    cityId: searchParams.get("city") || undefined,
  };
  try {
    const results = await searchProducts(q, filters);
    return NextResponse.json({ query: q, count: results.length, results });
  } catch (error) {
    console.error("[/api/search] DB error:", error);
    return NextResponse.json({ query: q, count: 0, results: [] }, { status: 200 });
  }
}
