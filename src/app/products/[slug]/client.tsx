"use client";

import { StoreShell } from "@/components/store/StoreShell";

export function ProductClientPage({ slug }: { slug: string }) {
  return <StoreShell initialPage={{ type: "product-page", slug }} />;
}
