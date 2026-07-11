# Ecommerce Catalog Application — Current State

## Overview

This is a B2C ecommerce storefront built with Next.js 16, NextAuth v5, Prisma + SQLite, Zustand, TanStack Query, Tailwind CSS v4, and shadcn/ui. The app supports customer self-service, admin management, payments via PayU, and basic notifications.

---

## Implemented Features

| Feature                            | Status | Notes                                                           |
| ---------------------------------- | ------ | --------------------------------------------------------------- |
| Admin auth (email/password + OTP)  | ✅     | NextAuth v5 credentials + OTP providers                         |
| Customer register / login / logout | ✅     | B2C flow, email verification, password reset                    |
| Product CRUD + variants            | ✅     | Admin APIs with zod validation, soft delete, restore            |
| Category management                | ✅     | Nested categories, rich page content (hero, CTAs, FAQ, gallery) |
| Brand management                   | ✅     | CRUD with store scoping                                         |
| Blog CRUD                          | ✅     | With blocks, SEO, publishing workflow                           |
| Media library                      | ✅     | Folders, thumbnails, Cloudinary-ready                           |
| Banner management                  | ✅     | Sort order, active flag                                         |
| Popup management                   | ✅     | Triggers: delay, immediate, on_exit, scroll                     |
| Menu management                    | ✅     | Primary, footer, mobile locations; nested items                 |
| Coupon management                  | ✅     | Percentage/fixed, date ranges, usage limits                     |
| Order management (admin)           | ✅     | Status, payment, tracking, returns, refunds                     |
| Customer order history             | ✅     | Order tracking stepper, invoice print                           |
| Cart (Zustand + server sync)       | ✅     | Debounced sync, abandoned cart recovery                         |
| Wishlist                           | ✅     | Add/remove, synced with server                                  |
| Checkout + PayU                    | ✅     | Order creation, hash generation, callback, stock decrement      |
| Address book                       | ✅     | CRUD with default selection                                     |
| Product reviews                    | ✅     | Moderation workflow (`isActive: false` by default)              |
| Enquiries / contact form           | ✅     | Generic contact leads, no B2B fields                            |
| Newsletter subscription            | ✅     | Public subscribe + admin subscriber management                  |
| Admin dashboard                    | ✅     | Stats cards, enquiry trends, recent activity, low stock alert   |
| Activity logging                   | ✅     | Tracks user actions with IP                                     |
| SEO (meta, robots, sitemap)        | ✅     | Dynamic meta, `robots.ts`, `sitemap.ts`, schema.org             |
| Redirects                          | ✅     | 301/302 with cache in middleware                                |
| Import/export                      | ✅     | CSV for products, categories, users; WooCommerce import         |
| Search                             | ✅     | ILIKE-only search with suggestions                              |
| Rate limiting + CSRF               | ✅     | Per-IP limits, same-origin enforcement in middleware            |
| Email/SMS notifications            | ✅     | SMTP + Twilio wired; order confirmation, enquiry notifications  |
| Caching headers                    | ✅     | `s-maxage=60, stale-while-revalidate=300` on public APIs        |
| Payment method selector            | ✅     | PayU and COD options in checkout                                |
| Customer self-service returns      | ✅     | Return request modal in order history                           |
| Low stock alerts                   | ✅     | Admin dashboard widget showing out-of-stock products            |

---

## Completed Phases

### Phase 0 — Schema cleanup

- Deleted `Company`, `Quote`, `ProductTier` models
- Removed B2B fields from `Enquiry`, `Product`, `ProductVariant`, `User`
- Regenerated Prisma client

### Phase 1 — Customer accounts

- B2C register/login/ logout with email verification
- OTP flow wired (email/SMS)
- Account page with profile, orders, addresses, security tabs
- Password reset and email verification storefront pages

### Phase 2 — Remove B2B UI

- Deleted buyer portal and B2B admin components
- Removed B2B nav tabs, settings, and form fields
- Rephrased storefront CTAs and copy to B2C retail

### Phase 3 — API & lib cleanup

- Removed companies/quotes routes and B2B logic
- Dropped quote stats from dashboard
- Updated email templates to generic enquiry flow
- Fixed WooCommerce import role mapping

### Phase 4 — Verification

- `npx prisma generate` completed
- `npx tsc --noEmit` passes
- `npm run lint` passes (0 errors)
- `npm run build` succeeds

---

## Remaining / Deferred

| Feature                           | Reason                                    |
| --------------------------------- | ----------------------------------------- |
| PDF invoice generation            | Print-only is acceptable for now          |
| Social login                      | Deferred per original `todo.md`           |
| Product attribute faceted filters | Attributes JSON exists but UI not built   |
| Full test coverage                | Playwright tests need further B2C updates |
| `middleware` deprecation warning  | Next.js 16 suggests `proxy`; not blocking |
