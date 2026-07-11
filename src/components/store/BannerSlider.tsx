"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  link?: string | null;
  linkText?: string | null;
}

interface BannerSliderProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export function BannerSlider({ onNavigate }: BannerSliderProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 }, [
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  ]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.banners) setBanners(data.banners);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  if (loading || banners.length === 0) return null;

  return (
    <div className="relative group">
      <div ref={emblaRef} className="overflow-hidden rounded-none">
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner.id} className="min-w-0 shrink-0 grow-0 basis-full relative">
              <div className="relative h-[50vh] min-h-[300px] max-h-[600px] w-full">
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white">
                  <h2 className="text-3xl md:text-5xl font-bold mb-3 max-w-2xl">
                    {banner.title}
                  </h2>
                  {banner.subtitle && (
                    <p className="text-lg md:text-xl text-white/80 mb-6 max-w-xl">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.link && (
                    <Button
                      size="lg"
                      className="bg-white text-black hover:bg-white/90"
                      onClick={() => {
                        if (banner.link?.startsWith("/")) {
                          const path = banner.link.slice(1);
                          const page = path || "products";
                          onNavigate(page);
                        } else {
                          window.open(banner.link!, "_blank");
                        }
                      }}
                    >
                      {banner.linkText || "Shop Now"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                className={`size-2 rounded-full transition-all ${
                  i === selectedIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => emblaApi?.scrollTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
