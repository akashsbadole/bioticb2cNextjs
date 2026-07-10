import { ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StoreLoading() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12 animate-pulse">
        {/* Skeleton Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[4/5] w-full rounded-2xl bg-muted" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/3 bg-muted" />
                        <Skeleton className="h-5 w-full bg-muted" />
                        <Skeleton className="h-6 w-1/2 bg-muted" />
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}

export function ProductSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square w-full rounded-3xl bg-muted" />
            <div className="space-y-6">
                <Skeleton className="h-6 w-24 rounded-full bg-muted" />
                <Skeleton className="h-12 w-3/4 bg-muted" />
                <Skeleton className="h-8 w-1/4 bg-muted" />
                <Skeleton className="h-24 w-full bg-muted" />
                <div className="flex gap-4">
                    <Skeleton className="h-14 flex-1 rounded-2xl bg-muted" />
                    <Skeleton className="h-14 w-14 rounded-2xl bg-muted" />
                </div>
            </div>
        </div>
    )
}
