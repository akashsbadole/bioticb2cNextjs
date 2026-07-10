---
name: wcommerce
description: Use when working on the WCommerce Catalogue e-commerce platform. Covers Next.js App Router, Prisma schema changes, API routes, admin dashboard, store frontend, B2B features (quotes, enquiries, companies), Zustand state, page builder blocks, and multi-tenant store resolution. Triggers on files under src/app/api/, src/components/admin/, src/components/store/, src/lib/, prisma/schema.prisma, and any wcommerce-related task.
---

# WCommerce Catalogue

Multi-tenant B2B/B2C e-commerce platform. Next.js 16 (App Router) + PostgreSQL + Prisma 6.19 + Zustand.

## Quick Reference

### Commands

```bash
npm run dev          # Dev server on port 3000
npm run build        # Production build (standalone)
npm run lint         # ESLint
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema to database
npx prisma migrate dev --name <name>  # Create migration
npx playwright test   # Run E2E tests
```

### Verify after changes

```bash
npx tsc --noEmit     # Type check (must pass)
npm run lint         # Lint check
npx prisma generate  # If schema changed
```

## Architecture

### Directory Layout

```
src/
  app/
    page.tsx              # SPA entry - client-side routing via Zustand
    layout.tsx            # Root layout (Inter + Playfair fonts)
    admin/                # Admin dashboard (file-based routing)
    portal/               # B2B Buyer Portal
    register/             # B2B registration
    api/                  # 97 API route files (35 groups)
  components/
    admin/                # 31 admin components
    store/                # 28 store-front components
    ui/                   # 48 shadcn/ui primitives
  lib/
    db.ts                 # Prisma client singleton
    auth.ts               # JWT (jose) + bcryptjs auth
    auth-edge.ts          # Edge-compatible JWT verify
    admin-auth.ts         # requireAdminAuth() middleware
    store-db.ts           # Multi-tenant DB helpers (scopedWhere, getStoreId)
    store.ts              # Zustand store (nav, auth, cart, wishlist, compare)
    pricing.ts            # B2B tier pricing (standard/silver/gold/platinum)
    email.ts              # Nodemailer SMTP + HTML templates
    page-blocks.ts        # 26 CMS block type definitions
    validations.ts        # Zod schemas for all forms
    rate-limit.ts         # In-memory sliding window rate limiter
  middleware.ts           # Auth, RBAC, store resolution, redirects
prisma/
  schema.prisma           # 27 models
```

### SPA Routing Pattern

The storefront uses client-side routing via Zustand (`src/lib/store.ts`):

- `src/app/page.tsx` is the single entry point
- Store state holds `currentPage` and renders the matching component
- Pages: home, catalogue, product, blog, cart, checkout, orders, account, contact, quick-order, compare

Admin and Portal use standard Next.js file-based routing.

### Multi-Tenancy

Stores resolved in middleware:

1. Subdomain: `{slug}.wcommerce.com`
2. Custom domain: `shop.example.com`
3. Header: `x-store-id`
4. Query: `?store=slug`

Use `scopedWhere()` from `src/lib/store-db.ts` for all store-scoped queries. 5-minute in-memory cache.

### Auth & RBAC

- JWT (jose) + bcryptjs, httpOnly cookies
- Roles: `admin` (full), `clerk` (read most, write enquiries/quotes/notifications), `buyer` (read own quotes/enquiries/companies)
- Middleware strips `x-user-id`, `x-user-role`, `x-user-email` headers to prevent spoofing
- Rate limiting: login 5/15min, contact 10/hr, upload 30/hr, guest orders 5/hr

### Database (27 Prisma Models)

**Platform**: Store, SiteSetting
**User/Auth**: User (roles, tiers, companyId), PasswordResetToken, EmailVerificationToken, NewsletterSubscriber, Company, ActivityLog, Notification
**Catalog**: Product (wholesalePrice, tiered pricing, soft-delete), Category (hierarchical), ProductVariant, ProductTier
**Commerce**: Order, OrderItem, Cart, CartItem, Wishlist, WishlistItem, Coupon
**Content**: BlogPost, ContentPage, Banner, Media
**B2B**: Enquiry, Quote (with companyId, enquiryId)
**Other**: Redirect

### Key Patterns

**Store-scoped queries**:

```typescript
import { scopedWhere, getStoreId } from "@/lib/store-db";
const storeId = getStoreId(request);
const where = scopedWhere(storeId, { isActive: true });
```

**Admin auth middleware**:

```typescript
import { requireAdminAuth } from "@/lib/admin-auth";
const auth = await requireAdminAuth(request);
if (!auth.success) return auth.response;
```

**User auth from Bearer token**:

```typescript
import { resolveUserId } from "@/lib/auth-helpers";
const userId = await resolveUserId(request);
```

**Zustand navigation** (store frontend):

```typescript
import { useAppStore } from "@/lib/store";
const { navigate } = useAppStore();
navigate("product", productSlug);
```

**Page blocks** (CMS):

```typescript
import { BLOCK_TYPES, getDefaultData } from "@/lib/page-blocks";
// 26 block types: hero, features, cta, testimonials, faq, pricing-table, etc.
```

## Common Tasks

### Add a new Prisma model

1. Add model to `prisma/schema.prisma`
2. Run `npx prisma generate`
3. Create API route in `src/app/api/<name>/route.ts`
4. Use `requireAdminAuth` for protected routes
5. Use `scopedWhere` for store-scoped data

### Add a new API route

1. Create `src/app/api/<path>/route.ts`
2. Export named functions: `GET`, `POST`, `PUT`, `DELETE`
3. Use `requireAdminAuth(request)` or `resolveUserId(request)` for auth
4. Use `db` from `@/lib/db` for Prisma queries
5. Return `NextResponse.json(...)`

### Add a new admin tab

1. Create component in `src/components/admin/AdminNewTab.tsx`
2. Add tab entry in `AdminDashboard.tsx` tabs array
3. Import and render the component

### Add a new page block

1. Add block type to `BLOCK_TYPES` in `src/lib/page-blocks.ts`
2. Add default data in `getDefaultData()`
3. Add renderer in `src/components/store/PageBlockRenderer.tsx`
4. Add editor fields in `src/components/admin/PageBuilder.tsx`

### Fix TypeScript errors after schema change

```bash
npx prisma generate    # Regenerate client
npx tsc --noEmit       # Check remaining errors
```

Common issues:

- `Property 'X' does not exist on type` -> Field missing from Prisma model
- `Property 'X' does not exist in type 'YInclude'` -> Relation missing or model name wrong
- `Object literal may only specify known properties` -> Field doesn't exist in the input type

## Environment Variables

### Required

```
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="<openssl rand -hex 32>"
```

### Optional

```
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Purva Bites"
NEXT_PUBLIC_PLATFORM_DOMAIN="wcommerce.com"
JWT_EXPIRES_IN="7d"
```

SMTP, payment, and B2B settings are stored in the `SiteSetting` DB table (configured via admin UI).

## File Conventions

- API routes use `export async function GET/POST/PUT/DELETE(request: NextRequest)`
- Admin components are client components (`'use client'`)
- Store frontend pages are rendered via Zustand SPA routing
- All Prisma queries go through `src/lib/db.ts` (singleton)
- Store-scoped queries must use `scopedWhere()` from `src/lib/store-db.ts`
- Zod validation schemas live in `src/lib/validations.ts`
- Activity logging via `logActivity()` from `src/lib/activity-log.ts`
