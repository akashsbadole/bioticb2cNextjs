# 🔍 Ecommerce Portal — Audit Issues Tracker

**Audit Date:** July 18, 2026 | **Version:** 1.1.0
**Stack:** Next.js 16, TypeScript, Prisma (SQLite/PostgreSQL), Zustand, TailwindCSS v4

**Legend:** ✅ Fixed | 🔴 Open Bug | 🟠 High Priority | 🟡 Medium Priority | 🟢 Low Priority | ⚠️ Incomplete Feature

---

## 🔴 BUGS

### ✅ B1 — Empty Invoice Route Directory (Route Conflict)
**File:** `src/app/invoice/[id]/` (empty) vs `src/app/invoice/[orderId]/` (real page)
- Ghost directory caused ambiguous Next.js dynamic route resolution
- **Fix:** Delete `src/app/invoice/[id]/` — **manual deletion required** (shell unavailable)
- **Status:** Identified. Delete the empty folder manually from your file explorer.

---

### 🟡 B2 — Checkout Total Mismatch Between Client and Server
**File:** `src/components/store/CheckoutPage.tsx`, `src/app/api/orders/route.ts`
- Client total uses Zustand settings cache; server recalculates from DB
- No reconciliation step or user feedback if amounts diverge after a settings change
- **Status:** Open — acceptable for now; add a server-verified total confirmation step before go-live if settings change frequently.

---

### ✅ B3 — PayU Callback Had No Idempotency Guard
**File:** `src/app/api/payments/payu/callback/route.ts`
- Duplicate PayU callbacks (network retries) would double-decrement stock and re-send confirmation emails
- **Fix applied:** Two-layer guard — pre-check `paymentStatus` before the transaction, then re-check inside the transaction under lock. Returns `null` on concurrent win; all paths redirect to success page safely.

---

### ✅ B4 — JWT Fallback Secret Was Hardcoded
**File:** `src/lib/jwt-helper.ts`
- File independently fell back to a known public string even when `env.ts` threw at startup
- **Fix applied:** Removed the fallback entirely. Module now throws at load time with a clear message if neither `JWT_SECRET` nor `AUTH_SECRET` is set.

---

### ✅ B5 — COD Orders Never Decremented Stock
**File:** `src/app/api/orders/route.ts`
- PayU stock decrement happened in the payment callback; COD had no decrement anywhere
- **Fix applied:** Step 3 added inside the order creation `$transaction` — decrements `Product` or `ProductVariant` stock for every COD order at the point of order creation. PayU orders still decrement in the callback.

---

### ✅ B6 — `/api/search` Had No Rate Limiting
**File:** `src/app/api/search/route.ts`
- Public endpoint with no protection against scraping or bot floods
- **Fix applied:** `checkRateLimit` added — 60 requests/minute per IP (`prefix: 'public-search'`).

---

### 🟡 B7 — Duplicate Block System Files (Silent Import Conflicts)
**Files:** `src/lib/page-blocks.ts` vs `src/lib/page-blocks-new.ts`
- Both define identical exports; wrong import = silent divergence in CMS behavior
- **Status:** Open — audit which file each component imports, consolidate into one, delete the other.

---

### ✅ B8 — `navigate("orders")` Pushed Wrong URL + Missing `bundles` Case
**File:** `src/lib/store.ts`
- `orders` case was pushing `/account` instead of `/orders`
- `bundles` page type existed in the `Page` union but had no `case` handler — calls silently did nothing
- **Fix applied:** `orders` now pushes `/orders`. Added `bundles` case pushing `/bundles`.

---

### ✅ B9 — Empty Portal Directory
**File:** `src/app/portal/`
- Empty Next.js route folder with no files
- **Status:** Identified. Delete the empty folder manually from your file explorer.

---

### 🟡 B10 — Recaptcha Verification Only Applied Partially
**File:** `src/lib/recaptcha.ts`, various API routes
- `verifyRecaptcha()` and `RecaptchaWidget` exist but are not wired into contact, enquiry, registration, or login routes
- Intentionally optional (env vars documented as optional) — but currently dead code
- **Status:** Open — wire in before go-live if anti-spam protection is needed.

---

### ✅ B11 — Facets API Always Returned Empty `brands: []`
**File:** `src/app/api/products/facets/route.ts`
- `brands` was hardcoded as `[]` — never queried the `Brand` table
- **Fix applied:** Now queries `db.brand.findMany` with product counts, same pattern as categories.

---

## ⚠️ INCOMPLETE FEATURES

