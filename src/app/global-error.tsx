'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Error icon */}
            <div className="rounded-full bg-rose-100 p-4 dark:bg-rose-900/30">
              <AlertTriangle className="h-10 w-10 text-rose-500" />
            </div>

            {/* Heading and description */}
            <div className="space-y-3 max-w-md">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Something went wrong
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                An unexpected error occurred. Please try again or return to the
                homepage.
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground font-mono">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            {/* Try Again button */}
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
