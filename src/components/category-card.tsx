import Link from "next/link";
import { Category } from "@prisma/client";

export function CategoryCard({ category }: { category: Pick<Category, "id" | "name" | "slug" | "icon" | "image" | "description"> }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="card group flex flex-col items-center justify-center p-4 text-center transition hover:shadow-card-hover sm:p-5"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-xl text-brand-600 transition group-hover:bg-brand-100 sm:h-14 sm:w-14 sm:text-2xl">
        {category.icon || "🏷️"}
      </div>
      <h3 className="mt-3 text-sm font-bold text-gray-900 sm:text-base">{category.name}</h3>
      {category.description && (
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{category.description}</p>
      )}
    </Link>
  );
}
