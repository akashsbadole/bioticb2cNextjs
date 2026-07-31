# WCommerce Catalogue - Developer Documentation

## Overview

WCommerce Catalogue is a single-store B2C/B2B-capable e-commerce catalogue platform built with Next.js 16 (App Router), PostgreSQL/SQLite, Prisma ORM, and Zustand for client state. The store is resolved via `storeId` (single default store); subdomain/tenant isolation is out of scope.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| Language | TypeScript 5 |
| Database | SQLite (dev, default `schema.prisma`) / PostgreSQL (prod, `schema.postgres.prisma`) |
| ORM | Prisma 6 |
| Auth | NextAuth v5 (Credentials + OTP) + jose JWT for API tokens |
| UI | Radix UI + shadcn/ui |
| CSS | Tailwind CSS 4 |
| State | Zustand 5 (persisted) |
| Server State | TanStack React Query 5 |
| Forms | React Hook Form 7 + Zod 4 |
| Payment | PayU (hash-verified callbacks) + COD |
| Email | Nodemailer 7 |
| Animation | Framer Motion 12 |
| Testing | Playwright 1.60 + Vitest |

## Project Structure

```
wcommerce-catelog~/
├── prisma/
│   ├── schema.prisma          # 44 Prisma models (SQLite)
│   ├── schema.postgres.prisma # 44 models (PostgreSQL production)
│   └── migrations/            # SQL migrations
├── src/
│   ├── app/
│   │   ├── [[...slug]]/       # SPA entry (client-side routing via Zustand)
│   │   ├── admin/             # Admin dashboard
│   │   ├── register/          # B2C registration
│   │   ├── api/               # 138 API route files
│   │   └── error.tsx, not-found.tsx, loading.tsx
│   ├── components/
│   │   ├── admin/             # 47 admin components
│   │   ├── store/             # 70 store-front components
│   │   └── ui/                # shadcn/ui primitives
│   ├── hooks/
│   ├── lib/                   # 47 library files
│   └── middleware.ts          # Auth, RBAC, store resolution, redirects
├── tests/                     # Playwright tests
├── scripts/                   # Utility scripts
└── Dockerfile, vercel.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon)
- pnpm / npm / yarn

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with your database URL and JWT secret

# 3. Required environment variables
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
DIRECT_URL="postgresql://user:pass@host:5432/dbname"
JWT_SECRET="<generate with: openssl rand -hex 32>"

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database
npx prisma db push

# 6. Start dev server
npm run dev
```

### Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev -p 3000` | Development server |
| `build` | `next build` | Production build (standalone) |
| `start` | `node .next/standalone/server.js` | Production server |
| `lint` | `eslint .` | Lint check |
| `db:push` | `prisma db push` | Push schema to DB |
| `db:generate` | `prisma generate` | Generate Prisma client |
| `db:migrate` | `prisma migrate dev` | Create migration |
| `db:reset` | `prisma migrate reset` | Reset DB |

## Architecture

### Store Resolution (single store)

The app is single-store. Middleware resolves the default store id via:
1. `DEFAULT_STORE_ID` env fast-path (recommended)
2. Internal fetch to `/api/store/default` (cached 1 hour, fallback)
3. Header `x-store-id` / query `?store=slug` (testing)

Store-scoped queries use `scopedWhere()` from `src/lib/store-db.ts`.

### Authentication

- NextAuth v5 (Credentials email/password + email/SMS OTP, JWT session strategy) for the UI
- `jose` HS256 JWT for API Bearer tokens (`/api/auth/login`, `/api/auth/register`) with `Session`-table revocation tracking
- httpOnly session cookies; Bearer header identity injected via middleware (`x-user-id`, `x-user-role`, `x-user-email`, `x-user-jti`)
- Header spoofing prevention (middleware strips spoofed `x-user-*` headers)
- Rate limiting: in-memory edge limiter (middleware) + Prisma-backed per-route limiter (login 5/15min, contact 10/hr, orders 10/15min, products 120/min, etc.)

### Roles (RBAC)

| Role | Scope |
|---|---|
| admin | Everything |
| editor | Dashboard, content, orders, media, settings (read/write on most non-security entities) |
| customer | Own orders, addresses, wishlist, support tickets, reviews, newsletter |

### Database Schema (44 Models)

