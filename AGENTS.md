# Wain Alaqi — Project Memory

## Project Overview
Arabic RTL local marketplace for Ramtha, Jordan. Users search for products/services and find stores with price/availability/location/contact.

## Tech Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS (RTL)
- PostgreSQL + Prisma ORM
- NextAuth.js (Credentials, bcrypt) — roles: USER, STORE_OWNER, ADMIN, CONTENT_MANAGER
- Leaflet/OpenStreetMap (no API key)
- Vitest + jsdom for tests

## Key Commands
```bash
npm run dev              # dev server (port 3000)
npm run build            # production build
npm run lint             # eslint
npm run test             # vitest
npm run db:generate      # prisma generate
npm run db:migrate:dev   # create/apply migrations
npm run db:seed          # seed demo data
npm run db:studio        # prisma studio
```

## Important Patterns Learned
- **Arabic URL params:** Next.js dynamic route params (`[slug]`) arrive URL-encoded for Arabic slugs. Use `decodeURIComponent(params.slug)` in pages that look up by slug (e.g. `src/app/stores/[slug]/page.tsx`). English slugs (like `/categories/auto-parts`) work without decoding.
- **Label constants** live in `src/config/constants.ts` (AVAILABILITY_LABELS, STORE_STATUS_LABELS, ROLE_LABELS, etc.), NOT in `src/lib/utils.ts`. Don't import labels from utils.
- **Content (CMS) keys** are snake_case (`home_hero`, `home_banner`, `footer`, `about`, `faq`, `contact`, `popular_searches`) matching defaults in `src/lib/content.ts`.
- **`useSearchParams()`** in client pages must be wrapped in a `<Suspense>` boundary or the page fails static prerender during build. Pattern: extract form into a child component, wrap with Suspense in the default export.
- **Search engine** (`src/lib/search.ts`): products from APPROVED stores only; records each query to `SearchQuery` for analytics. Tests in `tests/search.test.ts` are integration tests requiring a seeded DB.

## Database
- DATABASE_URL is in `.env` (gitignored). Connection: Neon PostgreSQL.
- Seed creates: 1 city, 10 categories, 36 stores, 201 products, 10 reviews, 38 users. All demo rows have `is_demo = true`.
- Demo accounts: admin@example.com / store1@example.com / user@example.com — all password `ChangeMe123!`

## GitHub
- Repo: alwtnyaldm-glitch/test-web
- PR #1: https://github.com/alwtnyaldm-glitch/test-web/pull/1 (branch: feat/wain-alaqi-marketplace)

## Decisions Documented
- Next.js Route Handlers instead of separate backend (simpler Vercel/Render deploy)
- NextAuth Credentials provider (suitable for local platform; OAuth can be added later)
- Leaflet/OpenStreetMap (free, no API key in dev)

