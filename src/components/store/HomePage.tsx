"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { PageBlockRenderer } from "./PageBlockRenderer";
import { RecentlyViewed } from "./RecentlyViewed";
import { BannerSlider } from "./BannerSlider";
import { CategoryGrid } from "./CategoryGrid";
import { ProductSlider } from "./ProductSlider";
import { ReviewCarousel } from "./ReviewCarousel";
import type { PageBlock } from "@/lib/page-blocks";
import { normalizePageBlocks } from "@/lib/page-blocks";
import { useSeo } from "@/lib/use-seo";
import { StoreLoading } from "./StoreLoading";

interface HomePageProps {
  onNavigate: (page: string, data?: unknown) => void;
  settings?: Record<string, string> | null;
  data?: Record<string, unknown>;
}

export function HomePage({
  onNavigate,
  settings,
  data: externalData,
}: HomePageProps) {
  const { data: homepageData, isLoading: cmsLoading } = useQuery({
    queryKey: ["homepage-cms"],
    enabled: !externalData,
    queryFn: async () => {
        const res = await fetch("/api/content-pages?slug=homepage");
        const data = await res.json();
        const page = (data.contentPages || [])[0];
        if (page) {
            return {
                meta: {
                    metaTitle: page.metaTitle || null,
                    metaDescription: page.metaDescription || null,
                    ogImage: page.ogImage || null,
                },
                blocks: normalizePageBlocks(page.blocks || "[]")
            };
        }
        return null;
    }
  });

  const blocks = homepageData?.blocks || null;
  const homeMeta = homepageData?.meta || null;
  const currency = settings?.currency || "INR";

  const siteOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  useSeo("home", {
    title:
      homeMeta?.metaTitle ||
      (settings?.site_name ? `${settings.site_name}` : undefined),
    description: homeMeta?.metaDescription,
    ogImage: homeMeta?.ogImage,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: settings?.site_name,
          url: siteOrigin,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${siteOrigin}/shop?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "Organization",
          name: settings?.site_name,
          url: siteOrigin,
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            availableLanguage: ["English", "Hindi"],
          },
        },
      ],
    },
  });

  if (cmsLoading) {
    return <StoreLoading />;
  }

  if (externalData) {
    return (
      <div className="flex flex-col">
        <BannerSlider onNavigate={onNavigate} />
        <CategoryGrid onNavigate={onNavigate} />
        <ProductSlider
          title="Featured Products"
          queryParams="featured=true&limit=10"
          currency={currency}
          onNavigate={onNavigate}
        />
        <ProductSlider
          title="New Arrivals"
          icon={<Clock className="h-6 w-6 text-primary" />}
          queryParams="sort=newest&limit=10"
          currency={currency}
          onNavigate={onNavigate}
        />
        <ReviewCarousel />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <BannerSlider onNavigate={onNavigate} />

      <CategoryGrid onNavigate={onNavigate} />

      <ProductSlider
        title="Featured Products"
        queryParams="featured=true&limit=10"
        currency={currency}
        onNavigate={onNavigate}
      />

      <ProductSlider
        title="New Arrivals"
        icon={<Clock className="h-6 w-6 text-primary" />}
        queryParams="sort=newest&limit=10"
        currency={currency}
        onNavigate={onNavigate}
      />

      <PageBlockRenderer blocks={blocks ?? undefined} onNavigate={onNavigate} />

      <ReviewCarousel />

      <section className="py-20 border-t">
        <div className="container mx-auto px-4">
            <RecentlyViewed />
        </div>
      </section>
    </div>
  );
}
