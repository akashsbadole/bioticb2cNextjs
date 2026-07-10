"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Send,
  ImageIcon,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { getFirstImage } from "@/lib/utils";

export interface CategoryFieldData {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroDescription: string | null;
  contentSplitImage: string | null;
  contentSplitHeading: string | null;
  contentSplitParagraph: string | null;
  contentSplitBullets: string;
  cardsTitle: string | null;
  cardsProductIds: string;
  cardsMaxCount: number;
  cardsColumns: number;
  ctaHeading: string | null;
  ctaDescription: string | null;
  ctaBulkText: string | null;
  ctaBulkLink: string | null;
  ctaPrivateLabelText: string | null;
  ctaPrivateLabelLink: string | null;
  ctaBackgroundColor: string | null;
  processTitle: string | null;
  processSubtitle: string | null;
  processSteps: string;
  infographicImage: string | null;
  infographicCaption: string | null;
  infographicAltText: string | null;
  galleryTitle: string | null;
  galleryImages: string;
  faqTitle: string | null;
  faqItems: string;
}

function parseJsonArray<T>(val: string): T[] {
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function HeroSection({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle: string;
  description: string;
}) {
  if (!title && !subtitle && !description) return null;
  return (
    <section className="container mx-auto max-w-3xl px-4 py-10 md:py-12 text-center">
      {subtitle && (
        <p className="text-xs sm:text-sm font-medium text-primary uppercase tracking-wider mb-3">
          {subtitle}
        </p>
      )}
      {title && (
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
          {title}
        </h1>
      )}
      {description && (
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </section>
  );
}

function ContentSplitSection({
  image,
  heading,
  paragraph,
  bullets,
}: {
  image: string;
  heading: string;
  paragraph: string;
  bullets: string[];
}) {
  if (!heading && !paragraph && bullets.length === 0) return null;
  return (
    <section className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted order-1 md:order-none">
          {image ? (
            <img
              src={image}
              alt={heading}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <ImageIcon className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div>
          {heading && (
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 md:mb-4">
              {heading}
            </h2>
          )}
          {paragraph && (
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 md:mb-6">
              {paragraph}
            </p>
          )}
          {bullets.length > 0 && (
            <ul className="space-y-2 md:space-y-3">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 md:gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-foreground text-sm sm:text-base">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function CardsSection({
  title,
  productIds,
  maxCount,
  columns,
  onNavigate,
}: {
  title: string;
  productIds: string[];
  maxCount: number;
  columns: number;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const [products, setProducts] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      shortDescription: string | null;
      images: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams({
          all: "true",
          limit: String(maxCount),
        });
        if (productIds.length > 0) {
          params.set("ids", productIds.join(","));
        }
        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts((data.products || []).slice(0, maxCount));
        }
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [productIds.join(","), maxCount]);

  const colCount = Math.min(columns, 4);
  const gridClass =
    colCount === 2
      ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
      : colCount === 3
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

  if (loading) {
    return (
      <section className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
        {title && (
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10">
            {title}
          </h2>
        )}
        <div className={gridClass}>
          {Array.from({ length: colCount }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card animate-pulse overflow-hidden"
            >
              <div className="h-36 sm:h-40 md:h-48 bg-muted" />
              <div className="p-3 md:p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
      {title && (
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10">
          {title}
        </h2>
      )}
      <div className={gridClass}>
        {products.map((product) => {
          const image = getFirstImage(product.images);
          return (
            <div
              key={product.id}
              className="rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="relative h-36 sm:h-40 md:h-48 bg-muted overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                    <ImageIcon className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="p-3 md:p-4">
                <h3 className="text-sm sm:text-base font-semibold mb-1">
                  {product.name}
                </h3>
                {product.shortDescription && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}
                <Button
                  size="sm"
                  className="w-full mt-2 md:mt-3 text-xs sm:text-sm"
                  onClick={() =>
                    useAppStore
                      .getState()
                      .openEnquiryModal(product.name, product.id)
                  }
                >
                  <Send className="mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Enquire
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CtaSection({
  heading,
  description,
  bulkText,
  bulkLink,
  privateLabelText,
  privateLabelLink,
  backgroundColor,
  onNavigate,
}: {
  heading: string;
  description: string;
  bulkText: string;
  bulkLink: string;
  privateLabelText: string;
  privateLabelLink: string;
  backgroundColor: string;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  if (!heading && !description) return null;
  const isDark = backgroundColor !== "light";

  return (
    <section
      className={`py-12 md:py-16 ${isDark ? "bg-foreground text-background" : "bg-muted"}`}
    >
      <div className="container mx-auto max-w-3xl px-4 text-center">
        {heading && (
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-bold mb-3 ${isDark ? "text-background" : ""}`}
          >
            {heading}
          </h2>
        )}
        {description && (
          <p
            className={`text-sm sm:text-base md:text-lg mb-6 md:mb-8 max-w-xl mx-auto ${isDark ? "text-background/70" : "text-muted-foreground"}`}
          >
            {description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          {bulkText && (
            <Button
              size="default"
              className="w-full sm:w-auto text-sm sm:text-base text-white"
              onClick={() => {
                const [page, slug] = (bulkLink || "/contact")
                  .replace(/^\//, "")
                  .split("/");
                if (page === "contact") {
                  useAppStore.getState().openEnquiryModal(heading);
                } else {
                  onNavigate?.("content-page", slug || page);
                }
              }}
            >
              {bulkText}
            </Button>
          )}
          {privateLabelText && (
            <Button
              size="default"
              className="w-full sm:w-auto text-sm sm:text-base text-white"
              variant={isDark ? "secondary" : "outline"}
              onClick={() => {
                const [page, slug] = (privateLabelLink || "/contact")
                  .replace(/^\//, "")
                  .split("/");
                if (page === "contact") {
                  useAppStore.getState().openEnquiryModal(heading);
                } else {
                  onNavigate?.("content-page", slug || page);
                }
              }}
            >
              {privateLabelText}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function ProcessSection({
  title,
  subtitle,
  steps,
}: {
  title: string;
  subtitle: string;
  steps: Array<{ title: string; description: string }>;
}) {
  if (steps.length === 0) return null;
  return (
    <section className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
      {title && (
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-muted-foreground text-sm sm:text-base text-center mb-8 md:mb-12 max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center relative"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold mb-3">
              {i + 1}
            </div>
            <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
            <p className="text-xs text-muted-foreground">{step.description}</p>
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-5 left-[60%] w-[80%] h-px bg-border" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqSection({
  title,
  items,
}: {
  title: string;
  items: Array<{ question: string; answer: string }>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (items.length === 0) return null;
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      {title && (
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10">
          {title}
        </h2>
      )}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <button
              className="flex w-full items-center justify-between px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base font-medium hover:bg-muted/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span className="pr-2">{item.question}</span>
              <ChevronDown
                className={`h-4 w-4 md:h-5 md:w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-4 md:px-6 pb-3 md:pb-4 text-sm md:text-base text-muted-foreground">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function InfographicSection({
  image,
  caption,
  altText,
}: {
  image: string;
  caption: string;
  altText: string;
}) {
  if (!image && !caption) return null;
  return (
    <section className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="rounded-xl overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={altText || "Infographic"}
            className="w-full h-auto object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center bg-gradient-to-br from-primary/5 to-primary/10">
            <ImageIcon className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-xs sm:text-sm">
              Infographic placeholder
            </p>
            {caption && (
              <p className="text-muted-foreground/60 text-xs mt-1 max-w-xs">
                {caption}
              </p>
            )}
          </div>
        )}
      </div>
      {caption && (
        <p className="text-xs sm:text-sm text-muted-foreground text-center mt-2 md:mt-3">
          {caption}
        </p>
      )}
    </section>
  );
}

function GallerySection({
  title,
  images,
}: {
  title: string;
  images: string[];
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  const openLightbox = useCallback((idx: number) => setLightboxIndex(idx), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft")
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + images.length) % images.length : null,
        );
      if (e.key === "ArrowRight")
        setLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % images.length : null,
        );
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, images.length, closeLightbox]);

  if (images.length === 0) return null;

  return (
    <>
      <section
        ref={sectionRef}
        className="container mx-auto max-w-6xl px-4 py-12 md:py-16"
      >
        {title && (
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => openLightbox(i)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{
                animation: `gallery-fade-in 0.5s ease-out ${i * 0.08}s both`,
              }}
            >
              {!loaded.has(i) && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
              <img
                src={src}
                alt={`${title || "Gallery"} image ${i + 1}`}
                loading="lazy"
                onLoad={() =>
                  setLoaded((prev) => new Set(prev).add(i))
                }
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                  loaded.has(i) ? "opacity-100" : "opacity-0"
                }`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (prev) =>
                      prev !== null
                        ? (prev - 1 + images.length) % images.length
                        : null,
                  );
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (prev) =>
                      prev !== null ? (prev + 1) % images.length : null,
                  );
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <img
            src={images[lightboxIndex]}
            alt={`${title || "Gallery"} image ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes gallery-fade-in {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}

interface CategoryFieldsRendererProps {
  fields: CategoryFieldData;
  onNavigate?: (page: string, data?: unknown) => void;
}

export function CategoryFieldsRenderer({
  fields,
  onNavigate,
}: CategoryFieldsRendererProps) {
  const bullets = parseJsonArray<string>(fields.contentSplitBullets);
  const productIds = parseJsonArray<string>(fields.cardsProductIds);
  const steps = parseJsonArray<{ title: string; description: string }>(
    fields.processSteps,
  );
  const faqItems = parseJsonArray<{ question: string; answer: string }>(
    fields.faqItems,
  );
  const galleryImages = parseJsonArray<string>(fields.galleryImages);

  return (
    <>
      <HeroSection
        title={fields.heroTitle || ""}
        subtitle={fields.heroSubtitle || ""}
        description={fields.heroDescription || ""}
      />

      <ContentSplitSection
        image={fields.contentSplitImage || ""}
        heading={fields.contentSplitHeading || ""}
        paragraph={fields.contentSplitParagraph || ""}
        bullets={bullets}
      />

      <CardsSection
        title={fields.cardsTitle || ""}
        productIds={productIds}
        maxCount={fields.cardsMaxCount}
        columns={fields.cardsColumns}
        onNavigate={onNavigate}
      />

      <CtaSection
        heading={fields.ctaHeading || ""}
        description={fields.ctaDescription || ""}
        bulkText={fields.ctaBulkText || ""}
        bulkLink={fields.ctaBulkLink || ""}
        privateLabelText={fields.ctaPrivateLabelText || ""}
        privateLabelLink={fields.ctaPrivateLabelLink || ""}
        backgroundColor={fields.ctaBackgroundColor || "dark"}
        onNavigate={onNavigate}
      />

      <ProcessSection
        title={fields.processTitle || ""}
        subtitle={fields.processSubtitle || ""}
        steps={steps}
      />

      <InfographicSection
        image={fields.infographicImage || ""}
        caption={fields.infographicCaption || ""}
        altText={fields.infographicAltText || ""}
      />

      <GallerySection
        title={fields.galleryTitle || ""}
        images={galleryImages}
      />

      <FaqSection title={fields.faqTitle || ""} items={faqItems} />
    </>
  );
}
