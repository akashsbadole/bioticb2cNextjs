# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Standardized API response helpers (`src/lib/api-response.ts`): `ok`, `created`, `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `tooManyRequests`, `serverError`.
- Newsletter confirmation email (`sendNewsletterConfirmation`) wired into the subscribe route.
- Low stock alert email template (`sendLowStockAlert`) for admin notifications.
- Quote notification email template (`sendQuoteNotification`) for the B2B RFQ workflow.
- `CONTRIBUTING.md` with code style, commit conventions, PR process, testing, and branch naming.

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
