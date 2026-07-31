# WCommerce Catalogue

A **B2C/B2B e-commerce catalogue platform** built with Next.js 16 (App Router). Enables businesses to run an online store with full CMS capabilities, page builder, media library, tiered/volume pricing, and enquiry management. Single-store (no multi-tenancy).

---

## Tech Stack

| Layer            | Technology                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**    | Next.js 16 (App Router, standalone output)                                                                                                     |
| **Language**     | TypeScript 5                                                                                                                                   |
| **Database**     | SQLite (local dev, `file:./dev.db`) / PostgreSQL via Neon serverless adapter (production)                                                      |
| **ORM**          | Prisma 6                                                                                                                                       |
| **Auth**         | NextAuth v5 (Auth.js) — Credentials (email/password + email/SMS OTP), JWT session strategy; `jose` for tokens, `bcryptjs` for password hashing |
| **UI**           | Radix UI / shadcn + Tailwind CSS 4                                                                                                             |
| **State**        | Zustand 5 (persisted)                                                                                                                          |
| **Server State** | TanStack React Query 5                                                                                                                         |
| **Charts**       | Recharts                                                                                                                                       |
| **Animation**    | Framer Motion                                                                                                                                  |
| **Tables**       | TanStack React Table                                                                                                                           |
| **Media**        | Sharp (image processing)                                                                                                                       |
| **Payment**      | PayU (hash-verified callbacks) + Cash on Delivery                                                                                              |
| **Email**        | Nodemailer                                                                                                                                     |
| **SMS (OTP)**    | Twilio (optional)                                                                                                                              |
| **Testing**      | Playwright + Vitest                                                                                                                            |

---

## Features

### Storefront

- Product catalogue with category browsing
- Rich category landing pages (hero, content-split, product cards, CTA, process flow, infographic)
- Product detail pages with images, pricing, variants
- B2B wholesale pricing & volume tiers
- Shopping cart, wishlist, checkout
- Blog with block-based content
- CMS content pages (About, Manufacturing, Contact)
- Full-text search with autocomplete
- SEO: dynamic sitemap, robots.txt, JSON-LD, per-page meta
- Mobile-responsive, dark mode, cookie consent
- Contact & enquiry forms
- WhatsApp integration

### Admin Dashboard

- Dashboard with stats, charts, enquiry trends
- Product management (CRUD, bulk, import/export, trash, variants, tiered pricing)
- Category management (tree view, rich page builder fields, import/export)
- Page Builder — 44 block types (hero, text, gallery, features, testimonials, FAQ, pricing, timeline, process, etc.)
- Blog management with WYSIWYG editor
- Banner management
- Media library (folders, upload, search)
- Menu builder (primary, footer, mobile)
- Redirect management (301/302, import/export)
- Enquiry management with status workflow
- User management (roles, import/export)
- Settings (general, SMTP, B2B, shipping, tax, payment, SEO, theme, catalog mode)
- Activity logs (audit trail)
- Backup & restore (full DB JSON)
- Import (CSV, WooCommerce, Shopify)
- Data export (products, categories, blog, enquiries, users)

### B2B / Wholesale

- Product enquiries with status tracking
- Tier-based pricing (standard/silver/gold/platinum — 0%/5%/10%/15%)
- Volume pricing tiers per product
- Minimum order quantities & wholesale pricing
- Customer-specific prices per product (CSV import)

### CMS / Page Builder

- **44 block types**: Hero, Text, Image Gallery, Features Grid, CTA, Testimonials, Spacer, Divider, Products Grid, Lead Capture, FAQ, Slider, Product Carousel, About Section, Trust Bar, Audience Cards, Capabilities, Product Categories, Factory Reel, Certifications, Leadership, Partner Logos, Blog Grid, Pricing Table, Sticky CTA, Hero Split, Timeline, Metrics Bar, Process Flow, Packaging Grid, Quick Connect, CRM Flow
- Drag-and-drop block reordering
- Category landing pages with dedicated fields (hero, content-split, cards, CTA, process, infographic)
- Content pages with block-based editing
- Per-page SEO (meta title, description, OG image, schema)

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **SQLite** (local dev) or **PostgreSQL/Neon** (production)
- **pnpm** (recommended) or npm

