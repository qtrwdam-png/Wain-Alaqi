// In-memory sliding-window rate limiter for a single-instance deployment.
// No external store (Redis/Upstash) required — works on a single Railway
// replica. If the app is scaled to multiple replicas later, replace this
// with @upstash/ratelimit + Redis so limits are shared across instances.

type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();

// Garbage-collect idle buckets every GC_INTERVAL to bound memory.
const GC_INTERVAL = 60_000;
let lastGc = Date.now();

function gc(now: number, windowMs: number) {
  if (now - lastGc < GC_INTERVAL) return;
  lastGc = now;
  const cutoff = now - windowMs;
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => t > cutoff);
    if (bucket.hits.length === 0) buckets.delete(key);
  }
}

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  /** ms until the oldest hit in the window expires (Retry-After hint) */
  retryAfterMs: number;
};

/**
 * Check the rate limit for an identifier within a sliding window.
 *
 * @param key      unique identifier (e.g. `${route}:${ip}`)
 * @param limit    max requests allowed in the window
 * @param windowMs window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  gc(now, windowMs);

  const bucket = buckets.get(key) ?? { hits: [] };
  const cutoff = now - windowMs;
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    buckets.set(key, bucket);
    return { success: false, remaining: 0, retryAfterMs: oldest + windowMs - now };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { success: true, remaining: limit - bucket.hits.length, retryAfterMs: 0 };
}

/** Extract a best-effort client identifier from request headers. */
export function getClientId(req: Request | { headers: Headers }): string {
  const headers = "headers" in req ? req.headers : (req as { headers: Headers }).headers;
  // Trust the first IP in the chain (Railway/CDN sets these). Fall back to a
  // shared "anonymous" bucket if no IP header is present (rare in prod).
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "anonymous";
}

/**
 * Per-route rate-limit rules. Keep limits generous for legitimate users but
 * tight enough to stop abuse. Times are in milliseconds.
 */
export const RATE_RULES = {
  // Search is the heaviest DB operation — allow 20 searches per 10s per IP.
  search: { limit: 20, windowMs: 10_000 },
  // Login brute-force protection — 10 attempts per 10s per IP.
  login: { limit: 10, windowMs: 10_000 },
  // Account/store/review creation — 5 per 10s per IP.
  write: { limit: 5, windowMs: 10_000 },
  // Generic API (everything else) — 60 per 10s per IP.
  api: { limit: 60, windowMs: 10_000 },
} as const;

/**
 * Match a request path (+ method) to a rate-limit rule, or null if not
 * rate-limited. The strict "login" rule only applies to the credentials
 * callback POST (brute-force protection); other NextAuth endpoints
 * (session/csrf/providers GETs fired on every page nav) use the generous
 * generic "api" rule so normal browsing isn't throttled.
 */
export function ruleForPath(pathname: string, method: string): keyof typeof RATE_RULES | null {
  if (pathname.startsWith("/api/auth/")) {
    // NextAuth credentials callback is a POST to /api/auth/callback/credentials
    if (pathname.endsWith("/callback/credentials") && method === "POST") return "login";
    return "api"; // session/csrf/providers — generous
  }
  if (pathname.startsWith("/api/search")) return "search";
  if (
    method === "POST" &&
    (pathname === "/api/auth/register" ||
      pathname === "/api/stores/register" ||
      pathname === "/api/reviews" ||
      pathname === "/api/search-requests" ||
      pathname === "/api/upload")
  )
    return "write";
  if (pathname.startsWith("/api/")) return "api";
  return null;
}
