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
 * In production, this could be extended to send to an error tracking service.
 */
export function logError(error: unknown, options: LogErrorOptions): void {
  const { category, context, silent = true } = options;
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  const logEntry = `[${timestamp}] [${category.toUpperCase()}] ${context ? `${context}: ` : ''}${message}`;
  
  if (category === 'email') {
    console.warn(logEntry);
  } else {
    console.error(logEntry);
  }

  if (stack && process.env.NODE_ENV === 'development') {
    console.error(stack);
  }

  // In production, send to error tracking service:
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracker({ category, context, message, stack, timestamp });
  // }
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
