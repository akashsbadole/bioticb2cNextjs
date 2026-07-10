"use client";

import { StoreShell } from "@/components/store/StoreShell";

export function BlogPostClientPage({ slug }: { slug: string }) {
  return <StoreShell initialPage={{ type: "blog-post", slug }} />;
}
