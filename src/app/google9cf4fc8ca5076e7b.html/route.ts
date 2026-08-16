import { NextResponse } from "next/server";

// Google Search Console site-verification endpoint.
// Next.js intercepts "*.html" requests via the App Router instead of serving the
// matching file from /public, so a Route Handler is the reliable way to expose
// the verification token at the exact URL Google expects.
export async function GET() {
  return new NextResponse("google-site-verification: google9cf4fc8ca5076e7b.html", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0",
    },
  });
}