## Auth & Routing Architecture (role-based)
- **Role-based login redirect:** `src/app/login/page.tsx` calls `getSession()` after `signIn()` and routes by role: ADMIN → `/admin`, STORE_OWNER → `/dashboard/store`, USER → `/account`. A `from` query param overrides for deep links.
- **JWT session role must re-read from DB (`src/lib/auth.ts`):** the `jwt` callback re-fetches the user's `role` from the DB on every call (not just at sign-in). This is critical because role changes happen via API (e.g. `POST /api/stores/register` promotes USER → STORE_OWNER inside a transaction) — without re-reading, the JWT stays frozen at the sign-in role and `requireStoreOwner()` sees the stale `USER` role, blocking access to `/dashboard/store` (redirects to `/unauthorized`). The `/add-store` page also calls `useSession().update({})` after successful store registration to refresh the client session immediately. Symptom reported by user: "registered as store owner from phone but can't see products/add product/store settings navigation." Root cause: session JWT said `USER` even though DB said `STORE_OWNER`.
- **Dedicated admin login:** `/admin/login` is a public page (outside the protected route group) that refuses non-staff accounts by signing them out. Unauthenticated visitors hitting `/admin/*` are redirected to `/admin/login` via `requireStaff()` in `auth-guard.ts`.
- **Route group for protected admin:** All admin pages live under `src/app/admin/(authed)/` with a layout that calls `requireStaff()` (ADMIN + CONTENT_MANAGER). The root `src/app/admin/layout.tsx` is just a shell wrapper (no guard) so `/admin/login` renders without auth. Route groups `(name)` don't affect the URL.
- **No public admin creation:** `/api/auth/register` always sets role `USER`; `registerSchema` (zod) has no `role` field so any submitted role is dropped. Staff accounts are created only by an ADMIN via `/api/admin/users` POST (zod-validated to ADMIN/CONTENT_MANAGER).
- **Store registration flow:** `/api/stores/register` blocks staff (ADMIN/CONTENT_MANAGER) from self-registering a store, limits one store per owner, and promotes USER → STORE_OWNER inside a transaction. `/add-store` shows a clear notice to USER accounts that they'll become a store owner, and redirects staff to the admin panel.
- **Header role awareness:** `src/components/site-header.tsx` shows role-specific shortcuts — store owners get «لوحة المتجر», staff get «لوحة الإدارة», users get «حسابي» + «أضف متجرك».
- **User account home:** `src/app/account/page.tsx` is a role-aware landing showing shortcuts and recent activity (reviews, search requests). Replaces sending users to `/account/settings` directly after login.
- **Prisma client URL safety:** `src/lib/prisma.ts` uses `buildDatabaseUrl()` with a fallback so `next build` doesn't crash when `DATABASE_URL` is absent (dynamic pages don't execute at build, but the client is constructed at import time).

## Server-side Auth Guard Pattern (for protected pages)
- **Use `getCurrentUser()` from `@/lib/auth-guard`** in server components to check authentication and redirect unauthenticated visitors server-side — no client "loading" flicker. Pattern: `const user = await getCurrentUser(); if (!user) redirect("/login?from=/path");`
- **Split interactive pages:** a server component page fetches data (Prisma) and guards auth, then renders a `"use client"` child component that receives the data as props. Example: `src/app/account/settings/page.tsx` (server) + `src/components/account-settings-form.tsx` (client).
- **Avoid `useSession()` + `useEffect` redirect** for protected pages — the `status === "loading"` state can hang indefinitely (session provider not hydrating), leaving the page stuck on "جارٍ التحميل…". Server-side `redirect()` is instantaneous and SEO-safe.
- **Server `redirect()` returns HTTP 307** (temporary redirect) with a `Location` header — verified via `curl -I`.

## Category Icons (SVG, not emoji)
- **Use `CategoryIcon` component** (`src/components/category-icon.tsx`) for ALL category icon rendering — it maps category `slug` → inline SVG path. Emoji rendered server-side can show as tofu boxes (□) on systems lacking color-emoji fonts.
- **Three pages must use it:** home (`category-card.tsx`), `/categories` listing (`categories/page.tsx`), and `/categories/[slug]` (category detail). Do NOT use `category.icon` (emoji string) directly in JSX.
- The admin categories table (`admin-categories.tsx`) still renders emoji for the admin UI only — out of scope for the public-facing fix.

## Search Request → User Linking
- **`POST /api/search-requests`** reads the session via `getServerSession(authOptions)` and links `userId` when authenticated. Anonymous requests save `userId = null` (still accepted).
- **`/account` page** displays the user's search requests with `notes` and `status` (using `SEARCH_REQUEST_STATUS_LABELS` from constants). Requests are scoped to the logged-in user only — other users cannot see them.

## DB Performance (High-Traffic)
- **Indexes added:** `@@index([userId])` on `Review` and `SearchRequest` models in `prisma/schema.prisma`. Applied via `prisma db push`. Railway `entrypoint.sh` runs `prisma db push` on deploy so indexes auto-apply.
- These indexes support the common query patterns: fetching a user's reviews / search requests on `/account`.

