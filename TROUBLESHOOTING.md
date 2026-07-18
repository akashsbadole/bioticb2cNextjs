# WCommerce Catalogue — Troubleshooting Guide

## Table of Contents

1. [Database Connection Errors](#database-connection-errors)
2. [JWT / Authentication Issues](#jwt--authentication-issues)
3. [Image Upload Failures](#image-upload-failures)
4. [Payment Gateway Errors](#payment-gateway-errors)
5. [Email Sending Problems](#email-sending-problems)
6. [Build & Deployment Failures](#build--deployment-failures)
7. [Performance Issues](#performance-issues)
8. [Common Admin Issues](#common-admin-issues)

---

## Database Connection Errors

### "Can't reach database server"

**Causes:**
- PostgreSQL service not running
- Wrong `DATABASE_URL` in `.env`
- Firewall blocking the port (default 5432)
- Connection pool exhausted

**Solutions:**

```bash
# 1. Verify PostgreSQL is running
sudo systemctl status postgresql

# 2. Test connection directly
psql "$DATABASE_URL"

# 3. Check connection pool limits
# Reduce DATABASE_CONNECTION_LIMIT if using serverless (set to 5)

# 4. Verify .env is loaded
node -e "console.log(process.env.DATABASE_URL)"
```

### "Can't reach database server"

**Causes:**
- PostgreSQL service not running
- Wrong `DATABASE_URL` in `.env`
- Firewall blocking port 5432
- Connection pool exhausted (reduce `DATABASE_CONNECTION_LIMIT`)

**Solutions:**

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection directly
psql "$DATABASE_URL"

# Verify .env is loaded
node -e "console.log(process.env.DATABASE_URL)"
```

### "PrismaClientInitializationError"

**Causes:**
- Invalid `DATABASE_URL` format
- Database server unreachable
- Missing database (run `npx prisma db push` first)

**Solutions:**

```bash
# Verify connection string format
# SQLite: file:./dev.db
# PostgreSQL: postgresql://user:password@host:5432/dbname

# Push schema to database
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

## JWT / Authentication Issues

### "Invalid token" or "Token expired"

**Causes:**
- Token expired (default 7 days)
- `JWT_SECRET` changed after token issuance
- Token tampered with
- Session revoked by admin

**Solutions:**

```bash
# 1. Clear cookies and re-login
# 2. Verify JWT_SECRET hasn't changed
# 3. Check token expiry in JWT_EXPIRES_IN
# 4. If session was revoked, login again to create a new session
```

### "Cannot read properties of undefined (reading 'JWT_SECRET')"

**Cause:** `JWT_SECRET` or `AUTH_SECRET` not set in `.env`.

**Solution:** Add to `.env`:

```bash
JWT_SECRET=$(openssl rand -hex 32)
AUTH_SECRET=$(openssl rand -hex 32)
```

### "Invalid token" after login

**Causes:**
- Token expired (default 7 days)
- `JWT_SECRET` changed after token issuance
- Token tampered with
- Session revoked by admin

**Solutions:**
- Clear cookies and re-login
- Verify `JWT_SECRET` hasn't changed between sessions
- Check if session was revoked via admin panel

## Image Upload Failures

### "File too large"

**Cause:** Upload exceeds the 5MB limit.

**Solution:** Resize images before uploading or increase the limit in middleware.

### "Invalid file type"

**Cause:** Uploaded file is not an allowed image format.

**Solution:** Use JPEG, PNG, WebP, or GIF files.

### "Upload failed: disk full"

**Cause:** Server disk is full.

**Solution:** Free up disk space or increase storage allocation.

### Images not displaying after upload

**Causes:**
- File path incorrect in database
- Upload directory not writable
- Reverse proxy not configured for static files

**Solutions:**

```bash
# Check upload directory permissions
ls -la public/uploads/
# Should be writable by the web server user

# Verify the file exists
ls -la public/uploads/your-image.jpg

# Check the URL path in the database
# Images should be served from /uploads/filename
```

## Payment Gateway Errors

### PayU hash mismatch

**Cause:** Incorrect `PAYU_MERCHANT_KEY`, `PAYU_MERCHANT_SALT`, or hash generation.

**Solutions:**
- Verify `PAYU_MERCHANT_KEY` and `PAYU_MERCHANT_SALT` in `.env`
- Check that the hash generation in `src/lib/payments/payu.ts` matches PayU's expected format
- Enable PayU test mode for sandbox testing

### Payment callback not received

**Causes:**
- Webhook URL not configured in PayU dashboard
- Firewall blocking incoming requests
- Incorrect callback URL format

**Solutions:**
- Verify the callback URL is `https://your-domain.com/api/payments/payu/callback`
- Check PayU dashboard for webhook configuration
- Review server logs for incoming POST requests

## Image Upload Failures

### "File too large"

**Cause:** Upload exceeds the 5MB limit.

**Solution:** Resize images before uploading or increase the limit in middleware configuration.

### "Invalid file type"

**Cause:** Uploaded file is not an allowed image format.

**Solution:** Use JPEG, PNG, WebP, or GIF files.

### "Upload failed: disk full"

**Cause:** Server disk is full.

**Solution:** Free up disk space or increase storage allocation.

### Images not displaying

**Causes:**
- File path incorrect in database
- Upload directory not writable
- Reverse proxy not configured for static files

**Solutions:**

```bash
# Check upload directory
ls -la public/uploads/

# Verify file exists
ls -la public/uploads/your-image.jpg

# Check permissions
chmod -R 755 public/uploads/
```

## Payment Gateway Errors

### PayU hash mismatch

**Cause:** Incorrect `PAYU_MERCHANT_KEY` or `PAYU_MERCHANT_SALT` in `.env`.

**Solutions:**
- Verify both values match your PayU merchant dashboard
- Check hash generation in `src/lib/payments/payu.ts` matches PayU's expected format
- Enable PayU test mode for sandbox testing

### Payment callback not received

**Causes:**
- Webhook URL not configured in PayU dashboard
- Firewall blocking incoming requests
- Incorrect callback URL format

**Solutions:**
- Verify callback URL is `https://your-domain.com/api/payments/payu/callback`
- Check PayU dashboard for webhook configuration
- Review server logs for incoming POST requests

## Email Sending Problems

### Emails not being sent

**Causes:**
- SMTP credentials incorrect or missing
- SMTP server blocking connections
- Firewall blocking port 587/465
- Email marked as spam

**Solutions:**

```bash
# 1. Verify SMTP settings in .env
# 2. Test SMTP connection manually
node -e "
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
t.verify().then(console.log).catch(console.error);
"

# 3. Check health endpoint
curl https://your-domain.com/api/health
# Look for email status
```

### "Email configuration not set"

**Cause:** SMTP credentials missing in `.env`.

**Solution:** Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` to `.env`.

### Emails going to spam

**Solutions:**
- Set up SPF, DKIM, and DMARC DNS records for your sending domain
- Use a transactional email service (SendGrid, Mailgun, AWS SES)
- Avoid spammy subject lines and content

## Build & Deployment Failures

### Build fails with "Module not found"

**Causes:**
- Missing dependency
- Incorrect import path
- Prisma client not generated

**Solutions:**

```bash
# Clean install
rm -rf node_modules .next
npm install

# Regenerate Prisma client
npx prisma generate

# Rebuild
npm run build
```

### "PrismaClientInitializationError" at runtime

**Causes:**
- Invalid `DATABASE_URL` format
- Database server unreachable
- Missing database (run `npx prisma db push` first)

**Solutions:**

```bash
# Verify connection string format
# SQLite: file:./dev.db
# PostgreSQL: postgresql://user:password@host:5432/dbname

# Push schema to database
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

### Build fails with TypeScript errors

**Causes:**
- Type mismatch in API routes
- Missing type definitions
- Prisma client not generated

**Solutions:**

```bash
# Regenerate Prisma client
npx prisma generate

# Run type check
npx tsc --noEmit

# Fix any type errors, then rebuild
npm run build
```

## Performance Issues

### Slow page loads

**Causes:**
- No caching layer
- N+1 database queries
- Unoptimized images
- Large bundle size

**Solutions:**
- Enable ISR for product pages (already configured in `next.config.ts`)
- Use `next/image` for automatic image optimization (already in use)
- Verify database indexes are applied (see schema)
- Consider adding Redis for session/data caching
- Enable CDN for static assets

### High memory usage

**Causes:**
- Connection pool too large for serverless
- Memory leak in long-running processes
- Large image uploads

**Solutions:**
- Reduce `DATABASE_CONNECTION_LIMIT` to 5 for serverless
- Monitor with `GET /api/health` (reports `memory.heapUsedMB`)
- Restart periodically if running on a VM

## Build & Deployment Failures

### Build fails with "PrismaClientInitializationError"

**Causes:**
- Invalid `DATABASE_URL` format
- Database server unreachable at build time
- Missing database (run `npx prisma db push` first)

**Solutions:**

```bash
# Verify connection string
# SQLite: file:./dev.db
# PostgreSQL: postgresql://user:password@host:5432/dbname

# Push schema to database
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```

### Build fails with TypeScript errors

**Causes:**
- Type mismatch in API routes
- Missing type definitions
- Prisma client not generated

**Solutions:**

```bash
# Regenerate Prisma client
npx prisma generate

# Run type check
npx tsc --noEmit

# Fix any type errors, then rebuild
npm run build
```

### "Cannot find module 'prisma/client'"

**Cause:** Prisma client not generated after schema changes.

**Solution:**

```bash
npx prisma generate
```

## Image Upload Failures

### "File too large"

**Cause:** Upload exceeds the 5MB limit.

**Solution:** Resize images before uploading or increase the limit in middleware.

### "Invalid file type"

**Cause:** Uploaded file is not an allowed image format.

**Solution:** Use JPEG, PNG, WebP, or GIF files.

### "Upload failed: disk full"

**Cause:** Server disk is full.

**Solution:** Free up disk space or increase storage allocation.

## Build & Deployment Failures

### Build fails with "Module not found: Can't resolve 'prisma/client'"

**Cause:** Prisma client not generated.

**Solution:**

```bash
npx prisma generate
npm run build
```

### Build fails with TypeScript errors

**Causes:**
- Type mismatch in API routes
- Missing type definitions
- Prisma client not generated

**Solutions:**

```bash
# Regenerate Prisma client
npx prisma generate

# Run type check
npx tsc --noEmit

# Fix any type errors, then rebuild
npm run build
```

### Docker build fails

**Causes:**
- Missing Dockerfile
- Incorrect base image
- Prisma client not generated during build

**Solutions:**

```bash
# Ensure Dockerfile exists in project root
# Build with --no-cache if dependencies changed
docker build --no-cache -t wcommerce .

# Verify Dockerfile includes prisma generate step
```

## Performance Issues

### Slow page loads

**Causes:**
- No caching layer
- N+1 database queries
- Unoptimized images
- Large bundle size

**Solutions:**
- Verify database indexes are applied (Product: `isActive`, `isFeatured`, `categoryId`, `price`, `createdAt`; Order: `status`, `paymentStatus`)
- Use `next/image` for automatic image optimization (already configured)
- Enable CDN for static assets
- Consider adding Redis for session/data caching

### High database CPU usage

**Causes:**
- Missing indexes on queried columns
- Large result sets without pagination
- Connection pool exhaustion

**Solutions:**

```bash
# Verify indexes are applied
npx prisma db push

# Check for slow queries in logs
# Reduce connection pool size for serverless
# Set DATABASE_CONNECTION_LIMIT=5
```

## Common Admin Issues

### CMS blocks appear empty in admin

**Cause:** Double-stringified JSON in page content blocks.

**Solution:** The admin page builder now handles nested JSON. If blocks still appear empty, try:
1. Open the block in JSON editor mode
2. Verify the JSON structure is valid
3. Save and reload

### "Session expired" or "Please login again"

**Causes:**
- JWT token expired (default 7 days)
- Session revoked by admin
- Browser cookies cleared

**Solutions:**
- Login again to create a new session
- Check if an admin revoked your sessions
- Verify browser cookies are not blocked

### Changes not reflecting on storefront

**Causes:**
- Browser cache (hard refresh with Ctrl+Shift+R)
- CDN cache (wait for TTL or purge)
- ISR cache (Next.js Incremental Static Regeneration)

**Solutions:**
- Hard refresh the browser
- Wait for cache TTL (60 seconds for API responses)
- Trigger a revalidation by visiting the admin page

## Performance Issues

### Slow page loads

**Causes:**
- No caching layer
- N+1 database queries
- Unoptimized images
- Large bundle size

**Solutions:**
- Verify database indexes are applied
- Use `next/image` for automatic image optimization (already in use)
- Consider adding Redis for session/data caching
- Enable CDN for static assets

### High memory usage

**Causes:**
- Connection pool too large for serverless
- Memory leak in long-running processes

**Solutions:**
- Reduce `DATABASE_CONNECTION_LIMIT` to 5 for serverless
- Monitor with `GET /api/health` (reports `memory.heapUsedMB`)
- Restart periodically if running on a VM
