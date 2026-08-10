import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireRole(roles: Role[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=" + encodeURIComponent("/admin"));
  if (!roles.includes(user.role as Role)) redirect("/unauthorized");
  return user;
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

export async function requireStaff() {
  return requireRole(["ADMIN", "CONTENT_MANAGER"]);
}

export async function requireStoreOwner() {
  return requireRole(["STORE_OWNER", "ADMIN"]);
}

export async function getOwnedStore(userId: string) {
  return prisma.store.findFirst({
    where: { ownerId: userId },
  });
}

export async function requireOwnedStore(storeId: string, userId: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return null;
  if (store.ownerId !== userId && (await getCurrentUser())?.role !== "ADMIN") {
    return null;
  }
  return store;
}
