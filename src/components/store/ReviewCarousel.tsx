"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Star, ChevronLeft, ChevronRight, Quote, Loader2 } from "lucide-react";
import { getFirstImage } from "@/lib/utils";

export function ReviewCarousel() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
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
    fetch("/api/reviews")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.reviews) setReviews(data.reviews);
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

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">What Our Customers Say</h2>
          <p className="text-muted-foreground">
            Real reviews from real customers
          </p>
        </div>
        <div className="relative">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {reviews.map((review) => {
                const productImage = getFirstImage(review.Product?.images);
                return (
                  <div
                    key={review.id}
                    className="min-w-0 shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3 pl-4"
                  >
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 h-full border shadow-sm">
                      <Quote className="h-6 w-6 text-primary/30 mb-3" />
                      <div className="flex gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                      <div className="flex items-center gap-3 mt-auto">
                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {(review.User?.name || "A")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {review.User?.name || "Anonymous"}
                          </p>
                          {review.Product?.name && (
                            <p className="text-xs text-muted-foreground truncate">
                              on {review.Product.name}
                            </p>
                          )}
                        </div>
                        {productImage && (
                          <img
                            src={productImage}
                            alt=""
                            className="size-9 rounded object-cover ml-auto flex-shrink-0"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {reviews.length > 3 && (
            <div className="flex justify-center gap-2 mt-6">
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