**Platform**: Store, SiteSetting, Theme, Plugin
**User/Auth**: User, Session, PasswordResetToken, EmailVerificationToken, OtpToken, NewsletterSubscriber, ActivityLog, Notification
**Catalog**: Product, Category, ProductVariant, Brand, ProductAddon, Bundle, BundleItem, CustomFieldDefinition, CustomFieldValue, CustomerPrice
**Commerce**: Order, OrderItem, Cart, CartItem, Wishlist, Coupon, ShippingRate, Review, SupportTicket
**Content**: BlogPost, ContentPage, Popup, Banner, Media, Redirect, Menu, MenuItem
**B2B/Leads**: Enquiry
**Marketing**: FlashSale, FlashSaleProduct, StockNotification
**Ops**: RateLimitEntry

## API Reference

### Authentication
- `POST /api/auth/login` - Login (rate-limited)
- `POST /api/auth/register` - B2B registration (creates Company + User)
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)
- `POST /api/auth/send-verification` - Send email verification
- `GET /api/auth/verify-email` - Verify email with token

### Products
- `GET /api/products` - List (search, filter, paginate, store-scoped)
- `POST /api/products` - Create
- `GET /api/products/[id]` - Get by ID or slug
- `PUT /api/products/[id]` - Update
- `DELETE /api/products/[id]` - Soft-delete (or `?permanent=true`)
- `GET /api/products/facets` - Faceted search metadata
- `POST /api/products/bulk` - Bulk operations
- `GET /api/products/[id]/recommendations` - Related products
- `POST /api/products/import` - CSV import
- `GET /api/products/export` - CSV export

### Orders
- `GET /api/orders` - User's orders
- `POST /api/orders` - Create order from cart (validates stock, applies coupons)
- `POST /api/orders/guest` - Guest checkout
- `PUT /api/orders/[id]` - Cancel order

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add item
- `PUT /api/cart` - Update quantity
- `DELETE /api/cart` - Remove/clear

### B2B
- `GET /api/quotes` - List quotes (buyer: own + company)
- `POST /api/quotes` - Create quote (admin/clerk)
- `PUT /api/quotes/[id]` - Update (buyer: accept/decline only)
- `GET /api/enquiries` - List enquiries
- `POST /api/enquiries` - Submit enquiry (public, rate-limited)
- `GET /api/companies` - List companies
- `PUT /api/companies/[id]` - Update company (syncs to all users)

### Content
- `GET/POST /api/blog` - Blog CRUD
- `GET/POST /api/content-pages` - CMS pages
- `GET/POST /api/banners` - Banners
- `POST /api/upload` - File upload (Sharp processing, 10MB limit)

### Admin
- `GET/PUT /api/admin/orders` - Admin order management
- `GET/PUT /api/admin/quotes` - Admin quote management
- `GET/POST /api/admin/backup` - Database backup/restore
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/analytics` - Analytics data

## Key Files

| File | Purpose |
|---|---|
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/auth.ts` | JWT generation/verification, password hashing |
| `src/lib/auth-edge.ts` | Edge-compatible JWT verification |
| `src/lib/admin-auth.ts` | `requireAdminAuth()` middleware |
| `src/lib/store-db.ts` | Multi-tenant DB helpers |
| `src/lib/store.ts` | Zustand store (navigation, auth, cart, wishlist) |
| `src/lib/pricing.ts` | B2B tiered pricing calculator |
| `src/lib/email.ts` | Nodemailer SMTP + HTML templates |
| `src/lib/page-blocks.ts` | 26 CMS block type definitions |
| `src/lib/validations.ts` | Zod schemas for all forms |
| `src/middleware.ts` | Auth, RBAC, store resolution, redirects |

## Frontend Architecture

The main store uses a **client-side SPA pattern** via Zustand navigation:
- `src/app/page.tsx` is the single entry point
- `src/lib/store.ts` manages the current route and renders the appropriate page component
- Pages: Home, Catalogue, Product Detail, Blog, Cart, Checkout, Orders, Account, Contact, Quick Order, Compare

Admin and Portal use standard Next.js file-based routing.

## Security

- CSP headers, HSTS, X-Frame-Options in `next.config.ts`
- Rate limiting on login, register, contact, upload, guest orders
- Input validation via Zod
- Path traversal protection on uploads
- Sensitive settings filtering (SMTP passwords, JWT secret, payment keys)
- Soft-delete with trash/restore for data safety

## Deployment

### Vercel
- Configured with cron job (cart abandonment check, daily 10am UTC)
- `vercel.json` included

### Docker
```bash
docker build -t wcommerce .
docker run -p 3000:3000 wcommerce
```

### Standalone
```bash
npm run build
NODE_ENV=production node .next/standalone/server.js
```

## Testing

```bash
npx playwright test
```

Tests in `tests/`:
- `b2b-verification.spec.ts` - B2B user verification workflow
- `cms-full-coverage.spec.ts` - CMS page builder tests