### Environment Variables

Copy `.env` and configure. Reference `.env` for the full list — key variables:

| Variable                                                           | Required | Description                                                                  |
| ------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`                                                     | Yes      | DB connection string (`file:./dev.db` for SQLite dev, Postgres URL for prod) |
| `AUTH_SECRET`                                                      | Yes      | NextAuth v5 session/JWT signing secret (long random string)                  |
| `JWT_SECRET`                                                       | Yes      | Secret used for custom JWT/OTP token signing (min 32 chars)                  |
| `JWT_EXPIRES_IN`                                                   | No       | JWT expiry (default `7d`)                                                    |
| `NEXTAUTH_URL`                                                     | No       | `http://localhost:3000` (override per environment)                           |
| `NEXT_PUBLIC_SITE_URL`                                             | No       | Public base URL used by middleware internal fetches                          |
| `OTP_SECRET`                                                       | No       | OTP token secret                                                             |
| `DEFAULT_STORE_SLUG`                                               | No       | Slug of the default store (single-store mode, default `main`)                |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` | No       | SMS OTP (leave blank for email-OTP only)                                     |
| `PAYU_MERCHANT_KEY` / `PAYU_MERCHANT_SALT` / `PAYU_TEST_MODE`      | No       | PayU payment gateway credentials                                             |
| `CRON_SECRET`                                                      | No       | Secret protecting cron routes (e.g. `/api/cron/abandoned-carts`)             |

> Generate strong secrets with `openssl rand -hex 32`. The committed `.env` contains **dev-only insecure placeholders** — replace them before deploying.

### Install & Run

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed sample data (optional)
npx tsx prisma/seed.ts

# Start dev server
pnpm dev
```

### Available Commands

These map directly to the `scripts` in `package.json`:

| Command            | Description               |
| ------------------ | ------------------------- |
| `pnpm dev`         | Start development server  |
| `pnpm build`       | Production build          |
| `pnpm start`       | Start production server   |
| `pnpm db:push`     | Push Prisma schema to DB  |
| `pnpm db:generate` | Generate Prisma Client    |
| `pnpm db:migrate`  | Run migrations            |
| `pnpm db:reset`    | Reset database & run seed |
| `pnpm lint`        | Run ESLint                |

> **Tests:** Playwright and Vitest are configured (`playwright.config.ts`, `vitest.config.ts`) but are run directly via `npx playwright test` / `npx vitest`, not through `package.json` scripts. There is no `typecheck`, `test`, or `test:e2e` npm script.

---

## Deployment

### Docker

```bash
docker build -t wcommerce-catalogue .
docker run -p 3000:3000 --env-file .env wcommerce-catalogue
```

### Vercel

Configure `vercel.json` build command: `prisma generate && next build`

### Manual (Node)

```bash
pnpm build
node .next/standalone/server.js
```

See `DEPLOY.md` for detailed deployment instructions.

---

## Architecture

### Routing

The storefront uses a **catch-all route** (`[[...slug]]`) with client-side routing via Zustand. Product pages (`/product/<slug>`) have a dedicated route for proper SSR support on hard refresh. Admin lives under `/admin` (login at `/admin`, dashboard at `/admin/dashboard`).

### Project Structure

```
src/
├── app/
│   ├── [[...slug]]/        # Catch-all storefront route
│   ├── product/[slug]/     # Product/category detail route
│   ├── admin/              # Admin dashboard (login + dashboard)
│   ├── api/                # All API routes (138 route files)
│   │   ├── admin/          # Admin-only CRUD (protected by requireAdminAuth)
│   │   ├── products/       # Product CRUD + facets
│   │   ├── categories/     # Category CRUD
│   │   ├── blog/           # Blog CRUD
│   │   ├── enquiries/      # Enquiry management
│   │   ├── auth/           # NextAuth handlers (signIn/signOut/callback)
│   │   ├── media/          # Media library
│   │   └── ...
│   ├── orders/             # SPA deep-link route (account orders)
│   ├── bundles/            # SPA deep-link route (product bundles)
│   └── register/           # Customer registration
├── components/
│   ├── store/              # Storefront components
│   ├── admin/              # Admin components
│   └── ui/                 # UI primitives (shadcn)
├── middleware.ts           # NextAuth session + admin route guard
├── auth.ts / auth.config.ts # NextAuth config (Node + edge-safe)
└── lib/
    ├── db.ts               # Prisma client
    ├── store.ts            # Zustand store
    ├── admin-auth.ts       # requireAdminAuth / requireAuth guards
    ├── validations.ts      # Zod schemas
    ├── page-blocks.ts      # Block type definitions
    └── ...
```

