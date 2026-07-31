# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `Session` model (production schema) for API token revocation tracking.
- Newsletter confirmation email (`sendNewsletterConfirmation`) wired into the subscribe route.
- Low stock alert email template (`sendLowStockAlert`) for admin notifications.
- `CONTRIBUTING.md` with code style, commit conventions, PR process, testing, and branch naming.
- Stock validation at order creation (400 with `productId`/`requested`/`available`) and guarded transactional stock decrements (orders + PayU callback).
- Scheduled cron jobs for `/api/cron/abandoned-carts` (every 2h) and `/api/cron/cleanup-sessions` (daily) — originally defined in `vercel.json`, now driven by GitHub Actions (see `.github/workflows/cron.yml`).
- Deep-link routes `/orders` and `/bundles` (SPA pages with dedicated URLs).
- Rendering for 14 previously-silent CMS page-builder block types (slider, about, blog-grid, pricing-table, hero-split, timeline, metrics-bar, process-flow, packaging-grid, certification-cards, address-cards, product-carousel, mfg/catalogue page aliases).
- Admin sidebar tabs: Brands, Users, Redirects, Activity Logs, Data Export, Plugins, Themes.
- Faceted search: `brandId` and `attributes` filters on `/api/products`; attribute facet aggregation on `/api/products/facets`; facet counts UI in ShopPage.
- Functional plugin hook system: builtin `stock-notifications` (restock alert on `product:stock-updated`), `flash-sales` (price/badge filters), plus `order:created` and `order:status-updated` hooks; 60s plugin cache.
- PDF invoice generation via dynamic `pdfkit` import (no `eval`).
- Netlify deployment config: `netlify.toml` (pnpm build via corepack, `publish: .next`), `.nvmrc` (Node 20).
- GitHub Actions cron job (`.github/workflows/cron.yml`) replacing Vercel crons: `/api/cron/abandoned-carts` (2h) and `/api/cron/cleanup-sessions` (daily) with Bearer `CRON_SECRET` auth.
- ISR-style data caching for the storefront: `src/lib/cache.ts` (`CACHE_TAGS`, `storefrontCache` wrapping `unstable_cache`, `invalidateCache` with `{ expire: 0 }` profile).
- Cached storefront reads: `/api/products` (filter-keyed, 300s), `/api/products/[id]` (300s), `/api/categories` (600s), `/api/blog` (600s), `/api/content-pages` (600s), `/api/banners` (300s), `/api/popups` (300s), `/api/brands` (600s), `/api/flash-sales` (60s).
- On-demand cache invalidation on writes: products/categories/blog CRUD + bulk ops, content-pages CRUD, banners/popups CRUD (admin routes), brands CRUD, flash-sales CRUD (also purges product price caches), order creation and PayU success callback (stock changes).

### Fixed
- README.md recovered from binary (null-byte) corruption; docs de-staled (single-store, 44 models, actual stack).
- Playwright specs updated to real credential policy (`Password123!` family, B2C register/login flows).

### Security
- `next.config.ts`: image domains restricted to Cloudinary/Unsplash/Google; CSP adds `frame-ancestors 'self'`.
- PayU callback fails closed when `PAYU_MERCHANT_SALT` is not configured (removed `'test_salt'` fallback).

### Removed
- Dead code: `src/lib/api-response.ts` (+ test), `src/app/admin/AdminClient.tsx`, `src/components/store/StorePageShell.tsx`, ghost `banner/[id]` and `plugin/[id]` route dirs.

## [1.1.0] - 2026-01-15

### Added
- Centralized error logger (`src/lib/error-logger.ts`) with `logError` and `withErrorLog`.
- Rate limiting on critical public endpoints (contact, newsletter, forgot-password, orders, products).
- CMS block persistence helpers (`parseJsonPayload`, `normalizeBlockData`, `normalizePageBlocks`) resolving double-stringified JSON.
- PayU payment gateway integration with hash verification and callback webhook.
- Welcome email on user registration (`sendWelcomeEmail`).
- Order confirmation and shipping/tracking notification emails.
- Database indexes on `Product` and `Order` models for common query patterns.
- `X-RateLimit-*` headers on API responses.
- `ErrorBoundary` wrapping the application root layout.
- Health check endpoint with database connection check and memory usage reporting.
- Application-wide constants module (`src/lib/constants.ts`) to eliminate magic strings.
- Environment variable validation at startup (`src/lib/env.ts`).

### Fixed
- Replaced all `XXXXX` placeholder data in production defaults.
- Stock validation during cart sync (removes out-of-stock items, caps quantities).
- Order number collision risk (UUID-based format + retry + DB unique constraint).
- Prisma error handling via `logError` across core product API routes.

### Security
- Content Security Policy (CSP) headers configured in `next.config.ts`.

## [1.0.0] - 2025-12-01

### Added
- Initial release of the WCommerce multi-tenant B2B/B2C e-commerce platform.
- Product catalog, categories, cart, checkout, and order management.
- Admin dashboard with page builder and content management.
- B2B enquiry and quote workflows.
- Authentication with JWT and role-based access control.
