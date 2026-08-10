import { prisma } from "@/lib/prisma";
import { AdminReviewsClient } from "@/components/admin-reviews";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة التقييمات" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { store: { select: { name: true, slug: true } }, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">إدارة التقييمات ({reviews.length})</h1>
      <AdminReviewsClient reviews={reviews.map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, status: r.status, storeName: r.store.name, storeSlug: r.store.slug, userName: r.user.name, createdAt: r.createdAt.toISOString() }))} />
    </div>
  );
}
