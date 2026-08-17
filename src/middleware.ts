import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, getClientId, ruleForPath, RATE_RULES } from "@/lib/rate-limit";

// Run middleware on all dynamic paths (pages AND API routes) so we can apply
// rate limiting to API routes. CSP is applied to pages only (inside the
// function). Static assets and image optimization are skipped.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Rate limiting for API routes ---
  if (pathname.startsWith("/api/")) {
    const ruleKey = ruleForPath(pathname, request.method);
    if (ruleKey) {
      const rule = RATE_RULES[ruleKey];
      const id = getClientId(request);
      const rl = rateLimit(`${ruleKey}:${id}`, rule.limit, rule.windowMs);
      if (!rl.success) {
        const retryAfter = Math.max(1, Math.ceil(rl.retryAfterMs / 1000));
        return NextResponse.json(
          { error: "طلبات كثيرة جداً. حاول مرة أخرى بعد قليل." },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfter),
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      }
    }
    // No CSP on API routes.
    return NextResponse.next();
  }

  // --- CSP for pages ---
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const isDev = process.env.NODE_ENV !== "production";

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "https://www.googletagmanager.com",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(" ");

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self' https://nominatim.openstreetmap.org https://overpass-api.de https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  // Forward the CSP on the request so Next.js's App Router reads the nonce from it
  // and injects it into its inline hydration/RSC scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", csp);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Enforce the CSP on the outgoing response for the browser.
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}
