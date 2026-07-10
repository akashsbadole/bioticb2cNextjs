"use client";

import { useEffect, useState, useRef } from "react";
import DOMPurify from "dompurify";
import { useAppStore } from "@/lib/store";
import {
  Image,
  ImageIcon,
  LayoutGrid,
  MousePointerClick,
  Quote,
  Images,
  Type,
  MoveVertical,
  Minus,
  Package,
  HelpCircle,
  Star,
  ChevronDown,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  GalleryHorizontal,
  Layers,
  User,
  TrendingUp,
  Users,
  Factory,
  Video,
  Award,
  FormInput,
  UserCircle,
  Building,
  ArrowDownToLine,
  Building2,
  ShieldCheck,
  Clock,
  Verified,
  Play,
  Phone,
  MessageCircle,
  Send,
  ArrowRight,
  Mail,
  Newspaper,
  CreditCard,
  Check,
  Columns,
  GitBranch,
  BarChart3,
  GitMerge,
  MapPin,
  Workflow,
} from "lucide-react";
import { getFirstImage } from "@/lib/utils";
import { formatPrice } from "@/lib/pricing";
import { VideoModal } from "./VideoModal";

// Curated icon map for dynamic resolution (instead of importing entire library)
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Image,
  LayoutGrid,
  MousePointerClick,
  Quote,
  Images,
  Type,
  MoveVertical,
  Minus,
  Package,
  HelpCircle,
  Star,
  ChevronDown,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  GalleryHorizontal,
  Layers,
  User,
  TrendingUp,
  Users,
  Factory,
  Video,
  Award,
  FormInput,
  UserCircle,
  Building,
  ArrowDownToLine,
  Building2,
  ShieldCheck,
  Clock,
  Verified,
  Play,
  Phone,
  MessageCircle,
  Send,
  ArrowRight,
  Mail,
  Newspaper,
  CreditCard,
  Check,
  Heart: () => null, // Placeholder for wishlist icon
  Lock: () => null, // Placeholder for security icon
  Globe: () => null, // Placeholder for global icon
};
import { motion, useInView, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { PageBlock } from "@/lib/page-blocks";
import { HomePage } from "./HomePage";
import { AboutPage } from "./AboutPage";
import { ManufacturingPage } from "./ManufacturingPage";
import { ContactPage } from "./ContactPage";
import { ProductsPage } from "./ProductsPage";

// Allowed HTML tags and attributes for sanitized content
const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "blockquote",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "hr",
    "div",
    "span",
    "pre",
    "code",
    "figure",
    "figcaption",
    "sup",
    "sub",
  ],
  ALLOWED_ATTR: [
    "href",
    "src",
    "alt",
    "title",
    "class",
    "id",
    "style",
    "target",
    "rel",
    "colspan",
    "rowspan",
  ],
};

// Dynamic icon resolver
function LucideIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = iconMap[name];
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  return <Star className={className} />;
}

interface BlockRendererProps {
  block?: PageBlock;
  onNavigate?: (page: string, data?: unknown) => void;
}

function HeroBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const bgImage = (data.backgroundImage as string) || "";
  const title = (data.title as string) || "Welcome";
  const subtitle = (data.subtitle as string) || "";
  const buttonText = (data.buttonText as string) || "";
  const buttonLink = (data.buttonLink as string) || "/catalogue";
  const height = (data.height as string) || "medium";
  const alignment = (data.alignment as string) || "center";

  const heightClasses: Record<string, string> = {
    small: "min-h-[200px] sm:min-h-[250px]",
    medium: "min-h-[300px] sm:min-h-[400px] lg:min-h-[450px]",
    large: "min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]",
  };

  const alignClasses: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div
      className={`relative flex items-center overflow-hidden w-full ${heightClasses[height] || heightClasses.medium}`}
    >
      {bgImage ? (
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
      )}
      <div className="absolute inset-0 bg-black/30" />
      <div
        className={`relative z-10 w-full ${alignClasses[alignment] || alignClasses.center}`}
      >
        <div className="mx-auto w-full px-6">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-lg text-white/90 sm:text-xl">{subtitle}</p>
          )}
          {buttonText && (
            <Button
              size="lg"
              className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() =>
                onNavigate &&
                buttonLink &&
                onNavigate(
                  buttonLink.startsWith("/") ? "content-page" : "catalogue",
                  buttonLink.replace("/page/", ""),
                )
              }
            >
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturesBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const columns = (data.columns as number) || 3;
  const features =
    (data.features as Array<{
      title: string;
      description: string;
      icon: string;
    }>) || [];

  const gridCols: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
      )}
      <div className={`grid gap-6 ${gridCols[columns] || gridCols[3]}`}>
        {features.map((feature, i) => (
          <Card key={i} className="text-center p-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark/30">
              <LucideIcon
                name={feature.icon || "Star"}
                className="h-6 w-6 text-primary"
              />
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            {feature.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

function CtaBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "";
  const description = (data.description as string) || "";
  const buttonText = (data.buttonText as string) || "";
  const buttonLink = (data.buttonLink as string) || "/contact";
  const backgroundColor = (data.backgroundColor as string) || "emerald";

  const bgClasses: Record<string, string> = {
    emerald: "bg-gradient-to-br from-primary to-primary/80",
    rose: "bg-gradient-to-br from-rose-600 to-pink-700",
    amber: "bg-gradient-to-br from-amber-600 to-orange-700",
    slate: "bg-gradient-to-br from-slate-700 to-slate-900",
  };

  return (
    <section
      className={`${bgClasses[backgroundColor] || bgClasses.emerald} rounded-xl p-8 text-center text-white sm:p-12`}
    >
      {title && <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>}
      {description && (
        <p className="mt-3 max-w-lg mx-auto text-white/90">{description}</p>
      )}
      {buttonText && (
        <Button
          size="lg"
          className="mt-6 bg-white text-primary/80 hover:bg-white/90"
          onClick={() =>
            onNavigate &&
            buttonLink &&
            onNavigate(
              buttonLink.startsWith("/") ? "content-page" : "contact",
              buttonLink.replace("/page/", ""),
            )
          }
        >
          {buttonText}
        </Button>
      )}
    </section>
  );
}

function TestimonialsBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const testimonials =
    (data.testimonials as Array<{
      name: string;
      role: string;
      quote: string;
      avatar: string;
    }>) || [];

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <Card key={i} className="p-6">
            <Quote className="h-8 w-8 text-primary/20 dark:text-primary-dark mb-4" />
            <p className="text-foreground/80 italic">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-4 flex items-center gap-3">
              {t.avatar ? (
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark/30">
                  <span className="text-sm font-semibold text-primary/80 dark:text-primary/40">
                    {t.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                {t.role && (
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ImageGalleryBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const columns = (data.columns as number) || 3;
  const images = (data.images as string[]) || [];

  const gridCols: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
      )}
      <div className={`grid gap-4 ${gridCols[columns] || gridCols[3]}`}>
        {images.filter(Boolean).map((src, i) => (
          <div
            key={i}
            className="aspect-square overflow-hidden rounded-lg bg-muted"
          >
            <img
              src={src}
              alt={`Gallery image ${i + 1}`}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function TextBlock({ data }: { data: Record<string, unknown> }) {
  const content = (data.content as string) || "";

  return (
    <section className="py-8">
      <div
        className="prose prose-neutral dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-p:text-foreground/80 prose-a:text-primary
          prose-img:rounded-lg"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(content, SANITIZE_OPTIONS),
        }}
      />
    </section>
  );
}

function SpacerBlock({ data }: { data: Record<string, unknown> }) {
  const height = (data.height as number) || 64;
  return <div style={{ height: `${height}px` }} />;
}

function DividerBlock({ data }: { data: Record<string, unknown> }) {
  const style = (data.style as string) || "solid";
  const borderClass =
    style === "dashed"
      ? "border-dashed"
      : style === "dotted"
        ? "border-dotted"
        : "border-solid";
  return <hr className={`my-8 ${borderClass} border-border`} />;
}

function ProductsBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "";
  const maxProducts = (data.maxProducts as number) || 6;
  const layout = (data.layout as string) || "grid";
  const [products, setProducts] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      shortDescription: string | null;
      price: number;
      comparePrice: number | null;
      images: string;
      Category: { id: string; name: string } | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `/api/products?featured=true&limit=${maxProducts}`,
        );
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [maxProducts]);

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden py-0 gap-0">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div
          className={
            layout === "list"
              ? "space-y-4 max-w-4xl mx-auto"
              : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          {products.map((product) => {
            const image = getFirstImage(product.images);
            return layout === "list" ? (
              <Card
                key={product.id}
                className="group flex flex-row overflow-hidden py-0 gap-0 transition-shadow hover:shadow-lg cursor-pointer h-32"
                onClick={() => onNavigate && onNavigate("product", product.id)}
              >
                <div className="relative w-32 shrink-0 overflow-hidden bg-muted">
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <ShoppingCart className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col justify-center flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  {product.shortDescription && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {product.shortDescription}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-base font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card
                key={product.id}
                className="group overflow-hidden py-0 gap-0 transition-shadow hover:shadow-lg cursor-pointer"
                onClick={() => onNavigate && onNavigate("product", product.id)}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <ShoppingCart className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  {product.Category && (
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {product.Category.name}
                    </span>
                  )}
                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.comparePrice &&
                      product.comparePrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No featured products available yet.
          </p>
        </Card>
      )}
    </section>
  );
}

function FaqBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const items =
    (data.items as Array<{ question: string; answer: string }>) || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
      )}
      <div className="max-w-3xl mx-auto space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <button
              className="flex w-full items-center justify-between px-6 py-4 text-left font-medium hover:bg-muted/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span>{item.question}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-6 pb-4 text-muted-foreground">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function CountUp({
  end,
  suffix = "",
}: {
  end: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, end, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [inView, end]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function TrustBarBlock({ data }: { data: Record<string, unknown> }) {
  const stats =
    (data.stats as Array<{ value: number; suffix: string; label: string }>) ||
    [];
  if (stats.length === 0) return null;

  const gridCols =
    stats.length === 1
      ? "grid-cols-1"
      : stats.length === 2
        ? "grid-cols-1 md:grid-cols-2"
        : stats.length <= 4
          ? "grid-cols-2 md:grid-cols-4"
          : "grid-cols-2 md:grid-cols-5";

  return (
    <section className="border-y bg-muted/50">
      <div className="container mx-auto px-4 py-10">
        <div className={`grid ${gridCols} divide-x divide-border`}>
          {stats.map((stat, i) => (
            <div key={i} className="text-center px-4 py-4 md:py-0">
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudienceCardsBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const label = (data.label as string) || "";
  const heading = (data.heading as string) || "";
  const description = (data.description as string) || "";
  const cards =
    (data.cards as Array<{
      title: string;
      description: string;
      cta: string;
      link?: string;
    }>) || [];
  const ctaButtonColor = data.ctaButtonColor as string;
  const ctaTextColor = (data.ctaTextColor as string) || "#FFFFFF";
  const showButton = data.showButton !== false;

  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        {label && (
          <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-2">
            {label}
          </p>
        )}
        {heading && (
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {heading}
          </h2>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mt-1 mb-8">
            {description}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="group border border-border/60 rounded-xl p-6 text-center hover:border-brand/30 hover:shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <h3 className="font-semibold text-sm">{card.title}</h3>
              <p className="text-xs text-muted-foreground mt-2 mb-4">
                {card.description}
              </p>
              {showButton && (
                <Button
                  size="sm"
                  style={{
                    backgroundColor: ctaButtonColor,
                    color: ctaTextColor,
                  }}
                  className="text-xs px-4 py-1.5 h-auto hover:opacity-90"
                  onClick={() => {
                    if (card.link && onNavigate) {
                      if (card.link.startsWith("/")) {
                        onNavigate(
                          card.link.startsWith("/page/")
                            ? "content-page"
                            : card.link === "/contact"
                              ? "contact"
                              : "catalogue",
                          card.link.replace("/page/", ""),
                        );
                      } else {
                        window.open(card.link, "_blank");
                      }
                    } else if (onNavigate) {
                      onNavigate("contact");
                    }
                  }}
                >
                  {card.cta}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function CapabilitiesBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const label = (data.label as string) || "";
  const heading = (data.heading as string) || "";
  const items = (data.items as string[]) || [];
  const image = (data.image as string) || "";
  const videoUrl = (data.videoUrl as string) || "";
  const imageCaption = (data.imageCaption as string) || "";
  const ctaText = (data.ctaText as string) || "";
  const ctaLink = (data.ctaLink as string) || "";

  const iconList = [Building2, Verified, Layers, Package, ShieldCheck, Clock];

  const galleryUrls = (data.galleryImages as string[]) || [];
  const hasGallery =
    galleryUrls.length > 0 && galleryUrls.some((u) => u && u.length > 0);

  const renderMedia = () => {
    if (hasGallery) {
      return (
        <div className="grid grid-cols-2 gap-2 w-full">
          {[0, 1, 2, 3].map((i) =>
            galleryUrls[i] ? (
              <div
                key={i}
                className="aspect-square rounded-md overflow-hidden bg-muted"
              >
                <img
                  src={galleryUrls[i]}
                  alt={`${imageCaption || "Capabilities"} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                key={i}
                className="aspect-square rounded-md bg-muted flex items-center justify-center"
              >
                <Building2 className="h-6 w-6 text-muted-foreground/30" />
              </div>
            ),
          )}
        </div>
      );
    }
    if (videoUrl) {
      return (
        <div
          className="absolute inset-0 bg-cover bg-center cursor-pointer group"
          style={image ? { backgroundImage: `url(${image})` } : undefined}
          onClick={() => window.open(videoUrl, "_blank")}
        >
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="h-7 w-7 text-white ml-0.5" />
            </div>
          </div>
          {imageCaption && (
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-xs text-white bg-black/50 backdrop-blur rounded-lg px-3 py-2">
                {imageCaption}
              </p>
            </div>
          )}
        </div>
      );
    }
    if (image) {
      return (
        <>
          <img
            src={image}
            alt={imageCaption || "Capabilities"}
            className="w-full h-full object-cover"
          />
          {imageCaption && (
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-xs text-muted-foreground bg-background/80 backdrop-blur rounded-lg px-3 py-2">
                {imageCaption}
              </p>
            </div>
          )}
        </>
      );
    }
    return (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center">
          <Building2 className="h-12 w-12 text-brand/40" />
        </div>
        {imageCaption && (
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-xs text-muted-foreground bg-background/80 backdrop-blur rounded-lg px-3 py-2">
              {imageCaption}
            </p>
          </div>
        )}
      </>
    );
  };

  return (
    <section className="bg-muted/30 border-y">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          {label && (
            <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-2">
              {label}
            </p>
          )}
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3">
              {heading && (
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                  {heading}
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item, i) => {
                  const Icon = iconList[i % iconList.length];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className="flex items-center gap-3 p-2"
                    >
                      <Icon className="h-5 w-5 text-brand shrink-0" />
                      <span className="text-sm">{item}</span>
                    </motion.div>
                  );
                })}
              </div>
              {ctaText && (
                <Button
                  variant="outline"
                  className="mt-6 text-sm bg-primary text-white"
                  onClick={() => {
                    if (ctaLink && onNavigate) {
                      onNavigate(
                        ctaLink.startsWith("/page/")
                          ? "content-page"
                          : ctaLink === "/contact"
                            ? "contact"
                            : "catalogue",
                        ctaLink.replace("/page/", ""),
                      );
                    } else if (onNavigate) {
                      onNavigate("catalogue");
                    }
                  }}
                >
                  {ctaText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            <div
              className={`relative rounded-xl overflow-hidden bg-muted ${hasGallery ? "lg:col-span-2" : "lg:col-span-2 aspect-[4/3]"}`}
            >
              {renderMedia()}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProductCategoriesBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const label = (data.label as string) || "";
  const heading = (data.heading as string) || "";
  const description = (data.description as string) || "";
  const ctaText = (data.ctaText as string) || "";
  const ctaLink = (data.ctaLink as string) || "";
  const ctaButtonColor = data.ctaButtonColor as string;
  const ctaTextColor = (data.ctaTextColor as string) || "#FFFFFF";
  const showButton = data.showButton !== false;

  const [apiCategories, setApiCategories] = useState<
    Array<{
      id: string;
      name: string;
      slug?: string;
      description?: string | null;
      image?: string | null;
      _count?: { Product: number };
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/categories?all=true");
        if (res.ok && !cancelled) {
          const json = await res.json();
          const cats = (json.categories || json.data || []).filter(
            (c: { isActive?: boolean }) => c.isActive !== false,
          );
          setApiCategories(cats);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryIds = (data.categoryIds as string[]) || [];
  const cmsCategories =
    (data.categories as Array<{ name: string; variants: string }>) || [];

  let displayCategories = apiCategories;
  if (categoryIds.length > 0) {
    displayCategories = apiCategories.filter((c) => categoryIds.includes(c.id));
  }
  if (displayCategories.length === 0) {
    displayCategories = cmsCategories as any;
  }

  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        {label && (
          <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-2">
            {label}
          </p>
        )}
        {heading && (
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {heading}
          </h2>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mt-1 mb-8">
            {description}
          </p>
        )}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {displayCategories.map((cat, i) => (
              <motion.div
                key={cat.id || cat.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="group text-center cursor-pointer"
                onClick={() =>
                  onNavigate &&
                  onNavigate(
                    "category",
                    (cat.slug || cat.name || "")
                      .toLowerCase()
                      .replace(/\s+/g, "-"),
                  )
                }
              >
                <div className="aspect-square rounded-xl bg-muted flex items-center justify-center overflow-hidden border group-hover:border-brand/30 transition-colors">
                  {"image" in cat && cat.image ? (
                    <img
                      src={cat.image as string}
                      alt={cat.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <h3 className="font-medium text-sm mt-2">{cat.name}</h3>
                {"variants" in cat ? (
                  <p className="text-xs text-muted-foreground">
                    {(cat as { variants: string }).variants}
                  </p>
                ) : cat._count ? (
                  <p className="text-xs text-muted-foreground">
                    {cat._count.Product} product
                    {cat._count.Product !== 1 ? "s" : ""}
                  </p>
                ) : null}
              </motion.div>
            ))}
          </div>
        )}
        {ctaText && showButton && (
          <div className="text-center mt-10">
            <Button
              style={{ backgroundColor: ctaButtonColor, color: ctaTextColor }}
              className="hover:opacity-90"
              onClick={() => {
                if (ctaLink && onNavigate) {
                  onNavigate(
                    ctaLink.startsWith("/page/")
                      ? "content-page"
                      : ctaLink === "/contact"
                        ? "contact"
                        : "catalogue",
                    ctaLink.replace("/page/", ""),
                  );
                } else if (onNavigate) {
                  onNavigate("catalogue");
                }
              }}
            >
              {ctaText}
            </Button>
          </div>
        )}
      </motion.div>
    </section>
  );
}

function FactoryReelBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const label = (data.label as string) || "";
  const heading = (data.heading as string) || "";
  const description = (data.description as string) || "";
  const ctaText = (data.ctaText as string) || "";
  const videoUrl = (data.videoUrl as string) || "";
  const thumbnailUrl = (data.thumbnailUrl as string) || "";
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-foreground/5">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-brand-teal/10" />
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {label && (
              <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-2">
                {label}
              </p>
            )}
            {heading && (
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                {heading}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
                {description}
              </p>
            )}
            <div className="relative max-w-3xl mx-auto aspect-video rounded-xl overflow-hidden bg-muted border shadow-lg">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={heading}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-brand/5" />
              )}
              <div className="absolute inset-0 bg-black/20 group hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  className="w-16 h-16 rounded-full bg-primay flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-xl text-brand-foreground bg-primary text-white"
                  onClick={() => videoUrl && setIsVideoOpen(true)}
                >
                  <Play className="h-6 w-6 ml-0.5" />
                </button>
              </div>
            </div>
            {ctaText && (
              <Button
                variant="outline"
                className="mt-8 bg-primary text-white"
                onClick={() =>
                  onNavigate &&
                  onNavigate(
                    "content-page",
                    ((data.ctaLink as string) || "").replace("/page/", ""),
                  )
                }
              >
                {ctaText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </motion.div>
        </div>
      </section>
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl={videoUrl}
        title={heading}
      />
    </>
  );
}

function CertificationsBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const label = (data.label as string) || "";
  const heading = (data.heading as string) || "";
  const items = (data.items as string[]) || [];
  const ctaText = (data.ctaText as string) || "";
  const gallery =
    (data.gallery as Array<{ image: string; caption: string }>) || [];
  const hasGallery = gallery.length > 0 && gallery.some((g) => g.image);

  return (
    <section className="bg-muted/30 border-y">
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {label && (
            <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-2">
              {label}
            </p>
          )}
          {heading && (
            <h2 className="text-xl md:text-2xl font-bold mb-8">{heading}</h2>
          )}
          {hasGallery ? (
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {gallery
                .filter((g) => g.image)
                .map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 max-w-[140px]"
                  >
                    <div className="w-[170px] h-full rounded-xl bg-background border flex items-center justify-center p-2 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.caption || `Certification ${i + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {item.caption && (
                      <span className="text-xs font-semibold text-muted-foreground text-center leading-tight">
                        {item.caption}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6 items-center">
              {items.map((cert) => (
                <div
                  key={cert}
                  className="w-20 h-14 rounded-lg bg-background border flex items-center justify-center text-xs font-semibold text-muted-foreground hover:border-brand/40 hover:text-brand transition-colors"
                >
                  {cert}
                </div>
              ))}
            </div>
          )}
          {ctaText && (
            <p className="text-xs text-muted-foreground mt-6">{ctaText}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function LeadCaptureBlock({ data }: { data: Record<string, unknown> }) {
  const heading = (data.heading as string) || "";
  const description = (data.description as string) || "";
  const submitText = (data.submitText as string) || "Submit";
  const disclaimer = (data.disclaimer as string) || "";
  const fields =
    (data.fields as Array<{
      name: string;
      label: string;
      type: string;
      required: boolean;
      placeholder: string;
      options?: string[];
    }>) || [];
  const messageField = (data.messageField as boolean) ?? true;

  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      <div className="absolute inset-0 bg-green-900" />
      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {heading && (
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-2">
              {heading}
            </h2>
          )}
          {description && (
            <p className="text-sm text-white text-center mb-8">{description}</p>
          )}

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              const apiEndpoint =
                (data.apiEndpoint as string) || "/api/enquiries";
              const successMessage =
                (data.successMessage as string) ||
                "Enquiry submitted! We'll call you back within 24 hours.";

              try {
                const res = await fetch(apiEndpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(Object.fromEntries(formData)),
                });
                if (res.ok) {
                  toast.success(successMessage, {
                    icon: <Send className="h-4 w-4" />,
                  });
                  form.reset();
                } else {
                  const err = await res.json();
                  toast.error(
                    err.error || "Failed to submit. Please try again.",
                  );
                }
              } catch {
                toast.error("Network error. Please try again.");
              }
            }}
          >
            {fields.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {fields.map((field) => (
                  <div
                    key={field.name}
                    className={`space-y-1 ${field.type === "textarea" ? "sm:col-span-2 md:col-span-3" : ""}`}
                  >
                    {field.label && (
                      <label className="text-xs font-medium text-background/80 ml-1">
                        {field.label}
                        {field.required && (
                          <span className="text-rose-400 ml-1">*</span>
                        )}
                      </label>
                    )}
                    {field.type === "select" ? (
                      <Select name={field.name} required={field.required}>
                        <SelectTrigger className="bg-background/10 border-background/20 text-background">
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options || []).map((opt) => (
                            <SelectItem key={opt} value={opt.toLowerCase()}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "textarea" ? (
                      <Textarea
                        name={field.name}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                        rows={4}
                      />
                    ) : (
                      <Input
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            {messageField && (
              <Textarea
                name="message"
                placeholder="Brief requirement or message (optional)"
                rows={3}
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
              />
            )}
            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                className="bg-primary text-white hover:bg-background/40"
              >
                {submitText}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
            {disclaimer && (
              <p className="text-xs text-background/50 text-center mt-3">
                {disclaimer}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}

function LeadershipBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const label = (data.label as string) || "";
  const heading = (data.heading as string) || "";
  const members =
    (data.members as Array<{
      name: string;
      role: string;
      bio: string;
      image?: string;
      photo?: string;
    }>) || [];
  const ctaText = (data.ctaText as string) || "";

  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        {label && (
          <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-2">
            {label}
          </p>
        )}
        {heading && (
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
            {heading}
          </h2>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          {members.map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex items-start gap-4 p-4 rounded-xl border"
            >
              <div className="w-[150px] h-full rounded-lg bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center border">
                {person.image ? (
                  <img
                    src={person.image}
                    alt={person.name}
                    className="w-[full] h-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{person.name}</h3>
                <p className="text-xs text-muted-foreground">{person.role}</p>
                <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
                  {person.bio}
                </p>
              </div>
            </motion.div>
          ))}
          {ctaText && (
            <div className="flex flex-col justify-center items-center gap-2 p-4 rounded-xl border border-dashed">
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-primary text-white"
                onClick={() => {
                  const ctaLink = (data.ctaLink as string) || "";
                  if (ctaLink && onNavigate) {
                    onNavigate(
                      ctaLink.startsWith("/page/")
                        ? "content-page"
                        : ctaLink === "/contact"
                          ? "contact"
                          : "catalogue",
                      ctaLink.replace("/page/", ""),
                    );
                  } else if (onNavigate) {
                    onNavigate("contact");
                  }
                }}
              >
                {ctaText}
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

function PartnerLogosBlock({ data }: { data: Record<string, unknown> }) {
  const heading = (data.heading as string) || "";
  const testimonials =
    (data.testimonials as Array<{ quote: string; author: string }>) || [];
  const logos =
    (data.logos as Array<string | { url: string; alt?: string }> | string[]) ||
    [];
  const logoCount = (data.logoCount as number) || 0;

  const renderLogos = () => {
    if (logos.length > 0) {
      return (
        <div className="flex flex-wrap justify-center gap-8 items-center border-t pt-8">
          {logos.map((logo, i) => {
            const logoUrl = typeof logo === "string" ? logo : logo.url;
            const logoAlt =
              typeof logo === "string"
                ? `Partner ${i + 1}`
                : logo.alt || `Partner ${i + 1}`;
            return (
              <div
                key={i}
                className="h-10 w-24 flex items-center justify-center"
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={logoAlt}
                    className="max-h-full max-w-full object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
                  />
                ) : (
                  <div className="h-8 w-16 rounded bg-muted border flex items-center justify-center text-xs text-muted-foreground">
                    Logo {i + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    if (logoCount > 0) {
      return (
        <div className="flex flex-wrap justify-center gap-8 items-center border-t pt-8">
          {Array.from({ length: logoCount }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-16 rounded bg-muted border flex items-center justify-center text-xs text-muted-foreground"
            >
              Logo {i + 1}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-muted/30 border-y">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          {heading && (
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-8">
              {heading}
            </h2>
          )}
          {testimonials.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="p-5 rounded-xl border bg-background"
                >
                  <p className="text-sm text-foreground leading-relaxed italic">
                    {t.quote}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    — {t.author}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
          {logos.length > 0 && (
            <div className="flex flex-wrap justify-center gap-12 items-center border-t pt-12">
              {logos.filter(Boolean).map((logo, i) => {
                const logoUrl = typeof logo === "string" ? logo : logo.url;
                const logoAlt =
                  typeof logo === "string"
                    ? "Partner Logo"
                    : logo.alt || "Partner Logo";
                return (
                  <motion.img
                    key={i}
                    initial={{ opacity: 0, filter: "grayscale(100%)" }}
                    whileInView={{ opacity: 0.6, filter: "grayscale(100%)" }}
                    whileHover={{ opacity: 1, filter: "grayscale(0%)" }}
                    viewport={{ once: true }}
                    src={logoUrl}
                    alt={logoAlt}
                    className="h-8 md:h-10 w-auto object-contain transition-all"
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function StickyCtaBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const { settings } = useAppStore();
  const text = (data.text as string) || "";
  const buttons =
    (data.buttons as Array<{
      text: string;
      type: string;
      action: string;
      link?: string;
    }>) || [];
  const whatsappNumber = settings?.whatsapp_number || "";
  const visible = data.visible === true;

  if (!visible) return null;

  return (
    <div className="sticky bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        {text && <span className="text-sm font-semibold">{text}</span>}
        <div className="flex gap-2">
          {buttons.map((btn, i) => (
            <Button
              key={i}
              size="sm"
              variant={
                btn.type === "primary"
                  ? "default"
                  : btn.type === "whatsapp"
                    ? "outline"
                    : "ghost"
              }
              className={
                btn.type === "primary"
                  ? "bg-primary text-brand-foreground hover:bg-brand-muted"
                  : btn.type === "whatsapp"
                    ? "border-brand-teal text-brand-teal hover:bg-brand-teal/10"
                    : "text-muted-foreground"
              }
              onClick={() => {
                if (btn.action === "enquiry") {
                  onNavigate?.("contact");
                } else if (btn.action === "whatsapp") {
                  window.open(btn.link || "https://wa.me/", "_blank");
                } else if (btn.action === "phone") {
                  window.location.href = btn.link || "tel:";
                } else if (btn.action === "link") {
                  if (btn.link?.startsWith("/page/")) {
                    onNavigate?.(
                      "content-page",
                      btn.link.replace("/page/", ""),
                    );
                  } else if (btn.link === "/" || btn.link === "/home") {
                    onNavigate?.("home");
                  } else if (btn.link === "/catalogue") {
                    onNavigate?.("catalogue");
                  } else if (btn.link === "/contact") {
                    onNavigate?.("contact");
                  } else if (
                    btn.link === "/about" ||
                    btn.link === "/about-us"
                  ) {
                    onNavigate?.("about");
                  } else if (btn.link === "/manufacturing") {
                    onNavigate?.("manufacturing");
                  } else if (btn.link === "/blog") {
                    onNavigate?.("blog");
                  } else if (btn.link?.startsWith("/blog/")) {
                    onNavigate?.("blog-post", btn.link.replace("/blog/", ""));
                  } else if (btn.link?.startsWith("/product/")) {
                    onNavigate?.(
                      "product-page",
                      btn.link.replace("/product/", ""),
                    );
                  } else if (btn.link?.startsWith("/")) {
                    onNavigate?.("content-page", btn.link.replace(/^\//, ""));
                  } else if (btn.link) {
                    window.open(btn.link, "_blank");
                  }
                }
              }}
            >
              {btn.type === "whatsapp" && (
                <MessageCircle className="mr-1.5 h-4 w-4" />
              )}
              {btn.type === "phone" && <Phone className="mr-1.5 h-4 w-4" />}
              {btn.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

const BLOCK_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  hero: Image,
  features: LayoutGrid,
  cta: MousePointerClick,
  testimonials: Quote,
  "image-gallery": Images,
  text: Type,
  spacer: MoveVertical,
  divider: Minus,
  products: Package,
  faq: HelpCircle,
  slider: GalleryHorizontal,
  "product-carousel": Layers,
  about: User,
  "trust-bar": TrendingUp,
  "audience-cards": Users,
  capabilities: Factory,
  "product-categories": LayoutGrid,
  "factory-reel": Video,
  certifications: Award,
  "lead-capture": FormInput,
  leadership: UserCircle,
  "partner-logos": Building,
  "sticky-cta": ArrowDownToLine,
  "blog-grid": Newspaper,
  "pricing-table": CreditCard,
  "hero-split": Columns,
  timeline: GitBranch,
  "metrics-bar": BarChart3,
  "process-flow": GitMerge,
  "packaging-grid": Package,
  "certification-cards": Award,
  "address-cards": MapPin,
  "quick-connect": Phone,
  "crm-flow": Workflow,
  "product-hero": Type,
  "product-content-split": Columns,
  "product-cards": LayoutGrid,
  "product-cta": MousePointerClick,
  "product-process": GitMerge,
  "product-infographic": Image,
};

function BlogGridBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "Latest from our blog";
  const maxPosts = (data.maxPosts as number) || 6;
  const layout = (data.layout as string) || "grid";
  const showFeatured = (data.showFeatured as boolean) !== false;

  const [posts, setPosts] = useState<
    Array<{
      id: string;
      title: string;
      slug: string;
      excerpt: string;
      coverImage: string;
      publishedAt: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(`/api/blog?limit=${maxPosts}&published=true`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts?.slice(0, maxPosts) || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [maxPosts]);

  if (loading) {
    return (
      <div className="py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-16">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground">No blog posts available yet.</p>
        </div>
      </div>
    );
  }

  const displayPosts = showFeatured ? posts : posts.slice(1);

  return (
    <div className="py-16">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>

        {layout === "list" ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            {displayPosts.map((post) => (
              <div
                key={post.id}
                className="flex gap-4 items-start rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-20 w-20 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : layout === "carousel" ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6">
              {displayPosts.map((post) => (
                <div
                  key={post.id}
                  className="min-w-[280px] max-w-[320px] rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-40 w-full rounded-t-xl object-cover"
                    />
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold line-clamp-2">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      {post.publishedAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border bg-card flex flex-col"
              >
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-48 w-full object-cover rounded-t-xl"
                  />
                ) : (
                  <div className="h-48 w-full bg-muted flex items-center justify-center rounded-t-xl">
                    <Newspaper className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    {post.publishedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <button
            onClick={() => onNavigate?.("blog")}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/80 transition-colors"
          >
            View all posts <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PricingTableBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "Our Pricing";
  const description = (data.description as string) || "";
  const tiers =
    (data.tiers as Array<{
      name: string;
      price: string;
      description: string;
      features: string[];
      ctaText: string;
      ctaLink: string;
      highlighted: boolean;
    }>) || [];

  if (tiers.length === 0) return null;

  return (
    <div className="py-16">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`rounded-xl border bg-card p-6 flex flex-col relative ${
                tier.highlighted
                  ? "border-primary/50 shadow-lg ring-1 ring-primary/50 scale-105 md:scale-110 z-10"
                  : "shadow-sm"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="text-center mt-2">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="text-3xl font-bold mt-3">{tier.price}</p>
                {tier.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {tier.description}
                  </p>
                )}
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {(tier.features || []).map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (tier.ctaLink)
                    onNavigate?.(
                      "content-page",
                      tier.ctaLink.replace("/page/", ""),
                    );
                  else onNavigate?.("contact");
                }}
                className={`mt-6 w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                  tier.highlighted
                    ? "bg-primary text-white hover:bg-primary/80"
                    : "bg-muted text-foreground hover:bg-accent"
                }`}
              >
                {tier.ctaText || "Get started"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroSplitBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "";
  const subtitle = (data.subtitle as string) || "";
  const description = (data.description as string) || "";
  const buttons =
    (data.buttons as Array<{ text: string; link: string; variant: string }>) ||
    [];
  const badges = (data.badges as string[]) || [];
  const ctaButtonColor = data.ctaButtonColor as string;
  const ctaTextColor = (data.ctaTextColor as string) || "#FFFFFF";

  return (
    <section className="relative bg-gradient-to-br from-green-900 via-[#abd0ff] to-green-900 text-white py-28 px-4 w-full">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative max-w-5xl mx-auto text-center">
        {badges.length > 0 && (
          <div className="flex gap-2 justify-center mb-6">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs text-gray-300"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
        {subtitle && (
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-3">
            {subtitle}
          </p>
        )}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 whitespace-pre-line">
          {title}
        </h1>
        {description && (
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            {description}
          </p>
        )}
        {buttons.length > 0 && (
          <div className="flex gap-4 justify-center">
            {buttons.map((btn) => (
              <button
                key={btn.text}
                onClick={() => {
                  if (btn.link) {
                    const page =
                      btn.link === "/contact"
                        ? "contact"
                        : btn.link === "/catalogue"
                          ? "catalogue"
                          : "content-page";
                    onNavigate?.(
                      page,
                      btn.link.replace("/page/", "").replace("/", ""),
                    );
                  }
                }}
                className={`text-sm font-medium rounded-full px-6 py-2.5 transition-colors ${
                  btn.variant === "primary"
                    ? `hover:opacity-90`
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                style={
                  btn.variant === "primary"
                    ? { backgroundColor: ctaButtonColor, color: ctaTextColor }
                    : undefined
                }
              >
                {btn.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TimelineBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const subtitle = (data.subtitle as string) || "";
  const items =
    (data.items as Array<{
      year: string;
      title: string;
      description: string;
      current?: boolean;
    }>) || [];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {subtitle && (
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            {subtitle}
          </p>
        )}
        <h2 className="text-2xl font-bold mb-10">{title}</h2>
        <div className="space-y-0">
          {items.map((item, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${item.current ? "bg-emerald-600" : "bg-primary"}`}
                />
                {i < items.length - 1 && <div className="w-px h-8 bg-border" />}
              </div>
              <div className="pb-6">
                <p
                  className={`text-xs font-semibold ${item.current ? "text-emerald-600" : "text-primary"}`}
                >
                  {item.year}
                </p>
                <p className="text-sm font-semibold mt-0.5">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricsBarBlock({ data }: { data: Record<string, unknown> }) {
  const stats = (data.stats as Array<{ value: string; label: string }>) || [];

  return (
    <section className="py-12 px-4 bg-muted/40">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-background border rounded-lg p-5 text-center"
            >
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessFlowBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const subtitle = (data.subtitle as string) || "";
  const steps =
    (data.steps as Array<{
      title: string;
      description: string;
      icon: string;
    }>) || [];
  const trustItems = (data.trustItems as string[]) || [];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {subtitle && (
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            {subtitle}
          </p>
        )}
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <div className="flex flex-col md:flex-row items-start gap-2 mt-8">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-start flex-1">
              <div className="flex flex-col items-center text-center flex-1">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 text-lg font-bold">
                  {i + 1}
                </div>
                <p className="text-sm font-semibold mb-1">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-start pt-5 px-1 text-muted-foreground">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
        {trustItems.length > 0 && (
          <div className="mt-10 bg-muted/50 border rounded-lg p-4 flex flex-wrap gap-6 items-center">
            {trustItems.map((item) => (
              <span
                key={item}
                className="text-xs text-muted-foreground flex items-center gap-1.5"
              >
                <span className="text-emerald-600">✓</span> {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PackagingGridBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "";
  const subtitle = (data.subtitle as string) || "";
  const items =
    (data.items as Array<{
      title: string;
      description: string;
      tag: string;
      highlight: boolean;
    }>) || [];

  return (
    <section className="py-12 px-4 bg-muted/40">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.title}
              className={`rounded-xl p-5 text-center ${item.highlight ? "border-2 border-primary bg-background relative" : "border bg-background"}`}
            >
              {item.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                  Most requested
                </span>
              )}
              <div className="h-24 bg-muted rounded-lg mb-4 flex items-center justify-center text-xs text-muted-foreground">
                {item.title} photo
              </div>
              <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {item.description}
              </p>
              <span
                className={`text-[10px] px-2 py-0.5 rounded ${item.highlight ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
              >
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CertificationCardsBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const certs =
    (data.certs as Array<{ name: string; description: string }>) || [];
  const footerText = (data.footerText as string) || "";

  return (
    <section className="py-16 px-4 bg-muted/40">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold mb-8">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {certs.map((cert) => (
            <div
              key={cert.name}
              className="bg-background border rounded-xl p-5 text-center"
            >
              <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-3 flex items-center justify-center text-xs font-bold text-muted-foreground">
                {cert.name.substring(0, 4)}
              </div>
              <p className="text-sm font-semibold mb-1">{cert.name}</p>
              <p className="text-xs text-muted-foreground">
                {cert.description}
              </p>
            </div>
          ))}
        </div>
        {footerText && (
          <div className="bg-background border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">{footerText}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function AddressCardsBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "";
  const cards =
    (data.cards as Array<{
      type: string;
      title: string;
      address?: string;
      description?: string;
      badge?: string;
    }>) || [];

  return (
    <section className="py-12 px-4 bg-muted/40">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-lg font-bold mb-8">{title}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`bg-background border rounded-xl p-5 ${card.type === "factory" ? "border-t-4 border-t-primary" : card.type === "visit" ? "bg-emerald-50 border-emerald-200 border-t-4 border-t-emerald-600" : "border-t-4 border-t-muted"}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <p className="text-sm font-semibold">{card.title}</p>
                {card.badge && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-auto">
                    {card.badge}
                  </span>
                )}
              </div>
              {card.address && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 whitespace-pre-line">
                  {card.address}
                </p>
              )}
              {card.description && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {card.description}
                </p>
              )}
              {card.type === "visit" && (
                <button
                  onClick={() => onNavigate?.("manufacturing")}
                  className="w-full bg-emerald-600 text-white text-xs font-medium rounded py-2.5 hover:bg-emerald-700 transition-colors"
                >
                  Schedule a factory visit →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickConnectBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "";
  const channels =
    (data.channels as Array<{
      type: string;
      title: string;
      description: string;
      value: string;
    }>) || [];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-lg font-bold mb-8">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {channels.map((ch) => (
            <div
              key={ch.title}
              className={`rounded-xl p-5 text-center border ${ch.type === "whatsapp" ? "bg-emerald-50 border-emerald-200" : "bg-background"}`}
            >
              <p className="text-sm font-semibold mb-1">{ch.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {ch.description}
              </p>
              <p
                className={`text-sm font-medium mb-3 ${ch.type === "whatsapp" ? "text-emerald-600" : ch.type === "phone" ? "text-primary" : "text-amber-600"}`}
              >
                {ch.value}
              </p>
              <button
                onClick={() => {
                  if (ch.type === "catalogue") onNavigate?.("catalogue");
                  else if (
                    ch.type === "whatsapp" ||
                    ch.type === "phone" ||
                    ch.type === "email"
                  )
                    onNavigate?.("contact");
                }}
                className="w-full text-xs font-medium rounded py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {ch.type === "whatsapp"
                  ? "Open WhatsApp →"
                  : ch.type === "phone"
                    ? "Tap to call"
                    : ch.type === "email"
                      ? "Copy email"
                      : "Get catalogue"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CrmFlowBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const steps =
    (data.steps as Array<{
      num: number;
      title: string;
      description: string;
    }>) || [];

  return (
    <section className="py-12 px-4 bg-gray-900 text-white">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-lg font-bold text-center mb-8">{title}</h2>
        <div className="grid grid-cols-5 gap-0">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`text-center px-3 ${i < steps.length - 1 ? "border-r border-white/10" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mx-auto mb-3 text-xs font-bold">
                {step.num}
              </div>
              <p className="text-xs font-semibold mb-1">{step.title}</p>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SliderBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const items =
    (data.items as Array<{
      image: string;
      title: string;
      subtitle: string;
      link: string;
    }>) || [];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (data.autoplay && items.length > 1) {
      const timer = setInterval(
        () => {
          setActiveIndex((prev) => (prev + 1) % items.length);
        },
        (data.interval as number) || 5000,
      );
      return () => clearInterval(timer);
    }
  }, [items.length, data.autoplay, data.interval]);

  if (items.length === 0) return null;

  const ctaButtonColor = data.ctaButtonColor as string;
  const ctaTextColor = (data.ctaTextColor as string) || "#FFFFFF";

  return (
    <div className="relative h-[300px] sm:h-[450px] w-full overflow-hidden">
      {items.map((item, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-primary/80" />
          )}
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center p-6">
            <h2 className="text-3xl font-bold sm:text-5xl">{item.title}</h2>
            <p className="mt-4 text-lg text-white/90 max-w-2xl">
              {item.subtitle}
            </p>
            {item.link && (
              <Button
                style={{ backgroundColor: ctaButtonColor, color: ctaTextColor }}
                className="hover:opacity-90"
                onClick={() => onNavigate && onNavigate("catalogue")}
              >
                View Collection
              </Button>
            )}
          </div>
        </div>
      ))}
      {items.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={() =>
              setActiveIndex((prev) => (prev - 1 + items.length) % items.length)
            }
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={() => setActiveIndex((prev) => (prev + 1) % items.length)}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
}

function AboutBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "";
  const content = (data.content as string) || "";
  const image = (data.image as string) || "";
  const imagePosition = (data.imagePosition as string) || "left";
  const buttonText = (data.buttonText as string) || "";
  const buttonLink = (data.buttonLink as string) || "";

  return (
    <section className="py-12">
      <div
        className={`flex flex-col ${imagePosition === "right" ? "lg:flex-row-reverse" : "lg:flex-row"} gap-12 items-center`}
      >
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <div
            className="prose prose-neutral dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(content, SANITIZE_OPTIONS),
            }}
          />
          {buttonText && (
            <Button
              variant="outline"
              onClick={() => {
                if (buttonLink && onNavigate) {
                  onNavigate(
                    buttonLink.startsWith("/page/")
                      ? "content-page"
                      : buttonLink === "/contact"
                        ? "contact"
                        : "catalogue",
                    buttonLink.replace("/page/", ""),
                  );
                } else if (onNavigate) {
                  onNavigate("contact");
                }
              }}
            >
              {buttonText}
            </Button>
          )}
        </div>
        {image && (
          <div className="flex-1 w-full max-w-xl">
            <img
              src={image}
              alt={title}
              className="rounded-2xl shadow-xl w-full object-cover aspect-4/3"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ProductHeroBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const subtitle = (data.subtitle as string) || "";
  const description = (data.description as string) || "";

  return (
    <section className="container mx-auto max-w-3xl px-4 py-12 text-center">
      {subtitle && (
        <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
          {subtitle}
        </p>
      )}
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
      )}
      {description && (
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </section>
  );
}

function ProductContentSplitBlock({ data }: { data: Record<string, unknown> }) {
  const image = (data.image as string) || "";
  const heading = (data.heading as string) || "";
  const paragraph = (data.paragraph as string) || "";
  const bullets = (data.bullets as string[]) || [];

  return (
    <section className="container mx-auto max-w-5xl px-4 py-16">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
          {image ? (
            <img
              src={image}
              alt={heading}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div>
          {heading && (
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{heading}</h2>
          )}
          {paragraph && (
            <p className="text-muted-foreground leading-relaxed mb-6">
              {paragraph}
            </p>
          )}
          {bullets.length > 0 && (
            <ul className="space-y-3">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-foreground">{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductCardsBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "Our range";
  const productIds = (data.productIds as string[]) || [];
  const maxCards = (data.maxCards as number) || 8;
  const columns = (data.columns as number) || 4;

  const [products, setProducts] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      shortDescription: string | null;
      images: string;
      Category?: { name: string; slug?: string } | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams({
          all: "true",
          limit: String(maxCards),
        });
        if (productIds.length > 0) {
          params.set("ids", productIds.join(","));
        }
        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts((data.products || []).slice(0, maxCards));
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [productIds.join(","), maxCards]);

  return (
    <section className="container mx-auto max-w-6xl px-4 py-16">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          {title}
        </h2>
      )}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: Math.min(columns, 4) }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card animate-pulse overflow-hidden"
            >
              <div className="h-48 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? null : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${Math.min(columns, 4)}, minmax(0, 1fr))`,
          }}
        >
          {products.map((product) => {
            const image = getFirstImage(product.images);
            return (
              <div
                key={product.id}
                className="rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="relative h-48 bg-muted overflow-hidden">
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                      <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  {product.shortDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.shortDescription}
                    </p>
                  )}
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={() =>
                      useAppStore
                        .getState()
                        .openEnquiryModal(product.name, product.id)
                    }
                  >
                    <Send className="mr-2 h-3.5 w-3.5" />
                    Enquire
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ProductCtaBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const heading = (data.heading as string) || "";
  const description = (data.description as string) || "";
  const backgroundColor = (data.backgroundColor as string) || "dark";
  const showBulkCta = (data.showBulkCta as boolean) !== false;
  const bulkCtaText =
    (data.bulkCtaText as string) || "Enquire for Bulk Order →";
  const bulkCtaLink = (data.bulkCtaLink as string) || "/contact";
  const showPrivateLabelCta = (data.showPrivateLabelCta as boolean) !== false;
  const privateLabelCtaText =
    (data.privateLabelCtaText as string) || "Start Private Label →";
  const privateLabelCtaLink =
    (data.privateLabelCtaLink as string) || "/contact";

  const isDark = backgroundColor === "dark";

  return (
    <section
      className={`py-16 ${isDark ? "bg-foreground text-background" : "bg-muted"}`}
    >
      <div className="container mx-auto max-w-3xl px-4 text-center">
        {heading && (
          <h2
            className={`text-2xl md:text-3xl font-bold mb-3 ${isDark ? "text-background" : ""}`}
          >
            {heading}
          </h2>
        )}
        {description && (
          <p
            className={`text-lg mb-8 max-w-xl mx-auto ${isDark ? "text-background/70" : "text-muted-foreground"}`}
          >
            {description}
          </p>
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          {showBulkCta && (
            <Button
              size="lg"
              onClick={() => {
                const [page, slug] = bulkCtaLink.replace(/^\//, "").split("/");
                if (page === "contact") {
                  useAppStore.getState().openEnquiryModal(heading);
                } else {
                  onNavigate?.("content-page", slug || page);
                }
              }}
            >
              {bulkCtaText}
            </Button>
          )}
          {showPrivateLabelCta && (
            <Button
              size="lg"
              variant={isDark ? "secondary" : "outline"}
              onClick={() => {
                const [page, slug] = privateLabelCtaLink
                  .replace(/^\//, "")
                  .split("/");
                if (page === "contact") {
                  useAppStore.getState().openEnquiryModal(heading);
                } else {
                  onNavigate?.("content-page", slug || page);
                }
              }}
            >
              {privateLabelCtaText}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductProcessBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const subtitle = (data.subtitle as string) || "";
  const steps =
    (data.steps as Array<{ title: string; description: string }>) || [];

  return (
    <section className="container mx-auto max-w-5xl px-4 py-16">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
      {steps.length > 0 && (
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
              <p className="text-xs text-muted-foreground">
                {step.description}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[60%] w-[80%] h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ProductInfographicBlock({ data }: { data: Record<string, unknown> }) {
  const image = (data.image as string) || "";
  const caption = (data.caption as string) || "";
  const altText = (data.altText as string) || "Infographic";

  return (
    <section className="container mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-xl overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={altText}
            className="w-full h-auto object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-gradient-to-br from-primary/5 to-primary/10">
            <ImageIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">
              Infographic placeholder
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1 max-w-xs">
              {caption ||
                "e.g. nutrition breakdown, sourcing map, or comparison visual"}
            </p>
          </div>
        )}
      </div>
      {caption && (
        <p className="text-sm text-muted-foreground text-center mt-3">
          {caption}
        </p>
      )}
    </section>
  );
}

export function PageBlockRenderer({
  block,
  blocks,
  onNavigate,
}: BlockRendererProps & { blocks?: PageBlock[] }) {
  if (blocks) {
    return (
      <>
        {blocks.map((b) => (
          <PageBlockRenderer key={b.id} block={b} onNavigate={onNavigate} />
        ))}
      </>
    );
  }

  if (!block) return null;
  const { type, data } = block;

  const bgColor = (data.bgColor as string) || "";
  const paddingTop = (data.paddingTop as number) ?? 80;
  const paddingBottom = (data.paddingBottom as number) ?? 80;
  const customClass = (data.customClass as string) || "";

  const styleContainer = (element: React.ReactNode) => {
    if (!bgColor && paddingTop === 80 && paddingBottom === 80 && !customClass)
      return element;
    return (
      <div
        className={customClass || undefined}
        style={{
          backgroundColor: bgColor || undefined,
          paddingTop: paddingTop !== 80 ? `${paddingTop}px` : undefined,
          paddingBottom:
            paddingBottom !== 80 ? `${paddingBottom}px` : undefined,
        }}
      >
        {element}
      </div>
    );
  };

  const blockElement = (() => {
    switch (type) {
      // Essential reusable blocks
      case "hero":
        return <HeroBlock data={data} onNavigate={onNavigate} />;
      case "text":
        return <TextBlock data={data} />;
      case "image-gallery":
        return <ImageGalleryBlock data={data} />;
      case "features":
        return <FeaturesBlock data={data} />;
      case "cta":
        return <CtaBlock data={data} onNavigate={onNavigate} />;
      case "testimonials":
        return <TestimonialsBlock data={data} />;
      case "spacer":
        return <SpacerBlock data={data} />;
      case "divider":
        return <DividerBlock data={data} />;
      case "products":
        return <ProductsBlock data={data} onNavigate={onNavigate} />;
      case "trust-bar":
        return <TrustBarBlock data={data} />;
      case "audience-cards":
        return <AudienceCardsBlock data={data} onNavigate={onNavigate} />;
      case "capabilities":
        return <CapabilitiesBlock data={data} onNavigate={onNavigate} />;
      case "product-categories":
        return <ProductCategoriesBlock data={data} onNavigate={onNavigate} />;
      case "factory-reel":
        return <FactoryReelBlock data={data} onNavigate={onNavigate} />;
      case "certifications":
        return <CertificationsBlock data={data} onNavigate={onNavigate} />;
      case "lead-capture":
        return <LeadCaptureBlock data={data} />;
      case "leadership":
        return <LeadershipBlock data={data} onNavigate={onNavigate} />;
      case "partner-logos":
        return <PartnerLogosBlock data={data} />;
      case "sticky-cta":
        return <StickyCtaBlock data={data} onNavigate={onNavigate} />;
      case "faq":
        return <FaqBlock data={data} />;

      // Page content blocks (fully customizable)
      case "homepage-content":
        return <HomePage data={data} onNavigate={onNavigate || (() => {})} />;
      case "about-page-content":
        return <AboutPage data={data} onNavigate={onNavigate || (() => {})} />;
      case "manufacturing-content":
        return (
          <ManufacturingPage
            data={data}
            onNavigate={onNavigate || (() => {})}
          />
        );
      case "contact-page-content":
        return (
          <ContactPage data={data} onNavigate={onNavigate || (() => {})} />
        );
      case "products-page-content":
        return (
          <ProductsPage data={data} onNavigate={onNavigate || (() => {})} />
        );

      // Product page blocks
      case "product-hero":
        return <ProductHeroBlock data={data} />;
      case "product-content-split":
        return <ProductContentSplitBlock data={data} />;
      case "product-cards":
        return <ProductCardsBlock data={data} onNavigate={onNavigate} />;
      case "product-cta":
        return <ProductCtaBlock data={data} onNavigate={onNavigate} />;
      case "product-process":
        return <ProductProcessBlock data={data} />;
      case "product-infographic":
        return <ProductInfographicBlock data={data} />;

      default:
        return null;
    }
  })();

  return blockElement ? styleContainer(blockElement) : null;
}

export { BLOCK_ICONS };
