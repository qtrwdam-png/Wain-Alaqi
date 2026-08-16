import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Index all public content; block auth/admin/dashboard/private routes.
        // The admin panel (incl. /admin/login) must NOT be indexed.
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/admin/login",
          "/dashboard/",
          "/account/",
          "/login",
          "/register",
          "/unauthorized",
          "/search",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