### Authentication Flow

1. **NextAuth middleware** (`src/middleware.ts`) runs on the matcher, reads the session via the edge-safe `authConfig`, and injects `x-user-id`, `x-user-role`, `x-user-email` headers into downstream requests.
2. **Admin route guard** in middleware: any path starting with `/admin` or `/api/admin` requires an `admin` or `editor` session. Unauthenticated users hitting a protected page are redirected to the `/admin` sign-in page; unauthenticated API calls return `401`.
3. **Route-level guards** (`src/lib/admin-auth.ts`): API handlers call `requireAdminAuth(request)` (admin/editor) or `requireAuth(request)` (any signed-in user) to verify the middleware-injected headers.
4. Session uses the **JWT strategy**; the `role` claim is propagated from the database into the token so middleware can authorize on the edge.

> **Known gotcha:** `/admin` is both the sign-in page and the protected prefix. The middleware must NOT redirect `/admin` to itself, otherwise unauthenticated visitors hit an `ERR_TOO_MANY_REDIRECTS` loop.

### Database

44 models including: Store, User, Session, Product, Category, ProductVariant, Brand, ProductAddon, BlogPost, ContentPage, Banner, Media, Enquiry, Menu, MenuItem, Redirect, Notification, ActivityLog, NewsletterSubscriber, SiteSetting, Cart, CartItem, Order, OrderItem, Coupon, Wishlist, FlashSale, Plugin, Theme, Review, ShippingRate, Popup, SupportTicket, StockNotification, PasswordResetToken, EmailVerificationToken, OtpToken, Bundle, BundleItem, CustomFieldDefinition, CustomFieldValue, CustomerPrice, RateLimitEntry.

---

## User Roles

| Role                     | Access                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------- |
| **admin**                | Full access to all features (enforced in middleware + `requireAdminAuth`)           |
| **editor**               | Content management (products, categories, blog, pages) — enforced alongside admin   |
| **clerk**                | Referenced in UI; order/enquiry access is governed by `requireAuth` on those routes |
| **buyer** / **customer** | Standard storefront account (orders, addresses, wishlist, support tickets, reviews) |

---

## API Overview

All mutating API routes (`POST`, `PUT`, `PATCH`, `DELETE`) under `/api/admin/*` are secured with `requireAdminAuth()`. Read-only GET endpoints for storefront data are public. See `DEVELOPER.md` for full API reference.

---

## Seed Data

Run seed scripts to populate sample data:

```bash
# Admin user & sample product
npx tsx prisma/seed.ts

# Rich product categories (Khakhra, Makhana, Papad, Spices, Namkeen)
npx tsx scripts/seed-categories.ts
```

Default admin: `admin@store.com` / `admin123`

---

## Documentation

| File             | Description                               |
| ---------------- | ----------------------------------------- |
| `USER.md`        | Complete user guide for admins and buyers |
| `DEVELOPER.md`   | Architecture, API reference, RBAC, setup  |
| `DEPLOY.md`      | Production deployment guide               |
| `CODE-REVIEW.md` | Code review findings & fixes              |

### Default Credentials

| Field    | Value             |
| -------- | ----------------- |
| Email    | admin@example.com |
| Password | admin123          |
| Role     | admin             |

Customer login:

- OTP tab — enter `customer@store.com`, check terminal for `[OTP DEV] Code XXXX...`
- Password tab — `customer@store.com` / `customer123`
