FROM node:20-alpine AS base

# --- Dependencies ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# --- Build ---
FROM base AS builder
WORKDIR /app

# Public env vars are inlined at build time (Next.js NEXT_PUBLIC_*).
# Pass them via docker build args (docker-compose maps them from .env).
ARG NEXT_PUBLIC_SITE_NAME="Biotic Naturals"
ARG NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ARG NEXT_PUBLIC_SITE_DESCRIPTION="Authentic Ayurvedic wellness products"
ARG NEXT_PUBLIC_STORE_SLUG="vedika-ayurveda"
ARG NEXT_PUBLIC_PLATFORM_DOMAIN="wcommerce.com"
ARG DEFAULT_STORE_SLUG="vedika-ayurveda"
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_DESCRIPTION=$NEXT_PUBLIC_SITE_DESCRIPTION
ENV NEXT_PUBLIC_STORE_SLUG=$NEXT_PUBLIC_STORE_SLUG
ENV NEXT_PUBLIC_PLATFORM_DOMAIN=$NEXT_PUBLIC_PLATFORM_DOMAIN
ENV DEFAULT_STORE_SLUG=$DEFAULT_STORE_SLUG

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate the Prisma client for PostgreSQL (production schema)
RUN npx prisma generate --schema=prisma/schema.postgres.prisma
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Production ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
# Copy static assets
COPY --from=builder /app/.next/static ./.next/static
# Copy public assets
COPY --from=builder /app/public ./public
# Copy Prisma client (needed for middleware)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Uploads directory (persisted via a Docker volume)
RUN mkdir -p /app/public/uploads
RUN chown -R nextjs:nodejs /app/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
