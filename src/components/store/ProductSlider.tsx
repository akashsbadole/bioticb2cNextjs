"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";

interface ProductSliderProps {
  title?: string;
  icon?: React.ReactNode;
  queryParams?: string;
  viewAllPage?: string;
  currency?: string;
  onNavigate: (page: string, data?: unknown) => void;
}

export function ProductSlider({
  title = "Featured Products",
  icon,
  queryParams = "featured=true&limit=10",
  viewAllPage = "products",
  currency = "INR",
  onNavigate,
}: ProductSliderProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 3 },
    },
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    fetch(`/api/products?${queryParams}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.products) setProducts(data.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [queryParams]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            {icon || <Sparkles className="h-6 w-6 text-primary" />}
            <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrev}
              className="size-9 rounded-full border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
              disabled={!canScrollPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollNext}
              className="size-9 rounded-full border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
              disabled={!canScrollNext}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <Button variant="link" size="sm" onClick={() => onNavigate(viewAllPage)}>
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
        <div ref={emblaRef} className="overflow-hidden -mx-2">
          <div className="flex">
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-0 shrink-0 grow-0 basis-[50%] md:basis-1/3 lg:basis-1/4 pl-4"
              >
                <ProductCard
                  product={product}
                  currency={currency}
                  onNavigate={onNavigate}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
