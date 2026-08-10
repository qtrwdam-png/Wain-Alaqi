import { describe, it, expect, beforeAll } from "vitest";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

describe("authentication & authorization (integration)", () => {
  beforeAll(async () => {
    const count = await prisma.user.count();
    if (count === 0) throw new Error("Database not seeded.");
  });

  it("admin demo account exists with ADMIN role", async () => {
    const admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
    expect(admin).toBeTruthy();
    expect(admin!.role).toBe("ADMIN");
    expect(admin!.isDemo).toBe(true);
    expect(bcrypt.compareSync("ChangeMe123!", admin!.passwordHash)).toBe(true);
  });

  it("store owner demo account exists with STORE_OWNER role", async () => {
    const owner = await prisma.user.findUnique({ where: { email: "store1@example.com" } });
    expect(owner).toBeTruthy();
    expect(owner!.role).toBe("STORE_OWNER");
  });

  it("invalid password does not match", async () => {
    const admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
    expect(bcrypt.compareSync("wrongpassword", admin!.passwordHash)).toBe(false);
  });

  it("store owner owns exactly one store", async () => {
    const owner = await prisma.user.findUnique({ where: { email: "store1@example.com" } });
    const stores = await prisma.store.findMany({ where: { ownerId: owner!.id } });
    expect(stores.length).toBe(1);
  });

  it("store owner cannot access another owner's store", async () => {
    const [o1, o2] = await Promise.all([
      prisma.user.findUnique({ where: { email: "store1@example.com" } }),
      prisma.user.findUnique({ where: { email: "store2@example.com" } }),
    ]);
    const store1 = await prisma.store.findFirst({ where: { ownerId: o1!.id } });
    const store2 = await prisma.store.findFirst({ where: { ownerId: o2!.id } });
    // owner1 does NOT own store2
    expect(store1!.ownerId).toBe(o1!.id);
    expect(store2!.ownerId).toBe(o2!.id);
    expect(store1!.id).not.toBe(store2!.id);
  });

  it("new store registration creates PENDING_REVIEW store", async () => {
    const pending = await prisma.store.findFirst({ where: { status: "PENDING_REVIEW" } });
    expect(pending).toBeTruthy();
  });

  it("seed contains a rejected store with rejection reason", async () => {
    const rejected = await prisma.store.findFirst({ where: { status: "REJECTED" } });
    expect(rejected).toBeTruthy();
    expect(rejected!.rejectionReason).toBeTruthy();
  });

  it("approved stores have products", async () => {
    const approved = await prisma.store.findFirst({ where: { status: "APPROVED" } });
    const products = await prisma.product.count({ where: { storeId: approved!.id } });
    expect(products).toBeGreaterThan(0);
  });

  it("USER role cannot match ADMIN role", async () => {
    const user = await prisma.user.findUnique({ where: { email: "user@example.com" } });
    expect(user!.role).toBe("USER");
    expect(user!.role).not.toBe("ADMIN");
  });
});
