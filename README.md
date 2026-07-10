# WCommerce Catalogue

A **multi-tenant B2B/B2C e-commerce platform** built with Next.js 16 (App Router). Enables businesses to create and manage online stores with full CMS capabilities, B2B quotation workflows, page builder, media library, and multi-store management.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, standalone output) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL (Neon serverless) |
| **ORM** | Prisma 6 |
| **Auth** | Clerk + Custom JWT (jose + bcryptjs) |
| **UI** | Radix UI / shadcn + Tailwind CSS 4 |
| **State** | Zustand 5 (persisted) |
| **Server State** | TanStack React Query 5 |
| **Charts** | Recharts |
| **Animation** | Framer Motion |
| **Tables** | TanStack React Table |
| **Media** | Sharp (image processing) |
| **Webhooks** | Svix (Clerk webhook) |
| **Payment** | Razorpay |
| **Email** | Nodemailer |
| **Testing** | Playwright + Vitest |

---

## Features

### Storefront
- Product catalogue with category browsing
- Rich category landing pages (hero, content-split, product cards, CTA, process flow, infographic)
- Product detail pages with images, pricing, variants
- B2B wholesale pricing & volume tiers
- Shopping cart, wishlist, checkout (Razorpay)
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
- Page Builder — 26+ drag-and-drop block types (hero, text, gallery, features, testimonials, FAQ, pricing, timeline, process, etc.)
- Blog management with WYSIWYG editor
- Banner management
- Media library (folders, upload, search)
- Menu builder (primary, footer, mobile)
- Redirect management (301/302, import/export)
- Enquiry management with status workflow
- Quote generation with line items
- B2B company verification & tier management
- User management (roles, import/export)
- Settings (general, SMTP, B2B, shipping, tax, payment, SEO, theme, catalog mode)
- Multi-store management
- Activity logs (audit trail)
- Backup & restore (full DB JSON)
- Import (CSV, WooCommerce, Shopify)
- Data export (products, categories, blog, enquiries, users)

### B2B / Wholesale
- Product enquiries with status tracking
- Formal quotation system (line items, validity, accept/decline)
- Company registration & verification
- Tier-based pricing (standard/silver/gold/platinum — 0%/5%/10%/15%)
- Volume pricing tiers per product
- Buyer portal with orders, quotes, company info
- Minimum order quantities & wholesale pricing

### Multi-Tenant
- Subdomain-based stores (`{slug}.platform.com`)
- Custom domain support
- Per-store settings, products, categories, content
- Store switching for super admins
- Store plan tiers (free/basic/pro/enterprise)

### CMS / Page Builder
- **26+ block types**: Hero, Text, Image Gallery, Features Grid, CTA, Testimonials, Spacer, Divider, Products Grid, Lead Capture, FAQ, Slider, Product Carousel, About Section, Trust Bar, Audience Cards, Capabilities, Product Categories, Factory Reel, Certifications, Leadership, Partner Logos, Blog Grid, Pricing Table, Sticky CTA, Hero Split, Timeline, Metrics Bar, Process Flow, Packaging Grid, Quick Connect, CRM Flow
- Drag-and-drop block reordering
- Category landing pages with dedicated fields (hero, content-split, cards, CTA, process, infographic)
- Content pages with block-based editing
- Per-page SEO (meta title, description, OG image, schema)

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **PostgreSQL** database (Neon serverless recommended)
- **pnpm** (recommended) or npm

### Environment Variables

Copy `.env` and configure:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DIRECT_URL` | Yes | Direct connection for migrations |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | If using Clerk | Clerk publishable key |
| `CLERK_SECRET_KEY` | If using Clerk | Clerk secret key |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` |

### Install & Run

```bash
# Install dependencies
pnpm install

# Push schema to database
pnpm db:push

# Seed sample data (optional)
npx tsx prisma/seed.ts

# Start dev server
pnpm dev
```

### Available Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm db:push` | Push Prisma schema to DB |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:reset` | Reset database & run seed |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript check |
| `pnpm test` | Run Vitest tests |
| `pnpm test:e2e` | Run Playwright tests |

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

The storefront uses a **catch-all route** (`[[...slug]]`) with client-side routing via Zustand. Product pages (`/product/<slug>`) have a dedicated route for proper SSR support on hard refresh.

### Project Structure

```
src/
├── app/
│   ├── [[...slug]]/        # Catch-all storefront route
│   ├── product/[slug]/     # Product/category detail route
│   ├── admin/              # Admin dashboard
│   ├── api/                # All API routes
│   │   ├── products/       # Product CRUD
│   │   ├── categories/     # Category CRUD
│   │   ├── blog/           # Blog CRUD
│   │   ├── enquiries/      # Enquiry management
│   │   ├── quotes/         # Quotation system
│   │   ├── auth/           # Authentication
│   │   ├── media/          # Media library
│   │   └── ...             # 97+ route files
│   └── portal/             # B2B buyer portal
├── components/
│   ├── store/              # Storefront components
│   ├── admin/              # Admin components
│   └── ui/                 # UI primitives (shadcn)
└── lib/
    ├── db.ts               # Prisma client
    ├── store.ts            # Zustand store
    ├── admin-auth.ts       # Auth helpers
    ├── validations.ts      # Zod schemas
    ├── page-blocks.ts      # Block type definitions
    └── ...
```

### Authentication Flow

1. **Clerk middleware** runs on all API routes, injects `x-user-id`, `x-user-role`, `x-user-email` headers
2. **Route handlers** call `requireAdminAuth(request)` to verify admin/editor/clerk access
3. **Custom JWT fallback** uses httpOnly cookies for non-Clerk auth
4. Admin routes (`/api/admin/*`) are protected by Clerk middleware + route-level auth

### Database

27 models including: Store, User, Product, Category, ProductVariant, ProductTier, BlogPost, ContentPage, Banner, Media, Enquiry, Quote, Company, Menu, MenuItem, Redirect, Notification, ActivityLog, NewsletterSubscriber, SiteSetting, Cart, CartItem, Order, OrderItem, Coupon, PasswordResetToken, EmailVerificationToken.

---

## User Roles

| Role | Access |
|---|---|
| **admin** | Full access to all features |
| **editor** | Content management (products, categories, blog, pages) |
| **clerk** | Order & enquiry management |
| **buyer** | B2B buyer portal access |

---

## API Overview

All API routes are secured with `requireAdminAuth()` for mutating operations (POST, PUT, PATCH, DELETE). Read-only GET endpoints for storefront data are public. See `DEVELOPER.md` for full API reference.

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

| File | Description |
|---|---|
| `USER.md` | Complete user guide for admins and buyers |
| `DEVELOPER.md` | Architecture, API reference, RBAC, setup |
| `DEPLOY.md` | Production deployment guide |
| `CODE-REVIEW.md` | Code review findings & fixes |
