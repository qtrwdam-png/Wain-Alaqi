import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import "./globals.css";
import { APP_NAME } from "@/config/constants";
import { SITE_URL, SITE_NAME_AR, SITE_LOCALE, absoluteUrl } from "@/lib/site";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WebSiteSchema, OrganizationSchema } from "@/components/structured-data";
import { GoogleAnalytics } from "@/components/google-analytics";

const cairo = localFont({
  src: [
    { path: "./fonts/cairo-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/cairo-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/cairo-600.ttf", weight: "600", style: "normal" },
    { path: "./fonts/cairo-700.ttf", weight: "700", style: "normal" },
    { path: "./fonts/cairo-800.ttf", weight: "800", style: "normal" },
  ],
  display: "swap",
  variable: "--font-cairo",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME} — متاجر ومنتجات الرمثا، الأردن`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "ابحث عن المنتجات والخدمات والمتاجر في الرمثا، الأردن. اعرف السعر والتوفر والموقع ووسائل التواصل.",
  keywords: ["الرمثا", "متاجر", "منتجات", "الأردن", "وين ألاقي", "Ramtha", "دليل المتاجر"],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${APP_NAME} — متاجر ومنتجات الرمثا`,
    description: "ابحث عن المنتج أو الخدمة التي تحتاجها في الرمثا.",
    locale: SITE_LOCALE,
    type: "website",
    siteName: SITE_NAME_AR,
    url: SITE_URL,
    images: [
      {
        url: "/logo.png",
        width: 1254,
        height: 1254,
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — متاجر ومنتجات الرمثا`,
    description: "ابحث عن المنتج أو الخدمة التي تحتاجها في الرمثا.",
    images: [absoluteUrl("/logo.png")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  category: "Shopping",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1d7a40",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading a request header forces all pages to render dynamically so the
  // per-request CSP nonce (set by middleware) is injected into inline scripts.
  // Without this, statically-prerendered pages bake the HTML at build time
  // (no nonce) and CSP blocks their hydration scripts.
  await headers();
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
      </head>
      <body className={`${cairo.className} min-h-screen flex flex-col`}>
        <WebSiteSchema />
        <OrganizationSchema />
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
