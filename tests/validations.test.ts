import { describe, it, expect } from "vitest";
import { registerSchema, storeRegistrationSchema, productSchema, reviewSchema, searchRequestSchema } from "@/lib/validations";

describe("validations", () => {
  it("registerSchema accepts valid input", () => {
    const r = registerSchema.safeParse({ name: "Ahmad", email: "a@b.com", password: "Password1!" });
    expect(r.success).toBe(true);
  });

  it("registerSchema rejects invalid email", () => {
    const r = registerSchema.safeParse({ name: "Ahmad", email: "not-email", password: "Password1!" });
    expect(r.success).toBe(false);
  });

  it("storeRegistrationSchema accepts valid store data", () => {
    const r = storeRegistrationSchema.safeParse({
      storeName: "متجر الرمثا",
      categoryId: "cat-1",
      cityId: "city-1",
      description: "وصف",
      phone: "+962790000000",
      address: "الرمثا",
      ownerName: "Ahmad",
      ownerEmail: "a@b.com",
      ownerPassword: "Password1!",
    });
    expect(r.success).toBe(true);
  });

  it("productSchema accepts valid product", () => {
    const r = productSchema.safeParse({ name: "بطارية كيا", availability: "AVAILABLE", price: 75, active: true });
    expect(r.success).toBe(true);
  });

  it("reviewSchema validates rating range 1-5", () => {
    expect(reviewSchema.safeParse({ storeId: "s1", rating: 3, comment: "good" }).success).toBe(true);
    expect(reviewSchema.safeParse({ storeId: "s1", rating: 0, comment: "bad" }).success).toBe(false);
    expect(reviewSchema.safeParse({ storeId: "s1", rating: 6, comment: "good" }).success).toBe(false);
  });

  it("searchRequestSchema requires query", () => {
    expect(searchRequestSchema.safeParse({ query: "بطارية" }).success).toBe(true);
    expect(searchRequestSchema.safeParse({ query: "" }).success).toBe(false);
  });
});