## Responsive Design (Mobile/Tablet/Desktop)
- **Breakpoint strategy:** `lg` (1024px) is the single switch point for dashboard layouts — below it everything stacks single-column (mobile/tablet portrait), at/above it the two-column sidebar layout appears (desktop/tablet landscape). This matches iPad: portrait = stacked, landscape = sidebar.
- **Responsive tables (`.responsive-table` in globals.css):** Admin tables (`/admin/stores`, `/admin/products`) use `<div className="responsive-table"><table>` with `data-label="عمود"` on each `<td>`. Above 1024px it renders a normal table; below it renders stacked cards where each cell shows its column name via `td::before { content: attr(data-label) }`. Use `data-label=""` on action-only cells to hide the label. Do NOT use the old `.table-wrap` (forces `min-width: 600px` → horizontal scroll) on admin data tables.
- **Two-sidebar pattern (admin-sidebar.tsx, store-sidebar.tsx):** render TWO `<aside>` elements — a mobile one (`lg:hidden`, horizontal scrollable nav) and a desktop one (`hidden lg:block lg:sticky`, vertical). CRITICAL: the desktop aside MUST start with `hidden` so it's `display:none` below `lg`; `lg:block` only flips it on at ≥1024px. Forgetting `hidden` causes BOTH sidebars to render simultaneously on mobile (duplicate nav).
- **Horizontal action cards:** avoid bare `flex items-center justify-between` for rows containing a label + button — long text overflows on mobile. Use `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` with `min-w-0` on the text container and `shrink-0` on the button. Applied in admin dashboard pending-stores, store dashboard recent products, and admin store-detail product list.
- **Stat grids:** `grid grid-cols-2 gap-4 lg:grid-cols-4` works well — 2 columns on phone, 4 on desktop.
- **Form grids:** pair related fields with `grid gap-4 sm:grid-cols-2` (price/availability, phone/whatsapp, logo/cover). Full-width fields (description, address) stay single-column.
- **Verified responsive pages:** home, /search, /stores/[slug], /categories, /map, /add-store, /account, /account/settings, /admin/* (dashboard, stores, stores/[id], products, users, reviews, search-requests, categories, store-owners, content), /dashboard/store/* (home, products, products/[id], products/new, settings). `next build`, `next lint`, and `vitest` (35 tests) all pass after responsive changes.

## Google Search Console Verification + Sitemap + Robots (SEO)
- **Google site-verification file** (`google9cf4fc8ca5076e7b.html`): placed in `public/` (conventional) AND served via an API route `src/app/api/google-verification/route.ts` + a rewrite in `next.config.js` mapping `/google9cf4fc8ca5076e7b.html` → `/api/google-verification`. **Why both:** Next.js App Router intercepts `*.html` requests before serving the matching file from `public/` (verified: `logo.png` from `public/` returns HTTP 200, but `*.html` from `public/` returns 404). Route-handler folder names cannot contain a dot either, so the file-as-route approach also failed. The API route + rewrite is the only reliable method.
- **Sitemap:** `src/app/sitemap.ts` (Next.js convention → auto-generates `/sitemap.xml`). Includes static public pages + dynamic entries for active categories and APPROVED stores. Falls back to the Railway prod URL when `NEXT_PUBLIC_APP_URL` is unset. DB queries are wrapped in try/catch so the sitemap still renders (static-only) if the DB is unreachable at request time.
- **Robots:** `src/app/robots.ts` (Next.js convention → auto-generates `/robots.txt`). Allows all crawlers on `/`, disallows `/admin/` (incl. `/admin/login`), `/dashboard/`, `/account/`, `/login`, `/register`, `/unauthorized`, `/search` (noindex — query results), `/api/`. Declares the sitemap URL + host.

## SEO — Structured Data (JSON-LD) & Per-Page Metadata
- **Shared site config:** `src/lib/site.ts` exports `SITE_URL` (defaults to `https://wainalaqi.com`, overridable via `NEXT_PUBLIC_APP_URL`), `SITE_NAME_AR/EN`, `SITE_GEO` (Ramtha lat/lng), and `absoluteUrl(path)`. All canonical URLs, OG images, and JSON-LD `@id`/URL fields are built from `SITE_URL` via `metadataBase` (set in root layout) or `absoluteUrl()`.
- **Structured-data components:** `src/components/structured-data.tsx` — `<JsonLd data>` renders a `<script type="application/ld+json">` (server-side; CSP doesn't block it since `application/ld+json` is non-executable data, not subject to `script-src`). Helpers: `WebSiteSchema` (SearchAction for sitelinks search box), `OrganizationSchema`, `LocalBusinessSchema({store})`, `BreadcrumbSchema({items})`, `ItemListSchema({name, items})`.
- **Where schemas render:** `WebSiteSchema` + `OrganizationSchema` in root `layout.tsx` (global). `LocalBusinessSchema` + `BreadcrumbSchema` on `/stores/[slug]`. `BreadcrumbSchema` + `ItemListSchema` on `/categories/[slug]`. `ItemListSchema` on `/stores` and `/categories` listings.
- **Per-page metadata:** every public page exports `metadata` (or `generateMetadata`) with a targeted Arabic `title` + `description` (Ramtha-localized) and `alternates.canonical`. Root layout sets `metadataBase`, default OG image (`/logo.png`), `og:site_name`, `og:locale`, Twitter `summary_large_image` card, and `robots: {index, follow, googleBot: {max-snippet, max-image-preview}}`.
- **noindex pages:** `/search` has `robots: {index: false, follow: true}` — internal search-result pages shouldn't be indexed (Google guidance against thin/duplicate crawl waste). All admin/auth/dashboard/account pages are behind route guards AND disallowed in robots.txt.
- **OG image:** uses `/logo.png` (1254×1254, in `public/`). A dynamic `next/og` `opengraph-image.tsx` was attempted but **failed to build** with `Error: lookupType: 5 - substFormat: 3 is not yet supported` — this is satori's Arabic font table limitation. Deleted; `/logo.png` is reliable in all environments (Docker/standalone). If a 1200×630 OG image is desired later, pre-render one as a static PNG (don't use `next/og` with Arabic).
- **add-store metadata:** `/add-store` is a client component (`"use client"`), so it can't export `metadata` directly — added `src/app/add-store/layout.tsx` (server component) that exports the metadata.

## Railway Docker Build Cache (IMPORTANT — deploys not picking up changes)
- **Symptom:** the Next.js `buildId` embedded in the served HTML stayed `3bJHVz1iQiTr4ruwGlIX0` across 5+ commits/deployments, and new routes (`/api/google-verification`, `/sitemap.xml`, `/robots.txt`) returned 404 in production while existing routes (`/api/health`) returned 200. GitHub deployment statuses showed `success`, but Railway was reusing a cached Docker image — NOT rebuilding from source.
- **Root cause:** Railway's Docker layer caching (BuildKit) reuses the `RUN npm run build` layer. Adding `ARG CACHE_BUST=<fixed-value>` did NOT bust the cache because the value is identical between builds.
- **Fix (requires Railway dashboard access):** set the service variable **`NO_CACHE=1`** (or `NO_CACHE=true`) on the Railway service → forces `docker build --no-cache` on every deploy. This is the official Railway-recommended fix. Alternatively, trigger a manual "Redeploy" with "Clear Build Cache" from the Railway deployment UI. Until this is done, source changes will NOT appear on the production URL even though GitHub shows deployment "success".

## Content Security Policy (CSP) — Enforcing
- **Middleware:** `src/middleware.ts` generates a per-request nonce (`crypto.randomUUID()` → base64) and sets the **enforcing** `Content-Security-Policy` response header. It also forwards the CSP on the *request* headers (`Content-Security-Policy` + `x-nonce`) so Next.js's App Router auto-injects the nonce into its inline hydration/RSC scripts.
- **Nonce mechanism (verified in source):** Next.js 14.2.x reads the nonce from the **incoming request's `content-security-policy` header** (`req.headers["content-security-policy"]` in `app-render.js`), extracts the `'nonce-...'` value via `get-script-nonce-from-header.js`, and applies it to all inline scripts. So middleware MUST set the CSP on request headers (not just response) for the auto-injection to work. The `x-nonce` header is set additionally for app code that reads it via `headers()`.
- **CSP directives:** `default-src 'self'`; `script-src 'self' 'nonce-{nonce}' 'strict-dynamic'` (+`'unsafe-eval'` in dev for React Fast Refresh); `style-src 'self' 'unsafe-inline'` (Leaflet + Next inject inline styles); `img-src 'self' data: blob: https:` (open images for store owners, covers OSM tiles); `font-src 'self'`; `connect-src 'self' https://nominatim.openstreetmap.org`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`; `upgrade-insecure-requests`. No `'unsafe-inline'` in `script-src`.
- **Matcher:** `/((?!_next/static|_next/image|favicon.ico|api).*)` — pages only; static assets and API routes are skipped (API routes don't need the nonce).
- **Leaflet is now local (not CDN):** `leaflet` + `@types/leaflet` installed via npm. `store-map.tsx` and `location-picker-map.tsx` import Leaflet with **dynamic `import()` inside `useEffect`** (NOT a top-level static import) — Leaflet's top-level code references `window`, which breaks SSR prerendering of pages that render the map (`/add-store` prerender failed with `ReferenceError: window is not defined` when using a static `import L from "leaflet"`). The CSS (`import "leaflet/dist/leaflet.css"`) IS a static top-level import in the client component — CSS imports are extracted by the bundler and don't execute on the server. Default marker icons are fixed via `L.Icon.Default.mergeOptions` with dynamically-imported images (`marker-icon.png`, `marker-icon-2x.png`, `marker-shadow.png`) using `.default.src`.
- **No more unpkg.com:** both map components no longer inject `<link>/<script>` from `https://unpkg.com/leaflet@1.9.4`. All Leaflet JS/CSS/images bundle locally under `/_next/static`. Verified: `curl` shows 0 unpkg references on any page.
- **next.config.js:** removed `{ hostname: "**" }` from `images.remotePatterns` (was a wildcard; kept only `images.unsplash.com` and `ui-avatars.com`).
- **External links:** all `target="_blank"` links use `rel="noopener noreferrer"` (was `rel="noreferrer"` only in `/search`; `/stores/[slug]` was already correct).

## Admin — Category Description & Home Section Order
- **Category description:** the `description` field exists on the `Category` model and the `/api/admin/categories` POST + PATCH routes always accepted it, but the admin UI (`admin-categories.tsx`) never exposed it. Added a `<textarea>` to both the **add** form and the **edit** form, plus it now displays under the category name in the list row. The page passes `description` through in the mapped props.
- **Home section order:** new CMS key `home_section_order` (string) in `src/lib/content.ts` DEFAULTS, default `"categories_first"`. Values: `"categories_first"` (القطاعات فوق المتاجر المميزة) or `"featured_first"` (المتاجر المميزة فوق القطاعات). Edited via the **content editor** (`content-editor.tsx`) as a new `"select"` type — the editor now supports `type: "select"` with `options` in addition to text/textarea/json. The home page reads `Content.get("home_section_order")` and conditionally renders the categories/featured sections in the chosen order. The `/api/admin/content` PUT route now calls `revalidatePath` for `/`, `/about`, `/contact` so content edits appear immediately (was previously cached for up to 1h via `revalidate=3600`).

## Header Logo Size
- **`Logo` component** (`src/components/logo.tsx`) takes a `size` prop; the header (`site-header.tsx`) previously passed 34 (mobile) / 36 (desktop). Increased to **44 (mobile) / 48 (desktop)** and bumped the header bar height `h-14`→`h-16` (mobile) and `sm:h-16`→`sm:h-20` (desktop) so the larger logo fits. Footer keeps `size={36}`.
