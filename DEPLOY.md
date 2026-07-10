# ===========================================
# StyleStore CMS — Production Deployment Guide
# ===========================================

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env — set JWT_SECRET (openssl rand -hex 32) and DATABASE_URL

# 3. Initialize database
npx prisma db push
npx tsx prisma/seed.ts

# 4. Build for production
npm run build

# 5. Start server
npm run start
# Server runs on http://localhost:3000
```

## Default Login Credentials

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@store.com    | admin123  |
| Clerk | clerk@store.com    | clerk123  |

**IMPORTANT:** Change these passwords immediately after first login via Admin > Change Password.

## Production Checklist

### Required
- [ ] Generate a strong `JWT_SECRET` (`openssl rand -hex 32`)
- [ ] Update `NEXT_PUBLIC_SITE_URL` to your actual domain
- [ ] Change default admin password
- [ ] Set up SMTP email credentials (for enquiry notifications)

### Recommended
- [ ] Use PostgreSQL instead of SQLite (better concurrency)
- [ ] Set up reverse proxy (Caddy/Nginx) with SSL
- [ ] Configure automated database backups
- [ ] Set up monitoring (health check at `/api/health`)

### Optional
- [ ] Connect to CDN for static assets
- [ ] Set up Google Analytics / Facebook Pixel via Admin > Settings
- [ ] Configure social media links via Admin > Settings

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | Database connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration (e.g., `1d`, `7d`, `30d`) |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Public site URL for SEO |
| `SMTP_HOST` | No | — | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP server port |
| `SMTP_USER` | No | — | SMTP username |
| `SMTP_PASS` | No | — | SMTP password |
| `EMAIL_FROM` | No | `noreply@store.com` | Sender email address |

## API Endpoints (51 total)

### Public (No Auth)
- `GET /api/health` — Health check
- `GET /api/products` — Product listing
- `GET /api/categories` — Category listing
- `GET /api/banners` — Banner listing
- `GET /api/blog` — Blog listing
- `GET /api/content-pages` — Content pages
- `GET /api/settings` — Site settings
- `GET /api/seo/sitemap` — XML sitemap
- `GET /api/seo/robots` — robots.txt
- `POST /api/enquiries` — Submit enquiry
- `POST /api/contact` — Contact form
- `POST /api/auth/login` — Admin login
- `POST /api/auth/forgot-password` — Password reset request
- `POST /api/auth/reset-password` — Password reset
- `POST /api/newsletter/subscribe` — Newsletter subscription

### Admin (Auth Required)
All other endpoints require `Authorization: Bearer <token>` header.

## Docker Deployment

```bash
# Build
docker build -t stylestore .

# Run
docker run -d \
  -p 3000:3000 \
  -e JWT_SECRET=$(openssl rand -hex 32) \
  -e DATABASE_URL=file:/app/db/custom.db \
  -v stylestore-db:/app/db \
  stylestore
```

## Reverse Proxy (Caddy)

```
your-domain.com {
    reverse_proxy localhost:3000
}
```

## Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Migration (SQLite to PostgreSQL)

1. Export data from SQLite
2. Update `DATABASE_URL` in `.env` to PostgreSQL connection string
3. Update `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`
4. Run `npx prisma db push`
5. Re-seed: `npx tsx prisma/seed.ts`

## Monitoring

- **Health Check:** `GET /api/health` → `{ status: "ok", uptime: ..., version: "..." }`
- **Rate Limiting:** Applied to login (5/15min), contact (10/hr), enquiries (10/hr), upload (20/hr)
- **Security Headers:** HSTS, X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy
