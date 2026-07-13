"use client";

import { use } from "react";
import { StoreShell } from "@/components/store/StoreShell";

interface CatchAllPageProps {
  params: Promise<{ slug?: string[] }>;
}

export default function CatchAllPage({ params }: CatchAllPageProps) {
  const { slug } = use(params);

  // Parse slug to determine initial page type
  let initialPage: string | { type: string; slug?: string } = "home";
  if (slug && slug.length > 0) {
    const first = slug[0];
    if (first === "products" && slug[1]) {
      initialPage = { type: "product-page", slug: slug[1] };
    } else if (first === "shop") {
      if (slug[1]) initialPage = { type: "category", slug: slug[1] };
      else initialPage = "shop";
    } else if (["about", "manufacturing", "contact", "cart", "checkout", "account", "login", "register", "wishlist", "faq", "compare", "support", "tracking", "blog", "products"].includes(first)) {
      initialPage = first;
    } else {
      initialPage = { type: "content-page", slug: slug.join("/") };
    }
  }

  return <StoreShell initialPage={initialPage} />;
}
