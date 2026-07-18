# WCommerce Catalogue — Production Deployment Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Platform Guides](#platform-guides)
   - [Vercel](#vercel)
   - [Docker Compose](#docker-compose)
   - [AWS EC2](#aws-ec2)
   - [DigitalOcean App Platform](#digitalocean-app-platform)
6. [Reverse Proxy & SSL](#reverse-proxy--ssl)
7. [Database Migration (SQLite to PostgreSQL)](#database-migration-sqlite-to-postgresql)
8. [CI/CD Integration](#cicd-integration)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Production Checklist](#production-checklist)

---

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

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **PostgreSQL** 14+ (recommended for production) or SQLite (dev only)
- **Git** (for CI/CD workflows)

## Environment Configuration

Copy `.env.example` to `.env` and configure:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL or SQLite connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret (min 32 chars, generate with `openssl rand -hex 32`) |
| `AUTH_SECRET` | Yes | — | Auth encryption secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Public site URL for SEO/canonical |
| `SMTP_HOST` | No | — | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP server port |
| `SMTP_USER` | No | — | SMTP username |
| `SMTP_PASS` | No | — | SMTP password |
| `EMAIL_FROM` | No | `noreply@store.com` | Sender email address |
| `DATABASE_CONNECTION_LIMIT` | No | `10` | Connection pool size |
| `DATABASE_QUERY_TIMEOUT_MS` | No | `10000` | Query timeout in ms |
| `BACKUP_URL` | No | — | Backup export endpoint URL |
| `BACKUP_TOKEN` | No | — | Backup auth token |
| `BACKUP_DIR` | No | `./backups` | Backup output directory |
| `BACKUP_KEEP` | No | `30` | Number of backups to retain |

## Platform Guides

### Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

**Environment Variables** — set in Vercel Dashboard > Project > Settings > Environment Variables:

- `DATABASE_URL` — PostgreSQL connection string (use a managed Postgres like Neon, Supabase, or AWS RDS)
- `JWT_SECRET` — `openssl rand -hex 32`
- `AUTH_SECRET` — `openssl rand -hex 32`
- `NEXT_PUBLIC_SITE_URL` — your production domain
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` — email credentials

**Build Settings:**

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

**Notes:**
- The app uses `output: "standalone"` in `next.config.ts` for production, which Vercel handles automatically.
- SQLite is not supported on Vercel (ephemeral filesystem). Use PostgreSQL (Neon, Supabase, or AWS RDS).
- Set `DATABASE_CONNECTION_LIMIT=5` for serverless to avoid connection pool exhaustion.

### Docker Compose

Create a `docker-compose.yml` in the project root:

```yaml
version: "3.8"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/wcommerce
      - JWT_SECRET=${JWT_SECRET}
      - AUTH_SECRET=${AUTH_SECRET}
      - NEXT_PUBLIC_SITE_URL=https://your-domain.com
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - EMAIL_FROM=${EMAIL_FROM}
      - DATABASE_CONNECTION_LIMIT=10
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: wcommerce
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata:
```

**Run:**

```bash
docker compose up -d
```

### AWS EC2

**Prerequisites:** Ubuntu 22.04+ instance, Node.js 18+, PostgreSQL, Nginx.

```bash
# 1. SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# 2. Install dependencies
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs postgresql nginx certbot python3-certbot-nginx git

# 3. Clone and setup
git clone https://github.com/your-org/wcommerce.git /opt/wcommerce
cd /opt/wcommerce
cp .env.example .env
npm install

# 4. Build
npm run build

# 5. Setup systemd service
sudo tee /etc/systemd/system/wcommerce.service << 'EOF'
[Unit]
Description=WCommerce Catalogue
After=network.target

[Service]
Type=exec
User=www-data
WorkingDirectory=/opt/wcommerce
ExecStart=/usr/bin/node /opt/wcommerce/.next/standalone/server.js
Restart=always
Environment=NODE_ENV=production
EnvironmentFile=/opt/wcommerce/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now wcommerce

# 6. Setup Nginx reverse proxy (see Reverse Proxy section)
# 7. Setup SSL with Certbot
sudo certbot --nginx -d your-domain.com
```

### DigitalOcean App Platform

1. Create a **DigitalOcean App** from your GitHub repo.
2. Set **Runtime** to Node.js 20.
3. Configure environment variables in the dashboard (same as above).
4. Set **Build Command** to `npm run build`.
5. Set **Run Command** to `npm run start`.
6. Add a **PostgreSQL database** via DigitalOcean Managed Databases.
7. Enable **Health Checks** at `/api/health`.

## Reverse Proxy & SSL

### Caddy (Automatic HTTPS)

```
your-domain.com {
    reverse_proxy localhost:3000
}
```

Caddy automatically provisions and renews SSL certificates via Let's Encrypt.

### Nginx + Certbot

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

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

    location /_next/static {
        proxy_pass http://localhost:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

**SSL Setup:**

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

## Database Migration (SQLite to PostgreSQL)

### Prerequisites

- PostgreSQL 14+ installed and running
- A database created (`CREATE DATABASE wcommerce;`)

### Migration Steps

```bash
# 1. Export current SQLite data
npx tsx prisma/export-sqlite.ts

# 2. Update .env with PostgreSQL connection string
# DATABASE_URL=postgresql://user:password@host:5432/wcommerce

# 3. Switch schema provider
# Edit prisma/schema.prisma: change provider from "sqlite" to "postgresql"

# 4. Push schema to PostgreSQL
npx prisma db push

# 5. Import data
npx tsx prisma/import-postgres.ts

# 6. Verify
npx prisma db push --accept-data-loss
```

**Rollback Plan:**

```bash
# Keep the old SQLite file as backup
cp prisma/dev.db prisma/dev.db.bak

# To roll back, restore .env to SQLite URL and revert schema provider
```

## CI/CD Integration

The project includes `.github/workflows/ci.yml` which runs on push/PR to `main`/`master`/`develop`:

- `prisma generate` — validates Prisma schema
- `npm run lint` — ESLint
- `npx tsc --noEmit` — TypeScript type checking
- `npx vitest run` — Unit tests

**To add deployment automation:**

```yaml
# .github/workflows/deploy.yml (example for Vercel)
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring & Maintenance

### Health Check

`GET /api/health` returns:

```json
{
  "status": "ok",
  "uptime": 123456,
  "database": { "status": "ok", "latency_ms": 2 },
  "memory": { "heapUsedMB": 45, "heapTotalMB": 128 },
  "disk": { "status": "ok", "freeMB": 5120 },
  "email": { "status": "ok" }
}
```

### Automated Backups

```bash
# Run manually
npm run backup:automate

# Schedule via cron (daily at 2 AM)
0 2 * * * cd /opt/wcommerce && npm run backup:automate >> /var/log/wcommerce-backup.log 2>&1
```

### Logging

- Application logs: stdout/stderr (capture via systemd journal or Docker logs)
- Audit events: stored in `ActivityLog` database table (viewable via admin dashboard)
- Error events: stored in `ActivityLog` with `action: "error.*"` prefix

## Production Checklist

### Required
- [ ] Generate strong `JWT_SECRET` and `AUTH_SECRET` (`openssl rand -hex 32`)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your actual domain
- [ ] Change default admin password after first login
- [ ] Configure SMTP credentials for email notifications
- [ ] Use PostgreSQL (not SQLite) for production
- [ ] Set up SSL certificate

### Recommended
- [ ] Configure automated database backups via cron
- [ ] Set up monitoring (health check at `/api/health`)
- [ ] Configure CDN for static assets
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Enable database connection pooling (set `DATABASE_CONNECTION_LIMIT`)
- [ ] Configure reverse proxy (Caddy/Nginx) with rate limiting

### Optional
- [ ] Connect Google Analytics / Facebook Pixel via Admin > Settings
- [ ] Configure social media links via Admin > Settings
- [ ] Set up staging environment for pre-production testing
