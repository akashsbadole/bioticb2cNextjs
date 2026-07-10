import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitResult {
  success: boolean;
  retryAfter?: number;
}

// In-memory store: key = endpoint prefix + IP
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let cleanupScheduled = false;

function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      // Remove entries where all timestamps are older than 2 hours
      const recent = entry.timestamps.filter((ts) => now - ts < 2 * 60 * 60 * 1000);
      if (recent.length === 0) {
        rateLimitStore.delete(key);
      } else {
        entry.timestamps = recent;
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

/**
 * Simple in-memory sliding window rate limiter.
 *
 * @param request - The incoming NextRequest
 * @param options.maxRequests - Max requests allowed in the window
 * @param options.windowMs - Window duration in milliseconds
 * @param options.prefix - A unique prefix for this endpoint (avoids IP collision across endpoints)
 */
export function rateLimit(
  request: NextRequest,
  options: {
    maxRequests: number;
    windowMs: number;
    prefix: string;
  }
): RateLimitResult {
  // Ensure cleanup is scheduled
  scheduleCleanup();

  // Extract client IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const key = `${options.prefix}:${ip}`;
  const now = Date.now();
  const windowStart = now - options.windowMs;

  // Get or create entry
  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  // Filter out timestamps outside the window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  // Check if limit exceeded
  if (entry.timestamps.length >= options.maxRequests) {
    // Calculate retryAfter: time until the oldest request in the window expires
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + options.windowMs - now;
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);
    return {
      success: false,
      retryAfter: retryAfterSec,
    };
  }

  // Record this request
  entry.timestamps.push(now);
  return { success: true };
}

/**
 * Helper to apply rate limiting at the top of a route handler.
 * Returns a 429 NextResponse if rate limited, or null if OK.
 */
export function checkRateLimit(
  request: NextRequest,
  options: {
    maxRequests: number;
    windowMs: number;
    prefix: string;
  }
): NextResponse | null {
  const result = rateLimit(request, options);
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
        },
      }
    );
  }
  return null;
}
