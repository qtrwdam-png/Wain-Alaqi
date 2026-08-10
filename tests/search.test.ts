import { describe, it, expect, beforeAll } from "vitest";
import { searchProducts } from "@/lib/search";
import { prisma } from "@/lib/prisma";

describe("search engine (integration with seeded DB)", () => {
  beforeAll(async () => {
    const count = await prisma.store.count();
    if (count === 0) {
      throw new Error("Database not seeded. Run `npm run db:seed` first.");
    }
  });

  it("finds product by name: بطارية كيا", async () => {
    const results = await searchProducts("بطارية كيا");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name.includes("بطارية"))).toBe(true);
  });

  it("finds product by partial text: شاحن", async () => {
    const results = await searchProducts("شاحن");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name.includes("شاحن"))).toBe(true);
  });

  it("returns empty for nonsense query", async () => {
    const results = await searchProducts("zzzznotexist12345");
    expect(results.length).toBe(0);
  });

  it("filters by category", async () => {
    const electronics = await prisma.category.findUnique({ where: { slug: "electronics" } });
    if (!electronics) return;
    const results = await searchProducts("شاحن", { categoryId: electronics.id });
    expect(results.length).toBeGreaterThan(0);
    // all results belong to electronics stores
    for (const r of results) {
      // verify store is electronics
      const store = await prisma.store.findUnique({ where: { id: r.storeId } });
      expect(store?.categoryId).toBe(electronics.id);
    }
  });

  it("sorts by price ascending", async () => {
    const results = await searchProducts("بطارية", { sort: "price_asc" });
    if (results.length > 1) {
      const prices = results.map((r) => r.price ?? Infinity);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    }
  });

  it("only returns products from APPROVED stores", async () => {
    const results = await searchProducts("بطارية كيا");
    for (const r of results) {
      const store = await prisma.store.findUnique({ where: { id: r.storeId } });
      expect(store?.status).toBe("APPROVED");
    }
  });

  it("records search query for analytics", async () => {
    const before = await prisma.searchQuery.count({ where: { query: "بطارية كيا سيراتو" } });
    await searchProducts("بطارية كيا سيراتو");
    const after = await prisma.searchQuery.count({ where: { query: "بطارية كيا سيراتو" } });
    expect(after).toBeGreaterThan(before);
  });
});
