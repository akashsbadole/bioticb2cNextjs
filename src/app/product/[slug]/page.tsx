"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { StoreLayout } from "@/components/store/StoreLayout";
import { CategoryPage as CategoryPageComponent } from "@/components/store/CategoryPage";
import { useAppStore } from "@/lib/store";

export default function ProductSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const navigate = useAppStore((s) => s.navigate);

  useEffect(() => {
    navigate("category", slug);
  }, [slug, navigate]);

  return (
    <StoreLayout currentPage="category" onNavigate={navigate}>
      <CategoryPageComponent slug={slug} onNavigate={navigate} />
    </StoreLayout>
  );
}
