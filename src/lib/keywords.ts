import { prisma } from "./prisma";
import { bustSearchesCache } from "./cache-bust";

// Fixed keywords that are ALWAYS shown on the homepage "الأكثر بحثاً" section.
// They represent common needs people search for in Ramtha and never expire.
export const PINNED_KEYWORDS = [
  "صيدلية",
  "أجهزة إلكترونية",
  "سباك",
  "خباز",
  "دهانات",
];

// Dynamic (trending) keywords auto-expire when nobody searches for them for
// this many consecutive days.
const TREND_EXPIRY_DAYS = 3;

// A keyword must be searched at least this many times before it is promoted
// to the trending list (prevents a single accidental search from surfacing).
const PROMOTION_THRESHOLD = 2;

// Minimum length for a recorded keyword. Filters out 1-char / noise queries.
const MIN_KEYWORD_LENGTH = 2;

// Patterns that are obviously automated/bot/template noise and must never be
// recorded or promoted (e.g. Googlebot probing the SearchAction JSON-LD
// template literal "{search_term_string}").
const NOISE_PATTERNS = [
  /[{}<>]/, // template / markup fragments
  /^test/i,
  /notexist/i,
  /^z+$/i, // "zzz", "zzzz"
  /^(asdf|qwerty|123+)/i,
];

function isNoise(q: string): boolean {
  const s = q.trim();
  if (s.length < MIN_KEYWORD_LENGTH) return true;
  return NOISE_PATTERNS.some((re) => re.test(s));
}

/**
 * Record a real user search so it can trend on the homepage.
 * - Ignores noise / bot / template queries entirely (never stored).
 * - Ignores queries that returned zero results (no value to surface).
 * - Upserts the PopularKeyword row: increments count, refreshes lastSearchedAt.
 *
 * Returns silently on any error — search recording is non-critical.
 */
export async function recordSearchKeyword(query: string, resultsCount: number): Promise<void> {
  const q = (query || "").trim();
  if (!q || isNoise(q)) return;
  if (resultsCount <= 0) return; // don't promote empty-result queries

  try {
    await prisma.popularKeyword.upsert({
      where: { keyword: q },
      create: { keyword: q, searchCount: 1, lastSearchedAt: new Date() },
      update: {
        searchCount: { increment: 1 },
        lastSearchedAt: new Date(),
      },
    });
    bustSearchesCache();
  } catch {
    // non-critical
  }
}

/**
 * Prune expired dynamic keywords: delete any non-pinned keyword whose
 * lastSearchedAt is older than TREND_EXPIRY_DAYS. Called lazily when we
 * fetch the trending list (cheap, bounded table).
 */
async function pruneExpired(): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - TREND_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    await prisma.popularKeyword.deleteMany({
      where: { isPinned: false, lastSearchedAt: { lt: cutoff } },
    });
  } catch {
    // non-critical
  }
}

/**
 * The homepage "الأكثر بحثاً" list:
 * 1) The pinned (fixed) keywords — always present.
 * 2) Trending dynamic keywords (searched >= PROMOTION_THRESHOLD times, and
 *    within the last TREND_EXPIRY_DAYS), ordered by searchCount desc.
 *
 * Pinned keywords keep a stable order; trending ones are appended after them.
 * The combined list is capped to a reasonable size for the homepage chips.
 */
export async function getTrendingKeywords(limit = 8): Promise<string[]> {
  try {
    await pruneExpired();
  } catch {
    // ignore prune errors, continue with what we have
  }

  let trending: string[] = [];
  try {
    const cutoff = new Date(Date.now() - TREND_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const rows = await prisma.popularKeyword.findMany({
      where: {
        isPinned: false,
        searchCount: { gte: PROMOTION_THRESHOLD },
        lastSearchedAt: { gte: cutoff },
      },
      orderBy: [{ searchCount: "desc" }, { keyword: "asc" }],
      take: limit,
    });
    trending = rows.map((r) => r.keyword);
  } catch {
    // DB unavailable — fall back to pinned only
  }

  // De-dup (case-insensitive) so a trending keyword that equals a pinned one
  // doesn't appear twice.
  const seen = new Set(PINNED_KEYWORDS.map((k) => k.toLowerCase()));
  const merged = [...PINNED_KEYWORDS];
  for (const k of trending) {
    const key = k.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(k);
    }
    if (merged.length >= limit) break;
  }

  return merged.slice(0, limit);
}

/**
 * Seed the pinned keywords into the database if they aren't there yet.
 * Safe to call repeatedly — only inserts missing pinned rows.
 */
export async function seedPinnedKeywords(): Promise<void> {
  try {
    const existing = await prisma.popularKeyword.findMany({
      where: { isPinned: true },
      select: { keyword: true },
    });
    const have = new Set(existing.map((r) => r.keyword));
    const missing = PINNED_KEYWORDS.filter((k) => !have.has(k));
    if (missing.length) {
      await prisma.popularKeyword.createMany({
        data: missing.map((k) => ({ keyword: k, isPinned: true })),
        skipDuplicates: true,
      });
    }
  } catch {
    // non-critical
  }
}
