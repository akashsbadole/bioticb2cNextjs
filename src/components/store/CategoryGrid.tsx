"use client";

import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Loader2 } from "lucide-react";

interface CategoryGridProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export function CategoryGrid({ onNavigate }: CategoryGridProps) {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["home-categories"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) return [];
      const data = await res.json();
      return data.categories || [];
    },
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
          <p className="text-muted-foreground">
            Browse our collection by category
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat: any) => (
            <div
              key={cat.id}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-muted"
              onClick={() => onNavigate("category", cat.slug)}
            >
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-lg">{cat.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
