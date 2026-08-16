import { NextResponse } from "next/server";

// Google Search Console site-verification endpoint.
// Served at /google9cf4fc8ca5076e7b.html via a rewrite in next.config.js
// (Next.js does not register route segments whose folder name contains a dot,
// and intercepts *.html requests before serving the matching /public file).
export async function GET() {
  return new NextResponse("google-site-verification: google9cf4fc8ca5076e7b.html", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0",
    },
  });
}
