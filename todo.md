# WCommerce → B2C E-commerce Refactor — Task Tracker

Goal: Remove B2B-only features (buyer portal B2B sections, company registration, quote/RFQ system, tiered/wholesale pricing) while keeping everything the storefront needs (catalogue, cart, checkout, customer accounts, orders, contact forms).

Decisions:

- Shopper role = `customer` (drop `buyer` + Company coupling). Keep `admin`/`editor`/`clerk` for admin.
- Keep Clerk for `/api/admin`. Wire custom JWT (`user_token` cookie) into middleware for storefront customers.
- Keep `Enquiry` only as a generic contact/lead form. Remove `Company`, `Quote`, `ProductTier` models. Remove `wholesalePrice`/`minOrderQty`/`tier` fields.

---

## Phase 0 — Schema (`prisma/schema.prisma`)

- [x] Delete `Company` model
- [x] Delete `Quote` model
- [x] Delete `ProductTier` model
- [x] Remove `Store.Quote` relation (keep `Store.Enquiry`)
- [x] Remove `Enquiry.Quote` relation
- [x] Strip `Enquiry` B2B fields: `companyName`, `companyEmail`, `companyPhone`, `companyAddress`, `quantity`, `type`, `companyId`
- [x] Remove `Product.wholesalePrice`
- [x] Remove `Product.minOrderQty`
- [x] Remove `Product.ProductTier` relation
- [x] Remove `ProductVariant.wholesalePrice`
- [x] Remove `User.companyId`
- [x] Remove `User.tier`
- [x] Remove `User.Company` relation
- [x] Remove `User.Quote` relation
- [x] Run `npx prisma generate` (client v6.11.1 regenerated; DB push pending live DB)

## Phase 1 — Customer accounts (biggest gap)

- [x] Rework `src/app/api/auth/register/route.ts` → B2C (no company), `role: 'customer'`, send verification email
- [x] Fix `src/app/api/auth/login/route.ts` → set `user_token` cookie consistently, include `role`
- [x] `src/middleware.ts` → verify JWT cookie, inject `x-user-id`/`x-user-role` for non-admin routes
- [x] `src/lib/store.ts` → add SPA pages `login`, `register`; wire `login()`/`logout()`
- [x] Add `src/components/store/LoginPage.tsx`
- [x] Add `src/components/store/RegisterPage.tsx`
- [x] Wire login/register into `src/components/store/StoreShell.tsx`
- [x] Make `AccountPage.tsx` Security tab functional (change-password)
- [x] Add email-verify storefront page
- [x] Add password-reset storefront page
- [x] `src/app/api/account/route.ts` → strip B2B includes; orders resolve via `userId`
- [x] Trigger email verification on register

## Phase 2 — Remove B2B UI

- [x] `src/app/portal/page.tsx` → DELETED (B2B buyer portal; customer account lives in `AccountPage`/StoreShell)
- [x] Delete `src/components/admin/AdminCompanies.tsx`
- [x] Delete `src/components/admin/AdminQuotes.tsx`
- [x] Delete `src/components/admin/B2BRegister.tsx`
- [x] Remove Company/Quote nav tabs from `AdminDashboard.tsx`
- [x] `AdminSettings.tsx` → remove B2B settings block (`store_mode`, `b2b_*`)
- [x] `AdminUsers.tsx` → remove `buyer` role option, `companyId` selector, `tier` field
- [x] `AdminProducts.tsx` → remove wholesale/MOQ fields (WhatsApp collapsible kept)
- [x] `AdminProductVariants.tsx` → remove wholesale field
- [x] `StoreHeader.tsx` → remove "Get Bulk Quote" CTA (prior session)
- [x] `QuickViewModal.tsx` → remove wholesale/MOQ display (prior session)
- [x] `GlobalEnquiryModal.tsx` → generic contact (prior session)
- [x] `robots.ts` → drop `/portal`
- [x] `AdminMenus.tsx` → remove "Buyer Portal" link
- [x] `ProductsPage.tsx` / `StickyCtaBar.tsx` / `catalogue/[slug]` → rephrase B2B copy to B2C retail
- [x] `AdminLogin.tsx` → remove "Register as B2B Partner" link

## Phase 3 — API & lib cleanup

- [x] Delete `src/app/api/companies/route.ts` (+ `[id]`)
- [x] Delete `src/app/api/quotes/route.ts` (+ `[id]`)
- [x] Delete `src/app/api/admin/quotes/route.ts` (+ `[id]`)
- [x] `enquiries/*` → generic contact only
- [x] `dashboard/stats/route.ts` → drop `quoteStats` (rfqCount also removed; charts updated)
- [x] `export/route.ts` → drop company columns (prior session)
- [x] `email.ts` → drop company fields in enquiry emails
- [x] `users/*` and `users/[id]/*` → drop `companyId`/`tier`
- [x] `pricing.ts` → remove `calculateTieredPrice`/`TIER_DISCOUNTS`, keep `formatPrice`
- [x] `store.ts` → remove `tier`/`companyName` from `auth.user` type (prior session)
- [x] `AdminDashboardHome.tsx` → remove quote stat cards
- [x] `DashboardCharts.tsx` → rfqCount → total enquiries
- [x] `AdminEnquiries.tsx` → remove "Create Quote" flow + B2B-company portions
- [x] `AdminActivityLog.tsx` → unchanged (no B2B-specific filter)
- [x] `admin/backup/route.ts` → drop productTiers/companies/quotes from export+restore
- [x] `lib/migrations/woocommerce.ts` → fix Media upsert + categoryId typing
- [x] `import/woocommerce/users/route.ts` → role `buyer` → `customer`
- [x] `page-blocks.ts` → rephrase B2B marketing copy

## Phase 4 — Verify

- [x] `npx prisma generate` (done in Phase 0; client v6.11.1)
- [x] `npx tsc --noEmit` passes
- [x] `npm run lint` passes on all B2B-touched files (project has pre-existing `react-hooks/set-state-in-effect` errors elsewhere, unrelated to B2B)
- [ ] `npm run build` — BLOCKED: no live DB + pre-existing project-wide lint errors (see note)
- [ ] Manual smoke: register → verify email → login → add address → add to cart → checkout → view orders

> Note: `npm run build` cannot be verified here — there is no live database to run `prisma db push`, and the repo has many pre-existing `react-hooks/set-state-in-effect` ESLint errors across non-B2B files that fail the build's lint gate. The B2C refactor itself is complete: `tsc` is clean and all B2B-touched files lint clean.

## E-Commerce features

Provide complete, production-ready code for:
Use zustand state management ,

- [ ] NextAuth.js configuration (with OTP, social login, and role-based access).
- [ ] OTP login flow (SMS/email).
- [ ] Product, category, and blog CRUD APIs.
- [ ] Shopping cart and wishlist logic (client-side + server-side).
- [ ] Checkout flow (multi-step, payment integration).
- [ ] Order management (status updates, invoices).
- [ ] CSV/Excel import/export for products.
- [ ] Admin dashboard (analytics, product/category/blog management).
- [ ] User dashboard (profile, orders, wishlist).
- [ ] Security middleware (rate limiting, CSRF, input validation).
- [ ] Email/SMS notifications (order updates, OTP, etc.).
- [ ] SEO optimization (meta tags, sitemap, schema markup).
- [x] Create Popup feature
- [ ] Discounts, coupons

Make sure all should working properly, cache and other things
