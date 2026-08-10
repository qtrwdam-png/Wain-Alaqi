import { prisma } from "@/lib/prisma";
import { AdminSearchRequestsClient } from "@/components/admin-search-requests";
import { SEARCH_REQUEST_STATUS_LABELS } from "@/config/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "طلبات البحث" };

export default async function AdminSearchRequestsPage() {
  const requests = await prisma.searchRequest.findMany({ orderBy: { count: "desc" } });
  return (
    <div>
      <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">طلبات "لم أجد" ({requests.length})</h1>
      <p className="mt-1 text-gray-500">المنتجات التي بحث عنها المستخدمون ولم يجدوها.</p>
      <AdminSearchRequestsClient requests={requests.map((r) => ({ id: r.id, query: r.query, notes: r.notes, phone: r.phone, email: r.email, status: r.status, count: r.count, createdAt: r.createdAt.toISOString() }))} labels={SEARCH_REQUEST_STATUS_LABELS} />
    </div>
  );
}
