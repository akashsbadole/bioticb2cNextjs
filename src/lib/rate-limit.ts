import { NextRequest, NextResponse } from 'next/server';
import { db } from './db';

interface RateLimitResult {
  success: boolean;
  retryAfter?: number;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Prisma-backed sliding window rate limiter.
 * Works across server instances and survives restarts.
 * Stale entries are cleaned up inline during checks.
 */
export async function rateLimit(
  request: NextRequest,
  options: {
    maxRequests: number;
    windowMs: number;
    prefix: string;
  }
): Promise<RateLimitResult> {
  if (process.env.DISABLE_RATE_LIMIT === "true" || process.env.NODE_ENV === "test") {
    return { success: true };
  }
  const identifier = getClientIp(request);
  const endpoint = options.prefix;
  const now = new Date();
  const windowStart = new Date(now.getTime() - options.windowMs);

  // Prune stale entries for this endpoint+identifier as a side-effect
  await db.rateLimitEntry.deleteMany({
    where: {
      identifier,
      endpoint,
      windowStart: { lt: windowStart },
    },
  });

  // Find the current window entry
  const entry = await db.rateLimitEntry.findFirst({
    where: {
      identifier,
      endpoint,
      windowStart: { gte: windowStart },
    },
  });

  if (entry) {
    if (entry.count >= options.maxRequests) {
      const retryAfterMs = entry.windowStart.getTime() + options.windowMs - now.getTime();
      return {
        success: false,
        retryAfter: Math.ceil(retryAfterMs / 1000),
      };
    }

    // Increment count
    await db.rateLimitEntry.update({
      where: { id: entry.id },
      data: { count: { increment: 1 } },
    });

    return { success: true };
  }

  // First request in this window — create entry
  await db.rateLimitEntry.create({
    data: {
      identifier,
      endpoint,
      windowStart: now,
      count: 1,
    },
  });

  return { success: true };
}

/**
 * Helper to apply rate limiting at the top of a route handler.
 * Returns a 429 NextResponse if rate limited, or null if OK.
 * On success, attaches X-RateLimit headers to the response.
 */
export async function checkRateLimit(
  request: NextRequest,
  options: {
    maxRequests: number;
    windowMs: number;
    prefix: string;
  }
): Promise<NextResponse | null> {
  const result = await rateLimit(request, options);
  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfter),
          'X-RateLimit-Limit': String(options.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil((Date.now() + (result.retryAfter ?? 0) * 1000) / 1000)),
        },
      }
    );
  }
  return null;
}

/**
 * Attaches X-RateLimit headers to a successful response.
 * Call this after checkRateLimit returns null.
 */
export function addRateLimitHeaders(
  response: NextResponse,
  options: { maxRequests: number; windowMs: number; prefix: string }
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(options.maxRequests));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil((Date.now() + options.windowMs) / 1000)));
  return response;
}
