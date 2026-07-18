"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";
import { useSeo } from "@/lib/use-seo";
import { formatPrice } from "@/lib/pricing";
import { getFirstImage } from "@/lib/utils";
import { StoreLoading } from "./StoreLoading";
import { RecentlyViewed } from "./RecentlyViewed";
import {
  VedikaTrustStrip,
  VedikaSectionTitle,
  VedikaCategoryCard,
  VedikaProductCard,
  VedikaRitualStep,
  VedikaTestimonialCard,
  VedikaBlogCard,
  VedikaNewsletter,
  VedikaStarRating,
  LeafDeco,
  LeafSimple,
  HerbDeco,
} from "./vedika-components";

interface HomePageProps {
  onNavigate: (page: string, data?: unknown) => void;
  settings?: Record<string, string> | null;
  data?: Record<string, unknown>;
}

const testimonials = [
  {
    quote:
      "Three weeks into the Kumkumadi oil and the texture of my skin has genuinely changed. No fragrance overload either.",
    name: "Riya Sharma",
    title: "Pune, Maharashtra",
  },
  {
    quote:
      "Finally a brand that tells you the dosha instead of just slapping 'natural' on everything. The Bhringraj oil is a staple now.",
    name: "Arjun Mehta",
    title: "Bengaluru, Karnataka",
  },
  {
    quote:
      "My grandmother approves — that's the real review. Packaging is also genuinely biodegradable, not just labelled that way.",
    name: "Sneha Iyer",
    title: "Kochi, Kerala",
  },
];

const ritualSteps = [
  {
    number: 1,
    title: "Cleanse with Ubtan",
    description:
      "A dry powder wash of chickpea flour, turmeric and rose — never a foaming cleanser that strips the skin barrier.",
  },
  {
    number: 2,
    title: "Nourish with Oil",
    description:
      "Warm a few drops of Kumkumadi between your palms and press, don't rub, into skin still slightly damp.",
  },
  {
    number: 3,
    title: "Seal with Churna",
    description:
      "A pinch of Ashwagandha in warm water or milk, taken before the day starts, to steady the nervous system.",
  },
];

const blogPosts = [
  {
    title: "How to identify your dominant dosha at home",
    category: "Dosha Guide",
    date: "12 Jun 2026",
    readTime: "6 min read",
  },
  {
    title: "Turmeric vs. saffron: which one belongs in your routine?",
    category: "Ingredients",
    date: "2 Jun 2026",
    readTime: "4 min read",
  },
  {
    title: "A 10-minute Dinacharya for people who hate routines",
    category: "Rituals",
    date: "24 May 2026",
    readTime: "5 min read",
  },
];

