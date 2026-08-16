import { revalidateTag, revalidatePath } from "next/cache";

/**
 * Centralized cache-busting helpers.
 *
 * Call these after any mutation (create/update/delete) so the cached
 * public pages rebuild with fresh data on the next request.
 */

export function bustStoresCache(slug?: string) {
  revalidateTag("stores");
  revalidateTag("featured-stores");
  revalidateTag("approved-stores");
  revalidateTag("store-by-slug");
  revalidatePath("/");
  revalidatePath("/stores");
  if (slug) revalidatePath(`/stores/${slug}`);
}

export function bustProductsCache(slug?: string) {
  revalidateTag("products");
  revalidateTag("products-by-store");
  revalidateTag("store-by-slug");
  revalidatePath("/stores");
  if (slug) revalidatePath(`/stores/${slug}`);
}

export function bustCategoriesCache(slug?: string) {
  revalidateTag("categories");
  revalidateTag("categories-with-count");
  revalidateTag("category-by-slug");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/stores");
  if (slug) revalidatePath(`/categories/${slug}`);
}

export function bustReviewsCache(slug?: string) {
  revalidateTag("reviews");
  revalidateTag("reviews-by-store");
  if (slug) revalidatePath(`/stores/${slug}`);
}

export function bustCitiesCache() {
  revalidateTag("cities");
  revalidatePath("/add-store");
  revalidatePath("/dashboard/store/settings");
  revalidatePath("/");
}

export function bustSearchesCache() {
  revalidateTag("searches");
  revalidateTag("popular-searches");
  revalidatePath("/");
}
