// Helpers that build natural-language, SEO-friendly Arabic text for a store.
// The goal is to surface the store's name, owner name, category, and city in a
// human-readable sentence (NOT a keyword list) so search engines can match real
// user queries like "fayiz ramtha", "فايز محمد", "متجر الرمثا", etc.

export type StoreSeoInput = {
  name: string;
  description?: string | null;
  category?: { name: string } | null;
  city?: { name?: string | null } | null;
  district?: { name?: string | null } | null;
  owner?: { name?: string | null } | null;
  address?: string | null;
};

function pickCityName(city?: { name?: string | null } | null): string | null {
  const n = city?.name?.trim();
  return n ? n : null;
}

// Definite Arabic article prefix so we don't double it up when we write
// "لـالبرمجة" (laam + category). Returns "" if the category already starts
// with the article.
function withArabicArticle(noun: string): string {
  const n = noun.trim();
  if (n.startsWith("ال")) return `لل${n.slice(2)}`;
  return `لـ${n}`;
}

function pickOwnerName(owner?: { name?: string | null } | null): string | null {
  const n = owner?.name?.trim();
  // Avoid exposing a raw email-style or demo placeholder as an owner name.
  if (!n) return null;
  if (n.includes("@")) return null;
  return n;
}

/**
 * A short, natural intro paragraph shown on the store page right under the
 * store name. It reads like a real store owner describing their shop, weaving
 * in the store name, owner name, category and city naturally — never a stiff
 * keyword list.
 */
export function buildStoreSeoIntro(store: StoreSeoInput): string {
  const cityName = pickCityName(store.city);
  const ownerName = pickOwnerName(store.owner);
  const categoryName = store.category?.name?.trim() || null;
  const districtName = store.district?.name?.trim() || null;
  const where = [districtName, cityName].filter(Boolean).join("، ");

  // Build a natural, human sentence. Pieces drop out gracefully when missing.
  const bits: string[] = [];

  // Intro: who runs the store — only if we have a real owner name.
  if (ownerName) {
    bits.push(
      `${store.name} متجر${categoryName ? ` ${withArabicArticle(categoryName)}` : ""} في ${where || "الرمثا"}، يديره ${ownerName}.`
    );
  } else {
    bits.push(
      `${store.name} متجر${categoryName ? ` ${withArabicArticle(categoryName)}` : ""} في ${where || "الرمثا"}.`
    );
  }

  // What you'll find here — plain, useful, not a marketing slogan.
  bits.push(
    "هون بتلاقي المنتجات اللي بيعرضها مع الأسعار ومعلومات التواصل وعنوان المحل."
  );

  // Friendly close that ties the platform name in naturally.
  bits.push("إذا بتدوّر على شي من هالنوع، بتقدر تتواصل معاه مباشرة.");

  return bits.join(" ");
}

/**
 * A natural meta description for <meta name="description">. Reads like one
 * real sentence a person would write, while still carrying the store name,
 * owner, category and city for search matching.
 */
export function buildStoreSeoDescription(store: StoreSeoInput): string {
  const cityName = pickCityName(store.city);
  const ownerName = pickOwnerName(store.owner);
  const categoryName = store.category?.name?.trim() || null;
  const districtName = store.district?.name?.trim() || null;
  const where = [districtName, cityName].filter(Boolean).join("، ");

  const ownerBit = ownerName ? `، يديره ${ownerName}` : "";
  const catBit = categoryName ? ` ${withArabicArticle(categoryName)}` : "";
  const whereBit = where ? ` في ${where}` : "";

  const generated = `${store.name} متجر${catBit}${whereBit}${ownerBit}. هون بتلاقي منتجاته مع الأسعار ومعلومات التواصل والعنوان.`;
  return store.description ? `${store.description} ${generated}` : generated;
}

/**
 * A targeted <title> that front-loads the store name and includes the category
 * and city, which is what users actually search for (e.g. "Fayiz برمجة الرمثا").
 */
export function buildStoreSeoTitle(store: StoreSeoInput): string {
  const cityName = pickCityName(store.city);
  const ownerName = pickOwnerName(store.owner);
  const categoryName = store.category?.name?.trim() || null;

  const head = store.name;
  const tailParts: string[] = [];
  if (categoryName) tailParts.push(categoryName);
  if (cityName) tailParts.push(`في ${cityName}`);
  if (ownerName) tailParts.push(ownerName);

  const tail = tailParts.length ? ` — ${tailParts.join("، ")}` : "";
  return `${head}${tail}`;
}

/**
 * Alternate names / search aliases for a store, used in JSON-LD `alternateName`.
 * Includes Latin transliteration of common patterns so English queries such as
 * "fayiz ramtha" can match. We only derive from data we actually have — we do
 * not invent arbitrary keywords.
 */
export function buildStoreAlternateNames(store: StoreSeoInput): string[] {
  const names = new Set<string>();
  const cityName = pickCityName(store.city);
  const ownerName = pickOwnerName(store.owner);

  if (ownerName) names.add(ownerName);
  if (cityName) names.add(`${store.name} ${cityName}`);
  if (ownerName && cityName) names.add(`${ownerName} ${cityName}`);

  // Latin hint of the store name + city (helps "fayiz ramtha" style queries)
  const latin = toLatinHint(store.name);
  if (latin && latin !== store.name) names.add(latin);
  if (latin && cityName) {
    const latinCity = toLatinHint(cityName);
    if (latinCity) names.add(`${latin} ${latinCity}`);
  }
  if (ownerName) {
    const latinOwner = toLatinHint(ownerName);
    if (latinOwner && latinOwner !== ownerName) names.add(latinOwner);
  }

  return Array.from(names).filter(Boolean);
}

// Very small Arabic→Latin hint transliteration. Not a full transliteration
// standard — just enough to hint common search spellings (e.g. "fayiz").
function toLatinHint(input: string): string | null {
  if (!input) return null;
  const hasLatin = /[a-zA-Z]/.test(input);
  if (hasLatin) {
    // Already contains Latin — return the Latin tokens as-is.
    const latin = input.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w)).join(" ");
    return latin || null;
  }
  const map: Record<string, string> = {
    ا: "a", أ: "a", إ: "i", آ: "a", ى: "a",
    ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh",
    د: "d", ذ: "z", ر: "r", ز: "z", س: "s", ش: "sh",
    ص: "s", ض: "d", ط: "t", ظ: "z", ع: "a", غ: "gh",
    ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n",
    ه: "h", ة: "h", و: "w", ي: "y", ئ: "y", ؤ: "w",
  };
  const out = input
    .replace(/[\u064B-\u0652]/g, "") // strip harakat
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("");
  const clean = out.replace(/[^a-zA-Z\s]/g, " ").replace(/\s+/g, " ").trim();
  return clean || null;
}
