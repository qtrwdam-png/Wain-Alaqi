import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Index all public content; block auth/admin/dashboard/private routes.
        // The admin panel and its secret login must NOT be indexed or discovered.
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/fayizadminlogin",
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
