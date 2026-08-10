import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "./prisma";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Best-effort read of the current request path for use in login redirects.
 * Next.js exposes the matched route path via the `x-invoke-path` header
 * during server rendering; returns null when unavailable so callers can
 * supply a sensible default.
 */
export function currentPath(): string | null {
  try {
    const h = headers();
    const p = h.get("x-invoke-path");
    // "/" is treated as "unknown" — protected pages never live at the root,
    // so callers should fall back to a role-appropriate default.
    return p && p !== "/" ? p : null;
  } catch {
    return null;
  }
}

/**
 * Sanitize a return path so it can only point to a local route, preventing
 * open-redirect attacks. Accepts paths starting with a single "/" and
 * rejecting scheme-relative ("//evil.com") or absolute URLs.
 */
export function safeReturnPath(path: string): string {
  if (!path) return "/";
  if (!path.startsWith("/")) return "/";
  if (path.startsWith("//")) return "/";
  if (path.startsWith("/\\")) return "/";
  return path;
}

export async function requireRole(roles: Role[], fallbackPath = "/admin") {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=" + encodeURIComponent(safeReturnPath(currentPath() || fallbackPath)));
  if (!roles.includes(user.role as Role)) redirect("/unauthorized");
  return user;
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

// Staff routes live under /admin — send unauthenticated visitors to the
// dedicated admin login instead of the public one.
export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!["ADMIN", "CONTENT_MANAGER"].includes(user.role as Role)) redirect("/unauthorized");
  return user;
}

export async function requireStoreOwner() {
  return requireRole(["STORE_OWNER", "ADMIN"], "/dashboard/store");
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
