import Link from 'next/link';
import { AlertTriangle, Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Large 404 number */}
        <div className="relative">
          <span className="text-[10rem] font-black leading-none tracking-tighter text-emerald-100 dark:text-emerald-900/30 select-none sm:text-[12rem] md:text-[14rem]">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="h-16 w-16 text-emerald-500 sm:h-20 sm:w-20" />
          </div>
        </div>

        {/* Heading and description */}
        <div className="space-y-3 max-w-md">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Page not found
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/?view=catalogue">
              <ShoppingBag className="h-4 w-4" />
              Browse Catalogue
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