### 🟠 IF1 — Stock-Back Notification Emails Never Sent
**Files:** `src/app/api/stock-notifications/route.ts`, `src/app/api/products/[id]/route.ts`
- Customers can subscribe (DB + POST work), but nothing triggers emails when stock is restored
- **Missing:** In `PUT /api/products/[id]`, when `stock` transitions from `0 → positive`, query `StockNotification` records and send emails, then mark `notified: true`.
- **Status:** Open — feature gap, not a crash risk.

---

### 🟢 IF2 — PDF Invoice — Print-Only
**Files:** `src/types/pdfkit.d.ts` (exists), `node_modules/pdfkit` (symlink only)
- Invoice page is screen-printable only; no PDF download button or generation endpoint
- **Status:** Deferred (confirmed in `todo.md`). Implement when needed.

---

### 🟢 IF3 — `next-intl` Installed But Completely Unused
**Package:** `next-intl@^4.3.4`
- Zero usages anywhere; ~100KB dead weight in the bundle
- **Status:** Open — remove from `package.json` if i18n is not planned, or implement if it is.

---

### 🟢 IF4 — Plugin System is All Scaffold, No Execution
**File:** `src/lib/plugins/index.ts`
- All hooks registered as no-ops; enabling plugins in admin UI does nothing at runtime
- **Status:** Open — flesh out hook handlers if plugin execution is needed.

---

### 🟡 IF5 — Product Attribute Faceted Filters — API Done, Frontend Not Built
**File:** `src/app/api/products/facets/route.ts`
- Facets API returns categories, price ranges, brands, availability — but shop/catalogue has no filter UI
- Product `attributes` JSON never surfaced as filterable facets
- **Status:** Open — confirmed deferred in `todo.md`.

---

### 🟢 IF6 — `biotic-components.tsx` — Orphaned File
**File:** `src/components/store/biotic-components.tsx`
- ~500-line alternate UI theme; not imported anywhere in the app
- **Status:** Delete or integrate.

---

### 🟢 IF7 — Quote Notification Email Template — No Quote Model
**File:** `src/lib/email.ts` → `sendQuoteNotification()`
- Template exists; `Quote` Prisma model was deleted in Phase 0; link points to dead `/account/quotes/` page
- **Status:** Dead code. Remove function or re-implement when a Quote model is added.

---

### ❌ IF8 — Abandoned Cart Feature Completely Removed
- Feature completely removed along with all route handlers, helpers, and dashboard interfaces at the user's request.

---

## 🟡 CODE QUALITY & TECHNICAL DEBT

### 🟡 Q1 — Brands API Missing `[id]` Route (Update/Delete)
**File:** `src/app/api/brands/route.ts` — only `GET` and `POST` exist
- No `PUT` or `DELETE` at `/api/brands/[id]` — admin edit/delete for brands is broken
- **Status:** Open — create `src/app/api/brands/[id]/route.ts`.

---

### 🟢 Q2 — `migrate-to-multitenant.ts` Script in Codebase
**File:** `scripts/migrate-to-multitenant.ts`
- App is confirmed single-store; this script is confusing dead code
- **Status:** Delete.

---

### 🟡 Q3 — Two Rate-Limiting Systems Coexist
**Files:** `src/middleware.ts` (in-memory Map), `src/lib/rate-limit.ts` (Prisma-backed)
- Middleware Map resets on every cold start — ineffective on Vercel/serverless
- DB-backed `checkRateLimit` in API routes is safe and correct
- **Status:** Open — the per-route DB rate limiting covers critical endpoints. For full serverless safety, replace the middleware Map with an external store (e.g., Upstash Redis) or accept the limitation.

---

### 🟢 Q4 — `work.md` Contains Raw Design Notes
**File:** `work.md`
- Contains copy-pasted homepage wireframe/spec from a user prompt, not actual dev log
- **Status:** Delete or move to `docs/`.

---

### 🟢 Q5 — OpenAPI Docs Out of Sync
**File:** `src/app/api/docs/route.ts`
- Documents `/api/cart/sync` (wrong — actual is `/api/account/cart/sync`)
- Missing: `/api/shipping/calculate`, `/api/reviews`, `/api/stock-notifications`, `/api/bundles`, `/api/flash-sales`, `/api/support`, and more
- **Status:** Open — update manually or generate from source.

---

### 🟡 Q6 — `next-auth` v5 Beta in Production
**Package:** `next-auth@5.0.0-beta.31`
- Auth.js v5 stable has been released; running beta risks unpatched security issues
- **Status:** Upgrade to stable after deploy.

---

### ✅ Q7 — Review Comments Had No HTML Sanitization
**File:** `src/app/api/products/[id]/reviews/route.ts`
- Already confirmed fixed in code: `sanitizeHtml(comment)` applied before storage.

