"use client";

export function PageSkeleton() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-4">
        <div className="h-6 w-3/4 animate-pulse rounded bg-[var(--biotic-sand)]/60" />
        <div className="h-4 w-full animate-pulse rounded bg-[var(--biotic-sand)]/50" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-[var(--biotic-sand)]/50" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-[var(--biotic-sand)]/50" />
        <div className="h-48 w-full animate-pulse rounded-2xl bg-[var(--biotic-sand)]/40" />
      </div>
    </div>
  );
}
