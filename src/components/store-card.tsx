import Link from "next/link";
import { Store } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { VerifiedBadge } from "./verified-badge";

type StoreCardProps = {
  store: Pick<Store, "id" | "name" | "slug" | "description" | "logo" | "coverImage" | "rating" | "reviewCount" | "address" | "verified" | "isDemo"> & {
    category?: { name: string; slug: string } | null;
  };
};

export function StoreCard({ store }: StoreCardProps) {
  return (
    <Link href={`/stores/${store.slug}`} className="card group flex flex-col overflow-hidden transition hover:shadow-card-hover">
      <div className="relative h-32 w-full bg-gradient-to-l from-brand-100 to-brand-50">
        {store.coverImage ? (
          <img src={store.coverImage} alt={store.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-brand-300">🏪</div>
        )}
        {store.isDemo && (
          <span className="absolute right-2 top-2 badge-blue">تجريبي</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900">{store.name}</h3>
          {store.verified && <VerifiedBadge />}
        </div>
        {store.category && (
          <span className="mt-0.5 text-xs text-brand-600">{store.category.name}</span>
        )}
        {store.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500">{store.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            ⭐ {store.rating > 0 ? store.rating.toFixed(1) : "—"} ({store.reviewCount})
          </span>
          {store.address && <span className="truncate">📍 {store.address}</span>}
        </div>
      </div>
    </Link>
  );
}