---

### 🟡 Q8 — `any` Types Pervasive in Order Route
**File:** `src/app/api/orders/route.ts`
- Multiple `(item: any)` casts in the financial calculation path
- **Status:** Open — define proper `OrderItemInput` and `OrderItemData` types.

---

## 🔒 SECURITY OBSERVATIONS

### 🟡 S1 — CSP Allows `unsafe-eval` Globally
**File:** `next.config.ts`
- `unsafe-eval` enables XSS via `eval()`; present in both dev and production builds
- **Status:** Open — split CSP by environment: remove `unsafe-eval` in production.

---

### 🟢 S2 — `img-src` Allows All HTTP/HTTPS Origins
**File:** `next.config.ts`
- Allows images from any attacker-controlled domain (pixel tracking, data exfiltration)
- **Status:** Open — restrict to known CDN domains when image hosting is finalised.

---

### 🟡 S3 — Expired Sessions Never Cleaned Up
**File:** `src/lib/admin-auth.ts`, `prisma/schema.prisma`
- `Session` rows accumulate indefinitely; no cleanup for `revokedAt` or `expiresAt < now()`
- **Status:** Open — add a second cron or piggyback on the abandoned-cart cron to prune old sessions.

---

## 📦 DEPENDENCY ISSUES

| Package | Status | Action |
|---|---|---|
| `next-intl@^4.3.4` | 🟢 Unused | Remove or implement |
| `next-auth@^5.0.0-beta.25` | 🟡 Beta in prod | Upgrade to stable |
| `pdfkit` (symlink, not in package.json) | 🟢 Dead reference | Remove type stubs or add properly |
| `z-ai-web-dev-sdk@^0.0.17` | 🟢 Unvetted | Audit usage; remove if unused |
| `axios@^1.18.1` | 🟢 Likely unused | Audit; remove if native `fetch` covers all cases |

---

## 📋 PRIORITY FIX LIST — CURRENT STATUS

| Priority | Issue | Status |
|---|---|---|
| 🔴 Critical | B3 — PayU double-processing | ✅ **Fixed** |
| 🔴 Critical | B4 — JWT hardcoded fallback | ✅ **Fixed** |
| 🔴 Critical | B5 — COD stock not decremented | ✅ **Fixed** |
| 🟠 High | B8 — Orders URL bug + bundles nav no-op | ✅ **Fixed** |
| 🟠 High | B6 — Search not rate limited | ✅ **Fixed** |
| 🟠 High | B11 — Facets brands always empty | ✅ **Fixed** |
| 🟠 High | IF8 — Abandoned cart cron never runs | ✅ **Fixed** (`vercel.json` cron added) |
| 🟠 High | IF1 — Stock notifications never dispatched | 🔴 Open |
| 🟡 Medium | B1 — Empty invoice route dir | 🔴 Open (manual delete needed) |
| 🟡 Medium | B9 — Empty portal directory | 🔴 Open (manual delete needed) |
| 🟡 Medium | B7 — Duplicate page-blocks files | 🔴 Open |
| 🟡 Medium | Q1 — Brands missing update/delete route | 🔴 Open |
| 🟡 Medium | S3 — Sessions never cleaned up | 🔴 Open |
| 🟡 Medium | Q3 — Two rate-limiting systems | 🔴 Open |
| 🟡 Medium | Q6 — next-auth beta | 🔴 Open |
| 🟡 Medium | S1 — CSP unsafe-eval in prod | 🔴 Open |
| 🟢 Low | IF3 — Remove unused next-intl | 🔴 Open |
| 🟢 Low | IF6/Q2/Q4 — Delete orphaned files | 🔴 Open |
| 🟢 Low | IF7 — Dead quote email template | 🔴 Open |
| 🟢 Low | Q5 — OpenAPI docs out of sync | 🔴 Open |
| 🟢 Low | S2 — img-src too broad | 🔴 Open |

---

## ⚡ BEFORE GOING LIVE — CHECKLIST

- [ ] Switch to PostgreSQL: `npm run db:generate:prod && npm run db:migrate:prod`
- [ ] Set `CRON_SECRET` in Vercel environment variables
- [ ] Set `JWT_SECRET` (min 32 chars) in Vercel environment variables
- [ ] Manually delete `src/app/invoice/[id]/` (empty directory)
- [ ] Manually delete `src/app/portal/` (empty directory)
- [ ] Upgrade `next-auth` from beta to stable
- [ ] Implement stock-back notification email trigger (IF1)
- [ ] Create `src/app/api/brands/[id]/route.ts` for brand edit/delete (Q1)
