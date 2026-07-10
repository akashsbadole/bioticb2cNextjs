"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Zap, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/pricing";
import { getFirstImage } from "@/lib/utils";
import { PageBlockRenderer } from "./PageBlockRenderer";
import { RecentlyViewed } from "./RecentlyViewed";
import type { PageBlock } from "@/lib/page-blocks";
import { normalizePageBlocks } from "@/lib/page-blocks";
import { useSeo } from "@/lib/use-seo";
import { StoreLoading } from "./StoreLoading";
// import { ContactFormSection } from "./ContactFormSection";

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
  const { data: newArrivals = [] } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: async () => {
        const res = await fetch("/api/products?limit=4&sort=newest");
        const data = await res.json();
        return data.products || [];
    }
  });

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
              urlTemplate: `${siteOrigin}/catalogue?search={search_term_string}`,
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

  // Error state
  if (!externalData && (!blocks || blocks.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">
          Unable to load homepage content.
        </p>
        <p className="mt-2 text-sm text-muted-foreground/70">
          Please ensure the homepage content page exists in the admin panel.
        </p>
      </div>
    );
  }

  // If external data is provided, render it directly
  if (externalData) {
    return (
      <div className="flex flex-col">
        <div className="p-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {(externalData.hero as any)?.title || "Welcome to Our Company"}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {(externalData.hero as any)?.subtitle ||
              "Your trusted partner for quality products"}
          </p>
          <div className="space-y-8">
            <pre className="text-left text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(externalData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Render CMS blocks
  return (
    <div className="flex flex-col">
      {newArrivals.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Clock className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">New Arrivals</h2>
                </div>
                <Button variant="link" onClick={() => onNavigate("products")}>View All</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {newArrivals.map((p) => (
                    <div key={p.id} className="bg-background rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => onNavigate("product-page", p.slug)}>
                        <div className="aspect-square bg-muted rounded-xl overflow-hidden mb-4 relative">
                            {p.comparePrice && (
                                <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 flex items-center gap-1">
                                    <Zap className="h-3 w-3 fill-current" /> SALE
                                </div>
                            )}
                            <img src={getFirstImage(p.images) || ''} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <h3 className="font-bold text-sm truncate">{p.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-primary font-bold">{formatPrice(p.price, settings?.currency || "INR")}</span>
                            {p.comparePrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(p.comparePrice, settings?.currency || "INR")}</span>}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </section>
      )}

      <PageBlockRenderer blocks={blocks ?? undefined} onNavigate={onNavigate} />

      <section className="py-20 border-t">
        <div className="container mx-auto px-4">
            <RecentlyViewed />
        </div>
      </section>
    </div>
  );
}
