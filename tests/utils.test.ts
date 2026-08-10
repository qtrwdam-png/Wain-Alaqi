import { describe, it, expect } from "vitest";
import { slugify, formatPrice, formatDistance, timeAgo, haversineDistance } from "@/lib/utils";

describe("utils", () => {
  it("slugify converts text to url-safe slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("  Multiple   Spaces  ")).toBe("multiple-spaces");
  });

  it("slugify preserves arabic characters", () => {
    expect(slugify("متجر الرمثا")).toBe("متجر-الرمثا");
  });

  it("formatPrice formats with JOD currency", () => {
    const result = formatPrice(12.5);
    expect(result).toMatch(/12.50|١٢.50|١٢٫٥٠/);
    expect(result).toContain("د.أ");
  });

  it("formatPrice returns dash for null", () => {
    expect(formatPrice(null)).toBe("—");
    expect(formatPrice(undefined)).toBe("—");
  });

  it("formatDistance formats meters for small distances", () => {
    expect(formatDistance(0.5)).toBe("500 م");
  });

  it("formatDistance formats km for large distances", () => {
    expect(formatDistance(2.5)).toBe("2.5 كم");
  });

  it("haversineDistance calculates distance correctly", () => {
    const d = haversineDistance(32.5569, 36.0069, 32.5579, 36.0079);
    expect(d).toBeGreaterThan(0.1);
    expect(d).toBeLessThan(1);
  });

  it("haversineDistance returns 0 for same point", () => {
    expect(haversineDistance(32.5, 36.0, 32.5, 36.0)).toBe(0);
  });

  it("timeAgo returns now for recent", () => {
    expect(timeAgo(new Date())).toBe("الآن");
  });
});
