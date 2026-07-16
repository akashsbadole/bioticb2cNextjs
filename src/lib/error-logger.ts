import { db } from '@/lib/db';

/**
 * Consistent error logging utility.
 * Replaces silent catch blocks with categorized, traceable logging.
 */

type ErrorCategory = 'email' | 'auth' | 'db' | 'api' | 'ui' | 'schema' | 'payment' | 'other';

interface LogErrorOptions {
  category: ErrorCategory;
  context?: string;
  userId?: string;
  silent?: boolean; // Set to true to only log, not throw
}

/**
 * Log an error with category and context.
 * In production, this can be extended to send to external error tracking services.
 */
export function logError(error: unknown, options: LogErrorOptions): void {
  const { category, context, userId, silent = true } = options;
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  const logEntry = `[${timestamp}] [${category.toUpperCase()}] ${context ? `${context}: ` : ''}${message}`;
  
  // Make sure we explicitly call console.error so standard log monitoring catches it
  if (category === 'email') {
    console.warn(logEntry);
  } else {
    console.error(logEntry);
  }

  if (stack && process.env.NODE_ENV === 'development') {
    console.error(stack);
  }

  // Persist error logs in the database for centralized viewing in admin activity logs
  db.activityLog.create({
    data: {
      action: `error.${category}`,
      entity: 'system',
      entityId: context || null,
      details: JSON.stringify({
        message,
        stack,
        userId,
        timestamp,
      }),
      userId: userId || null,
    }
  }).catch((dbErr) => {
    // Prevent DB log failures from breaking the app
    console.error('Failed to save error log to database:', dbErr);
  });
}

/**
 * Wrap an async function with error logging.
 * Returns null on error instead of throwing.
 */
export async function withErrorLog<T>(
  fn: () => Promise<T>,
  options: LogErrorOptions
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    logError(error, options);
    return null;
  }
}
