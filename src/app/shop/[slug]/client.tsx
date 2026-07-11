"use client";

import { StoreShell } from "@/components/store/StoreShell";

export function CategoryClientPage({ slug }: { slug: string }) {
  return <StoreShell initialPage={{ type: "category", slug }} />;
}
