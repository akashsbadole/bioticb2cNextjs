import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/api/admin(.*)"]);

// ─── Store Resolution (Edge-compatible, in-memory cache) ───

interface CachedStore {
  id: string;
  slug: string;
  expiresAt: number;
}

const storeCache = new Map<string, CachedStore>();
const STORE_CACHE_TTL = 5 * 60 * 1000;

const PLATFORM_DOMAINS = [
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || process.env.PLATFORM_DOMAIN || "localhost",
  process.env.PLATFORM_DOMAIN || "localhost",
];

function extractSubdomain(hostname: string): string | null {
  const host = hostname.split(":")[0];
  if (!host || host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null;
  }
  for (const domain of PLATFORM_DOMAINS) {
    if (host.endsWith(`.${domain}`)) {
      const sub = host.replace(`.${domain}`, "");
      return sub || null;
    }
  }
  return null;
}

function isCustomDomain(hostname: string): boolean {
  const host = hostname.split(":")[0];
  if (!host || host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return false;
  }
  return !PLATFORM_DOMAINS.some((d) => host.endsWith(`.${d}`));
}

async function resolveStoreId(hostname: string): Promise<string | null> {
  const host = hostname.split(":")[0];

  const cached = storeCache.get(host);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.id;
  }

  let storeId: string | null = null;
  const subdomain = extractSubdomain(hostname);
  if (subdomain) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${3000}`;
      const res = await fetch(`${baseUrl}/api/stores/resolve?slug=${encodeURIComponent(subdomain)}`, {
        headers: { "x-internal-request": "true" },
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = await res.json();
        storeId = data.storeId || null;
      }
    } catch { /* ignore */ }
  }

  if (!storeId && isCustomDomain(hostname)) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${3000}`;
      const res = await fetch(`${baseUrl}/api/stores/resolve?domain=${encodeURIComponent(host)}`, {
        headers: { "x-internal-request": "true" },
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = await res.json();
        storeId = data.storeId || null;
      }
    } catch { /* ignore */ }
  }

  if (storeId) {
    storeCache.set(host, { id: storeId, slug: subdomain || host, expiresAt: Date.now() + STORE_CACHE_TTL });
  }

  return storeId;
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

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // 1. Handle Redirects for non-API routes
  if (!pathname.startsWith("/api/") && !pathname.startsWith("/_next/") && !pathname.startsWith("/_proxy/") && !pathname.includes(".")) {
    const redirect = await checkRedirect(pathname, req);
    if (redirect && redirect.to) {
      const status = redirect.type === "302" ? 302 : 301;
      const url = req.nextUrl.clone();
      url.pathname = redirect.to;
      return NextResponse.redirect(url, status);
    }
  }

  // 2. Resolve Store
  const storeId = await resolveStoreId(hostname);

  // 3. Handle Protected Routes
  if (isProtectedRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      return session.redirectToSignIn();
    }

    // RBAC could be added here via publicMetadata if needed
    // const role = session.sessionClaims?.publicMetadata?.role as string || 'clerk';
    // ... logic for RBAC ...
  }

  // 4. Inject Headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete("x-user-id");
  requestHeaders.delete("x-user-role");
  requestHeaders.delete("x-user-email");

  if (storeId) {
    requestHeaders.set("x-store-id", storeId);
  }

  // If authenticated, we could potentially inject user info from session
  const session = await auth();
  if (session.userId) {
    requestHeaders.set("x-user-id", session.userId);
    const role = (session.sessionClaims?.publicMetadata as any)?.role || "clerk";
    requestHeaders.set("x-user-role", role);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