export function HomePage({
  onNavigate,
  settings,
  data: externalData,
}: HomePageProps) {
  const {
    settings: storeSettings,
    addToCart,
    navigate,
    wishlistIds,
    toggleWishlistId,
  } = useAppStore();
  const currency = storeSettings?.currency || "INR";
  const siteOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  useSeo("home", {
    title: storeSettings?.site_name ? `${storeSettings.site_name}` : undefined,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: storeSettings?.site_name,
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
          name: storeSettings?.site_name,
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

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const json = await res.json();
        return json.categories || json.data || json || [];
      }
      return [];
    },
  });

  const { data: products = [], isLoading: prodLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await fetch(
        "/api/products?featured=true&limit=8&inStock=true",
      );
      return res.ok ? (await res.json()).products || [] : [];
    },
  });

  const { data: allProducts = [], isLoading: allProdLoading } = useQuery({
    queryKey: ["all-storefront-products"],
    queryFn: async () => {
      const res = await fetch("/api/products?limit=100&inStock=true");
      return res.ok ? (await res.json()).products || [] : [];
    },
  });

  const categoryWithProducts = useMemo(() => {
    return categories
      .map((cat: any) => {
        const catProducts = allProducts.filter(
          (p: any) => p.categoryId === cat.id
        );
        return { ...cat, products: catProducts };
      })
      .filter((cat: any) => cat.products.length > 0);
  }, [categories, allProducts]);

  if (catLoading || prodLoading || allProdLoading) return <StoreLoading />;

  const handleAddToCart = (product: any) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: getFirstImage(product.images) || undefined,
      quantity: 1,
    });
  };

  return (
    <div className="flex flex-col">
      {/* ─── HERO ─── */}
      <section
        className="hero grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] px-4 py-10 sm:px-10 sm:py-14 gap-10 items-center"
      >
        <div className="vedika-container contents">
          <div className="hero-copy">
            <div className="vedika-eyebrow justify-start">
              Rooted in the Vedas, Made for Today
            </div>
            <h1 className="text-[clamp(2.4rem,4.5vw,3.8rem)] leading-[1.05] m-0 mb-[.2em]">
              Ayurveda,
              <br />
              measured &amp; modern.
            </h1>
            <p className="lead text-lg max-w-[460px] text-vedika-ink-soft mb-7">
              Small-batch herbal formulations for skin, hair and wellness — made
              from single-origin botanicals, balanced to your dosha, and
              lab-tested for what actually matters.
            </p>
            <div className="flex gap-3.5 flex-wrap">
              <button
                onClick={() => onNavigate("shop")}
                className="vedika-btn vedika-btn-primary"
              >
                Shop the Collection
              </button>
              <button
                onClick={() => onNavigate("about")}
                className="vedika-btn vedika-btn-outline"
              >
                Our Sourcing Story
              </button>
            </div>
            <div className="flex gap-9 mt-11">
              <div>
                <strong className="font-fraunces text-[1.6rem] text-vedika-green-dark block">
                  120+
                </strong>
                <span className="text-xs text-vedika-ink-soft tracking-wide">
                  Formulations
                </span>
              </div>
              <div>
                <strong className="font-fraunces text-[1.6rem] text-vedika-green-dark block">
                  40k+
                </strong>
                <span className="text-xs text-vedika-ink-soft tracking-wide">
                  Rituals shipped
                </span>
              </div>
              <div>
                <strong className="font-fraunces text-[1.6rem] text-vedika-green-dark block">
                  4.8/5
                </strong>
                <span className="text-xs text-vedika-ink-soft tracking-wide">
                  Average rating
                </span>
              </div>
            </div>
          </div>
          <div
            className="hero-art relative aspect-1 rounded-full flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, var(--vedika-sand) 0%, var(--vedika-gold-tint) 45%, var(--vedika-bg-alt) 100%)",
              boxShadow: "0 12px 30px -14px rgba(28,44,35,.28)",
            }}
          >
            <svg
              viewBox="0 0 300 300"
              fill="none"
              className="w-[78%] h-[78%]"
            >
              <ellipse
                cx="150"
                cy="230"
                rx="70"
                ry="12"
                fill="#1C2C23"
                opacity=".08"
              />
              <path
                d="M120 90h60l8 130a20 20 0 0 1-20 20h-36a20 20 0 0 1-20-20l8-130z"
                fill="#FFFDF6"
                stroke="#2F4A3C"
                strokeWidth="2"
              />
              <rect
                x="128"
                y="70"
                width="44"
                height="24"
                rx="4"
                fill="#C68A2E"
                stroke="#2F4A3C"
                strokeWidth="2"
              />
              <rect
                x="118"
                y="130"
                width="64"
                height="34"
                fill="#DCE6DA"
                stroke="#2F4A3C"
                strokeWidth="1.4"
              />
              <path d="M150 130V70" stroke="#2F4A3C" strokeWidth="1.4" />
              <path
                d="M70 220c-10-30 5-55 30-60 5 25-5 50-30 60z"
                fill="#DCE6DA"
                stroke="#2F4A3C"
                strokeWidth="1.6"
              />
              <path
                d="M230 210c10-28-3-52-28-58-6 24 4 48 28 58z"
                fill="#DCE6DA"
                stroke="#2F4A3C"
                strokeWidth="1.6"
              />
              <circle cx="95" cy="250" r="14" fill="#A6402F" opacity=".85" />
              <circle cx="205" cy="255" r="10" fill="#C68A2E" opacity=".85" />
            </svg>
            <div className="badge-float b1 absolute top-[8%] right-[2%] bg-vedika-paper rounded-full px-[18px] py-2.5 text-xs font-semibold text-vedika-green-dark shadow-[0_12px_30px_-14px_rgba(28,44,35,0.28)] flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-vedika-red">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              100% Natural
            </div>
            <div className="badge-float b2 absolute bottom-[12%] -left-[2%] bg-vedika-paper rounded-full px-[18px] py-2.5 text-xs font-semibold text-vedika-green-dark shadow-[0_12px_30px_-14px_rgba(28,44,35,0.28)] flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-vedika-red">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
              Dosha-Balanced
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST STRIP ─── */}
      <VedikaTrustStrip />

      {/* ─── CATEGORIES ─── */}
      <section className="vedika-section">
        <div className="vedika-container">
          <VedikaSectionTitle
            eyebrow="Shop by Concern"
            title="Formulated around you"
            description="Each range is built on classical Ayurvedic principles and matched to a dosha profile — not a one-size-fits-all routine."
          />
          <div className="vedika-grid-4">
            {categories.length > 0
              ? categories.map((cat: any) => (
                  <VedikaCategoryCard
                    key={cat.id}
                    name={cat.name}
                    count={cat._count?.products || 0}
                    onClick={() => onNavigate("category", cat.slug)}
                  />
                ))
              : ["Skin Care", "Hair Care", "Wellness", "Immunity"].map(
                  (name) => <VedikaCategoryCard key={name} name={name} />,
                )}
          </div>
        </div>
      </section>

      {/* ─── BESTSELLERS ─── */}
      <section className="bg-vedika-bg-alt py-[88px] pb-24">
        <div className="vedika-container">
          <VedikaSectionTitle
            eyebrow="Community Favourites"
            title="Bestselling formulations"
          />
          <div className="vedika-product-grid">
            {products.slice(0, 4).map((product: any) => (
              <VedikaProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
                formatPrice={(p) => formatPrice(p, currency)}
                onAddToCart={handleAddToCart}
                onToggleWishlist={toggleWishlistId}
                inWishlist={wishlistIds.includes(product.id)}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate("shop")}
              className="vedika-btn vedika-btn-outline"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* ─── DYNAMIC CATEGORY PRODUCTS ─── */}
      {categoryWithProducts.length > 0 && (
        <section className="vedika-section bg-paper border-y border-vedika-line py-[88px]">
          <div className="vedika-container space-y-16">
            {categoryWithProducts.slice(0, 4).map((cat: any) => (
              <div key={cat.id} className="space-y-6">
                <div className="flex items-center justify-between border-b border-vedika-line pb-3">
                  <div>
                    <h3 className="text-2xl font-semibold text-vedika-green-dark font-fraunces">{cat.name}</h3>
                    {cat.description && <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>}
                  </div>
                  <button onClick={() => onNavigate("category", cat.slug)} className="text-sm font-semibold text-vedika-red hover:underline">
                    View All {cat.name} →
                  </button>
                </div>
                <div className="vedika-product-grid">
                  {cat.products.slice(0, 4).map((product: any) => (
                    <VedikaProductCard
                      key={product.id}
                      product={product}
                      onNavigate={onNavigate}
                      formatPrice={(p) => formatPrice(p, currency)}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={toggleWishlistId}
                      inWishlist={wishlistIds.includes(product.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── RITUAL STEPS ─── */}
      <section className="vedika-section">
        <div className="vedika-container">
          <VedikaSectionTitle
            eyebrow="Dinacharya · Daily Ritual"
            title="Three steps, every sunrise"
            description="A minimal routine drawn from the Ashtanga Hridayam — order matters here, so we keep it exactly this simple."
          />
          <div className="ritual grid grid-cols-1 md:grid-cols-3 gap-8">
            {ritualSteps.map((step) => (
              <VedikaRitualStep
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── INGREDIENT SPOTLIGHT ─── */}
      <section className="vedika-container">
        <div className="spotlight grid grid-cols-1 lg:grid-cols-[.85fr_1.15fr] gap-14 items-center bg-vedika-green-dark rounded-[28px] p-16 text-vedika-bg overflow-hidden">
          <div className="spotlight-art aspect-1 rounded-full flex items-center justify-center border border-white/10"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #3C5A49, var(--vedika-green-dark) 75%)",
            }}
          >
            <svg viewBox="0 0 200 200" fill="none" className="w-[60%] h-[60%]">
              <path d="M100 170c0-50 20-70 20-100 0-16-9-28-20-32-11 4-20 16-20 32 0 30 20 50 20 100z" fill="#3C5A49" stroke="#C68A2E" strokeWidth="1.5"/>
              <path d="M100 130c-18-4-30-18-30-18M100 110c18-4 28-16 28-16M100 90c-14-3-22-13-22-13" stroke="#C68A2E" strokeWidth="1.3"/>
            </svg>
          </div>
          <div>
            <div className="vedika-eyebrow text-vedika-gold">Ingredient Spotlight</div>
            <h2 className="text-vedika-gold-tint text-[clamp(1.8rem,3vw,2.6rem)]">Ashwagandha, the vitality root</h2>
            <p className="text-[#CBD3C9]">Withania somnifera has anchored Ayurvedic wellness formulas for over three thousand years, prized for helping the body adapt to daily stress. We source ours from a single cooperative of farmers in Nagpur who&apos;ve grown it for three generations.</p>
            <button onClick={() => onNavigate("shop")} className="vedika-btn vedika-btn-gold mt-2">Shop Ashwagandha Range</button>
            <div className="flex gap-8 mt-7">
              <div>
                <strong className="font-fraunces text-vedika-gold-tint text-[1.4rem] block">3,000+</strong>
                <span className="text-xs text-[#A9B3A5]">Years in use</span>
              </div>
              <div>
                <strong className="font-fraunces text-vedika-gold-tint text-[1.4rem] block">1</strong>
                <span className="text-xs text-[#A9B3A5]">Farming cooperative</span>
              </div>
              <div>
                <strong className="font-fraunces text-vedika-gold-tint text-[1.4rem] block">0</strong>
                <span className="text-xs text-[#A9B3A5]">Fillers added</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="vedika-section">
        <div className="vedika-container">
          <VedikaSectionTitle
            eyebrow="From the Community"
            title="What our customers say"
          />
          <div className="vedika-grid-3">
            {testimonials.map((t, i) => (
              <VedikaTestimonialCard
                key={i}
                quote={t.quote}
                name={t.name}
                title={t.title}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── BLOG PREVIEW ─── */}
      <section className="bg-vedika-bg-alt py-24">
        <div className="vedika-container">
          <VedikaSectionTitle eyebrow="The Journal" title="Notes on Ayurveda" />
          <div className="vedika-grid-3">
            {blogPosts.map((post, i) => (
              <VedikaBlogCard
                key={i}
                title={post.title}
                category={post.category}
                date={post.date}
                readTime={post.readTime}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate("blog")}
              className="vedika-btn vedika-btn-outline"
            >
              Read the Journal
            </button>
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <VedikaNewsletter />

      {/* ─── RECENTLY VIEWED ─── */}
      <section className="vedika-section pt-0">
        <div className="vedika-container">
          <RecentlyViewed />
        </div>
      </section>
    </div>
  );
}
