/**
 * Admin fetch utilities for authenticated API calls.
 *
 * Note: Since we are using Clerk, the Clerk middleware automatically
 * handles session verification. Downstream API routes should
 * trust the `x-user-id` and `x-user-role` headers injected by
 * the middleware.
 */

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // In Clerk version, we don't need to manually attach Bearer tokens for same-origin requests
  // as Clerk handles session cookies automatically.

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
