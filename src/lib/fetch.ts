/**
 * Admin fetch utilities for authenticated API calls.
 *
 * Note: Auth is handled by NextAuth (session cookie) in middleware, which
 * injects the `x-user-id` and `x-user-role` headers. Downstream API routes
 * trust those headers via `requireAuth`/`requireAdminAuth`.
 */

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Same-origin requests are authenticated via the NextAuth session cookie,
  // so no manual Bearer token attachment is needed here.

  return fetch(url, {
    cache: 'no-store',
    ...options,
  });
}

/** @deprecated Use adminFetch instead */
export const authFetch = adminFetch;

/**
 * Build Authorization headers for same-origin customer API calls.
 * Only attaches a Bearer token when one actually exists — passing
 * `null`/`undefined` would produce the literal string "Bearer null",
 * which fails middleware JWT verification and yields a 401. Authenticated
 * customers without a manual token still get `x-user-id` from the NextAuth
 * session via middleware, so the header is optional.
 */
export function authHeaders(token: string | null | undefined): Record<string, string> {
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}
