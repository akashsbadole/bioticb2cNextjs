"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { StoreLoading } from "./StoreLoading";
import { Breadcrumbs } from "./Breadcrumbs";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count?: { Product: number };
}

interface ProductsOverviewPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export function ProductsOverviewPage({ onNavigate }: ProductsOverviewPageProps) {
  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => {
        const res = await fetch("/api/categories?all=true");
        return (await res.json()).categories || [];
    }
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: "Categories" }]} />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">Shop by Category</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Explore our diverse collection of premium products across various categories.
                </p>
            </div>
            <Button size="lg" className="rounded-full font-bold h-12 px-8" onClick={() => onNavigate("catalogue")}>
                Browse All Products
            </Button>
        </div>

        {loading ? (
          <StoreLoading />
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group relative bg-card border rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-[400px]"
                onClick={() => onNavigate("category", cat.slug)}
              >
                {/* Image Background */}
                <div className="absolute inset-0 z-0">
                    {cat.image ? (
                        <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Package className="h-16 w-16 text-muted-foreground/20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 mt-auto p-8 text-white">
                  <div className="flex items-center gap-2 mb-2">
                      <span className="h-1 w-8 bg-primary rounded-full" />
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-primary-foreground/80">Collection</span>
                  </div>
                  <h3 className="text-3xl font-black mb-3 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-sm text-white/70 leading-relaxed mb-6 line-clamp-2 max-w-xs">
                      {cat.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-primary transition-colors">
                        <ChevronRight className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-wider">Explore Category</span>
                  </div>
                </div>

                {/* Product Count Badge */}
                {cat._count && (
                    <div className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold leading-none">{cat._count.Product}</span>
                        <span className="text-[8px] uppercase font-bold opacity-60">Items</span>
                    </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-muted/30 rounded-3xl border-2 border-dashed">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">No categories found</h2>
            <p className="text-muted-foreground">Start by adding categories in the admin panel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
