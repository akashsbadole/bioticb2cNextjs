"use client";

import { useParams } from "next/navigation";
import { StoreShell } from "@/components/store/StoreShell";

export default function ProductSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  return <StoreShell initialPage={{ type: "product-page", slug }} />;
}
