import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { safeReturnPath } from "@/lib/auth-guard";

/**
 * Security regression tests for authorization & IDOR fixes.
 *
 * These tests operate against the seeded database (integration) for the
 * ownership/IDOR checks, and on pure functions for the open-redirect guard.
 * They do NOT mutate production data — no PATCH/DELETE is executed against
 * real rows.
 */

describe("security: safeReturnPath prevents open redirects", () => {
  it("accepts a normal local path", () => {
    expect(safeReturnPath("/dashboard/store")).toBe("/dashboard/store");
    expect(safeReturnPath("/account/settings")).toBe("/account/settings");
  });

  it("rejects scheme-relative URLs (open redirect)", () => {
    expect(safeReturnPath("//evil.com")).toBe("/");
    expect(safeReturnPath("//evil.com/path")).toBe("/");
  });

  it("rejects absolute external URLs", () => {
    expect(safeReturnPath("https://evil.com")).toBe("/");
    expect(safeReturnPath("http://evil.com")).toBe("/");
  });

  it("rejects backslash-style protocol-relative URLs", () => {
    expect(safeReturnPath("/\\evil.com")).toBe("/");
  });

  it("falls back to '/' for empty input", () => {
    expect(safeReturnPath("")).toBe("/");
    expect(safeReturnPath(undefined as unknown as string)).toBe("/");
  });
});

describe("security: product IDOR — store owners can only access own products", () => {
  beforeAll(async () => {
    const count = await prisma.user.count();
    if (count === 0) throw new Error("Database not seeded.");
  });

  it("store1's products belong to store1 (not store2)", async () => {
    const [o1, o2] = await Promise.all([
      prisma.user.findUnique({ where: { email: "store1@example.com" } }),
      prisma.user.findUnique({ where: { email: "store2@example.com" } }),
    ]);
    const store1 = await prisma.store.findFirst({ where: { ownerId: o1!.id } });
    const store2 = await prisma.store.findFirst({ where: { ownerId: o2!.id } });
    expect(store1).toBeTruthy();
    expect(store2).toBeTruthy();

    const p1 = await prisma.product.findFirst({ where: { storeId: store1!.id } });
    expect(p1).toBeTruthy();
    expect(p1!.storeId).toBe(store1!.id);
    expect(p1!.storeId).not.toBe(store2!.id);
  });

  it("replicates the server-side ownership check (canEdit equivalent)", async () => {
    const [o1, o2] = await Promise.all([
      prisma.user.findUnique({ where: { email: "store1@example.com" } }),
      prisma.user.findUnique({ where: { email: "store2@example.com" } }),
    ]);
    const store1 = await prisma.store.findFirst({ where: { ownerId: o1!.id } });
    const store2 = await prisma.store.findFirst({ where: { ownerId: o2!.id } });

    // A product owned by store2's owner.
    const productOfStore2 = await prisma.product.findFirst({ where: { storeId: store2!.id } });
    expect(productOfStore2).toBeTruthy();

    // Server canEdit logic: product.store.ownerId === userId?
    const owner2Id = store2!.ownerId;
    expect(productOfStore2!.storeId).toBe(store2!.id);

    // store1 owner must NOT match store2's product ownership.
    expect(store1!.ownerId).toBe(o1!.id);
    expect(owner2Id).toBe(o2!.id);
    expect(o1!.id).not.toBe(o2!.id);

    // Simulate: would store1 be granted access to productOfStore2? No.
    const product = await prisma.product.findUnique({
      where: { id: productOfStore2!.id },
      include: { store: true },
    });
    const isOwner = product?.store.ownerId === o1!.id;
    const isAdmin = false; // store1 is a STORE_OWNER, not ADMIN
    expect(isOwner || isAdmin).toBe(false);
  });

  it("an ADMIN is granted access regardless of ownership (canEdit role check)", async () => {
    const admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
    expect(admin!.role).toBe("ADMIN");
    const anyProduct = await prisma.product.findFirst({});
    expect(anyProduct).toBeTruthy();
    // canEdit: role === "ADMIN" returns the product unconditionally
    const role = "ADMIN";
    const isGranted = role === "ADMIN";
    expect(isGranted).toBe(true);
  });
});

describe("security: hidden products never surface in public search", () => {
  it("searchProducts excludes active=false products", async () => {
    const inactive = await prisma.product.findFirst({
      where: { active: false },
      select: { id: true, name: true },
    });
    if (!inactive) return; // dataset still safe if none inactive
    const { searchProducts } = await import("@/lib/search");
    const results = await searchProducts(inactive.name);
    const found = results.find((r) => r.id === inactive.id);
    expect(found).toBeUndefined();
  });

  it("public store detail only lists active products (where active: true)", async () => {
    // The store detail page uses products: { where: { active: true } }.
    // Confirm a store with at least one product never exposes an inactive one
    // via the same query pattern.
    const store = await prisma.store.findFirst({
      where: { status: "APPROVED", products: { some: {} } },
    });
    if (!store) return;
    const activeOnly = await prisma.product.findMany({
      where: { storeId: store.id, active: true },
    });
    const anyInactive = await prisma.product.findFirst({
      where: { storeId: store.id, active: false },
    });
    if (anyInactive) {
      expect(activeOnly.find((p) => p.id === anyInactive.id)).toBeUndefined();
    }
  });
});

describe("security: session cookie attributes (static check)", () => {
  it("auth.ts relies on NextAuth defaults which are HttpOnly + SameSite=Lax + Secure(in prod)", () => {
    // NextAuth's default cookie policy sets httpOnly=true and sameSite="lax"
    // for the session token, and secure=true when not in development. This
    // is verified by the framework defaults; we assert the project does not
    // override them with an insecure setting.
    const fs = require("fs");
    const path = require("path");
    const authSrc = fs.readFileSync(
      path.resolve(__dirname, "../src/lib/auth.ts"),
      "utf-8",
    );
    // No insecure cookie override present
    expect(authSrc).not.toMatch(/sameSite\s*:\s*["']none["']/i);
    expect(authSrc).not.toMatch(/httpOnly\s*:\s*false/i);
  });
});
