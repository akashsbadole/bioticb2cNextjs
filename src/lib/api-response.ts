import { NextResponse } from 'next/server';

/**
 * Standardized API response helpers (audit 4.3 / 9.2).
 *
 * The codebase already converges on `{ error: string }` for failures and
 * `{ data, ... }` for successes. These helpers codify that contract so every
 * route returns a consistent shape and status code.
 */

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

/** 200 OK */
export function ok<T>(data: T, init?: { message?: string; pagination?: PaginationMeta; status?: number }) {
  const body: ApiSuccess<T> = { success: true, data };
  if (init?.message) body.message = init.message;
  if (init?.pagination) body.pagination = init.pagination;
  return NextResponse.json(body, { status: init?.status ?? 200 });
}

/** 201 Created */
export function created<T>(data: T, init?: { message?: string }) {
  return ok(data, { message: init?.message ?? 'Created', status: 201 });
}

/** 400 Bad Request */
export function badRequest(error: string, init?: { code?: string; details?: unknown }) {
  return NextResponse.json(
    { success: false, error, ...(init?.code ? { code: init.code } : {}), ...(init?.details ? { details: init.details } : {}) } satisfies ApiErrorBody,
    { status: 400 }
  );
}

/** 401 Unauthorized */
export function unauthorized(error = 'Unauthorized', init?: { code?: string }) {
  return NextResponse.json(
    { success: false, error, ...(init?.code ? { code: init.code } : {}) } satisfies ApiErrorBody,
    { status: 401 }
  );
}

/** 403 Forbidden */
export function forbidden(error = 'Forbidden', init?: { code?: string }) {
  return NextResponse.json(
    { success: false, error, ...(init?.code ? { code: init.code } : {}) } satisfies ApiErrorBody,
    { status: 403 }
  );
}

/** 404 Not Found */
export function notFound(error = 'Not found') {
  return NextResponse.json({ success: false, error } satisfies ApiErrorBody, { status: 404 });
}

/** 409 Conflict */
export function conflict(error: string) {
  return NextResponse.json({ success: false, error } satisfies ApiErrorBody, { status: 409 });
}

/** 429 Too Many Requests */
export function tooManyRequests(error = 'Too many requests', retryAfter?: number) {
  const headers: Record<string, string> = {};
  if (retryAfter != null) headers['Retry-After'] = String(retryAfter);
  return NextResponse.json({ success: false, error } satisfies ApiErrorBody, { status: 429, headers });
}

/** 500 Internal Server Error */
export function serverError(error = 'Internal server error') {
  return NextResponse.json({ success: false, error } satisfies ApiErrorBody, { status: 500 });
}
