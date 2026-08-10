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
