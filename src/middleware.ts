import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const isAdminRoute = (req: NextRequest) =>
  req.nextUrl.pathname.startsWith("/admin") ||
  req.nextUrl.pathname.startsWith("/api/admin");

// ─── Rate Limiting (in-memory, Edge-compatible) ───

interface RateBucket {
  count: number;
  resetAt: number;
}
const rateBuckets = new Map<string, RateBucket>();
const RATE_WINDOW = 60 * 1000;

const AUTH_RATE_LIMIT = 20;
const API_RATE_LIMIT = 120;

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || req.headers.get("host") || "unknown";
}

function rateLimit(key: string, limit: number): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW });
    return { allowed: true, retryAfter: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

// ─── CSRF / Same-Origin Protection ───

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// ─── Default Store Resolution (single-store mode) ───
// The app is single-tenant: middleware always resolves to the one default
// store (slug from DEFAULT_STORE_SLUG, defaults to "main"). The ID is fetched
// once from an internal endpoint and cached for an hour.

let defaultStoreId: string | null = null;
let defaultStoreCacheExpiry = 0;
const DEFAULT_STORE_TTL = 60 * 60 * 1000;

async function resolveDefaultStoreId(): Promise<string | null> {
  const now = Date.now();
  if (defaultStoreId && defaultStoreCacheExpiry > now) {
    return defaultStoreId;
  }
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:3000`;
    const res = await fetch(`${baseUrl}/api/store/default`, {
      headers: { "x-internal-request": "true" },
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      defaultStoreId = data.id || null;
      defaultStoreCacheExpiry = now + DEFAULT_STORE_TTL;
    }
  } catch { /* ignore */ }
  return defaultStoreId;
}

// ─── Redirect Check ───

interface CachedRedirect {
  to: string;
  type: string;
  expiresAt: number;
}

const redirectCache = new Map<string, CachedRedirect>();
const REDIRECT_CACHE_TTL = 5 * 60 * 1000;

async function checkRedirect(pathname: string, request: NextRequest): Promise<CachedRedirect | null> {
  const cached = redirectCache.get(pathname);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.to ? cached : null;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${request.nextUrl.port || 3000}`;
    const checkUrl = `${baseUrl}/api/redirects/check?path=${encodeURIComponent(pathname)}`;
    const res = await fetch(checkUrl, {
      headers: { "x-internal-request": "true" },
      signal: AbortSignal.timeout(2000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.found && data.to) {
        const result: CachedRedirect = {
          to: data.to,
          type: data.type || "301",
          expiresAt: Date.now() + REDIRECT_CACHE_TTL,
        };
        redirectCache.set(pathname, result);
        return result;
      }
    }
  } catch { /* ignore */ }

  redirectCache.set(pathname, { to: "", type: "", expiresAt: Date.now() + 60 * 1000 });
  return null;
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const ip = getClientIp(req);

  // 0. Rate limiting + CSRF for app API routes.
  // NextAuth's own /api/auth/* routes manage their own CSRF/rate protection and
  // issue internal sub-requests, so we exclude them. Internal middleware fetches
  // (x-internal-request) are also exempt to avoid self-throttling.
  const isInternal = req.headers.get("x-internal-request") === "true";
  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/") &&
    !isInternal
  ) {
    const isSensitive =
      pathname.startsWith("/api/account/request-otp") ||
      pathname.startsWith("/api/account/register");
    const limit = isSensitive ? AUTH_RATE_LIMIT : API_RATE_LIMIT;
    const rl = rateLimit(`${ip}:${isSensitive ? "auth" : "api"}`, limit);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    // Reject state-changing API requests with body > 5 MB
    if (!SAFE_METHODS.has(req.method)) {
      const contentLength = req.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Request entity too large" }, { status: 413 });
      }
    }

    // Enforce same-origin for state-changing API requests (CSRF defense).
    if (!SAFE_METHODS.has(req.method)) {
      if (!isSameOrigin(req)) {
        return NextResponse.json({ error: "Forbidden: invalid origin" }, { status: 403 });
      }
    }
  }

  // 1. Handle Redirects for non-API routes
  if (
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/") &&
    !pathname.startsWith("/_proxy/") &&
    !pathname.includes(".")
  ) {
    const redirect = await checkRedirect(pathname, req);
    if (redirect && redirect.to) {
      const status = redirect.type === "302" ? 302 : 301;
      const url = req.nextUrl.clone();
      url.pathname = redirect.to;
      return NextResponse.redirect(url, status);
    }
  }

  // 2. Resolve Store (single default store; skip for the resolver endpoint itself)
  const storeId =
    pathname === "/api/store/default" ? null : await resolveDefaultStoreId();

  // 3. Authentication (NextAuth session, populated by the auth() wrapper)
  const session = req.auth;

  // 4. Role-based access for admin routes
  if (isAdminRoute(req)) {
    const role = (session?.user as { role?: string } | undefined)?.role;
    const isAdmin = !!session && (role === "admin" || role === "editor");
    if (!isAdmin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = new URL("/admin", req.url);
      return NextResponse.redirect(url);
    }
  }

  // 5. Inject headers for downstream API routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete("x-user-id");
  requestHeaders.delete("x-user-role");
  requestHeaders.delete("x-user-email");

  if (storeId) {
    requestHeaders.set("x-store-id", storeId);
  }

  if (session?.user) {
    requestHeaders.set("x-user-id", session.user.id);
    requestHeaders.set("x-user-role", (session.user as { role?: string }).role || "customer");
    requestHeaders.set("x-user-email", session.user.email || "");
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
