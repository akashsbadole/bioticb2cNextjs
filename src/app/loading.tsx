import { ShoppingBag } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning Logo */}
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-emerald-600" />
          <ShoppingBag className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-emerald-600" />
        </div>

        {/* Site Name */}
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight">
            Purva<span className="text-emerald-600">Bites</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  );
}
