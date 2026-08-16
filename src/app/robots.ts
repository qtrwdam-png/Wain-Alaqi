import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://test-web-production-b6f1.up.railway.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Index all public content; block auth/admin/dashboard/private routes.
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/account/",
          "/login",
          "/register",
          "/unauthorized",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
