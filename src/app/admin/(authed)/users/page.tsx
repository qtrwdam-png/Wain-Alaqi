import { prisma } from "@/lib/prisma";
import { AdminUsersClient } from "@/components/admin-users";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة المستخدمين" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, phone: true, role: true, active: true, isDemo: true, createdAt: true, _count: { select: { stores: true } } },
  });
  return (
    <div>
      <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">إدارة المستخدمين ({users.length})</h1>
      <AdminUsersClient users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))} />
    </div>
  );
}
