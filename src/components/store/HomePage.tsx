"use client";

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
      return res.ok ? (await res.json()).slice(0, 8) : [];
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

  if (catLoading || prodLoading) return <StoreLoading />;

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
        className="hero grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] px-4 py-10 sm:px-10 sm:py-14"
        style={{
          gap: 40,
          alignItems: "center",
        }}
      >
        <div className="vedika-container" style={{ display: "contents" }}>
          <div className="hero-copy">
            <div
              className="vedika-eyebrow"
              style={{ justifyContent: "flex-start" }}
            >
              Rooted in the Vedas, Made for Today
            </div>
            <h1
              style={{
                fontSize: "clamp(2.4rem,4.5vw,3.8rem)",
                lineHeight: 1.05,
                margin: "0 0 .2em",
              }}
            >
              Ayurveda,
              <br />
              measured &amp; modern.
            </h1>
            <p
              className="lead"
              style={{
                fontSize: "1.1rem",
                maxWidth: 460,
                color: "var(--vedika-ink-soft)",
                marginBottom: 28,
              }}
            >
              Small-batch herbal formulations for skin, hair and wellness — made
              from single-origin botanicals, balanced to your dosha, and
              lab-tested for what actually matters.
            </p>
            <div
              className="hero-actions"
              style={{ display: "flex", gap: 14, flexWrap: "wrap" }}
            >
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
            <div
              className="hero-stats"
              style={{ display: "flex", gap: 36, marginTop: 44 }}
            >
              <div>
                <strong
                  style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: "1.6rem",
                    color: "var(--vedika-green-dark)",
                    display: "block",
                  }}
                >
                  120+
                </strong>
                <span
                  style={{
                    fontSize: ".78rem",
                    color: "var(--vedika-ink-soft)",
                    letterSpacing: ".03em",
                  }}
                >
                  Formulations
                </span>
              </div>
              <div>
                <strong
                  style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: "1.6rem",
                    color: "var(--vedika-green-dark)",
                    display: "block",
                  }}
                >
                  40k+
                </strong>
                <span
                  style={{
                    fontSize: ".78rem",
                    color: "var(--vedika-ink-soft)",
                    letterSpacing: ".03em",
                  }}
                >
                  Rituals shipped
                </span>
              </div>
              <div>
                <strong
                  style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: "1.6rem",
                    color: "var(--vedika-green-dark)",
                    display: "block",
                  }}
                >
                  4.8/5
                </strong>
                <span
                  style={{
                    fontSize: ".78rem",
                    color: "var(--vedika-ink-soft)",
                    letterSpacing: ".03em",
                  }}
                >
                  Average rating
                </span>
              </div>
            </div>
          </div>
          <div
            className="hero-art"
            style={{
              position: "relative",
              aspectRatio: "1/1",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 32% 28%, var(--vedika-sand) 0%, var(--vedika-gold-tint) 45%, var(--vedika-bg-alt) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 30px -14px rgba(28,44,35,.28)",
            }}
          >
            <svg
              viewBox="0 0 300 300"
              fill="none"
              style={{ width: "78%", height: "78%" }}
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
            <div
              className="badge-float b1"
              style={{
                position: "absolute",
                top: "8%",
                right: "2%",
                background: "var(--vedika-paper)",
                borderRadius: 100,
                padding: "10px 18px",
                fontSize: ".76rem",
                fontWeight: 600,
                color: "var(--vedika-green-dark)",
                boxShadow: "0 12px 30px -14px rgba(28,44,35,.28)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: 16, height: 16, color: "var(--vedika-red)" }}
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              100% Natural
            </div>
            <div
              className="badge-float b2"
              style={{
                position: "absolute",
                bottom: "12%",
                left: "-2%",
                background: "var(--vedika-paper)",
                borderRadius: 100,
                padding: "10px 18px",
                fontSize: ".76rem",
                fontWeight: 600,
                color: "var(--vedika-green-dark)",
                boxShadow: "0 12px 30px -14px rgba(28,44,35,.28)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: 16, height: 16, color: "var(--vedika-red)" }}
              >
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
      <section
        style={{ background: "var(--vedika-bg-alt)", padding: "88px 0 96px" }}
      >
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
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button
              onClick={() => onNavigate("shop")}
              className="vedika-btn vedika-btn-outline"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* ─── RITUAL STEPS ─── */}
      <section className="vedika-section">
        <div className="vedika-container">
          <VedikaSectionTitle
            eyebrow="Dinacharya · Daily Ritual"
            title="Three steps, every sunrise"
            description="A minimal routine drawn from the Ashtanga Hridayam — order matters here, so we keep it exactly this simple."
          />
          <div
            className="ritual grid grid-cols-1 md:grid-cols-3"
            style={{
              gap: 32,
            }}
          >
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
        <div
          className="spotlight grid grid-cols-1 lg:grid-cols-[.85fr_1.15fr]"
          style={{
            gap: 56,
            alignItems: "center",
            background: "var(--vedika-green-dark)",
            borderRadius: "28px",
            padding: "64px",
            color: "var(--vedika-bg)",
            overflow: "hidden",
          }}
        >
          <div
            className="spotlight-art"
            style={{
              aspectRatio: "1",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 30%, #3C5A49, var(--vedika-green-dark) 75%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,.08)",
            }}
          >
            <svg
              viewBox="0 0 200 200"
              fill="none"
              style={{ width: "60%", height: "60%" }}
            >
              <path
                d="M100 170c0-50 20-70 20-100 0-16-9-28-20-32-11 4-20 16-20 32 0 30 20 50 20 100z"
                fill="#3C5A49"
                stroke="#C68A2E"
                strokeWidth="1.5"
              />
              <path
                d="M100 130c-18-4-30-18-30-18M100 110c18-4 28-16 28-16M100 90c-14-3-22-13-22-13"
                stroke="#C68A2E"
                strokeWidth="1.3"
              />
            </svg>
          </div>
          <div>
            <div
              className="vedika-eyebrow"
              style={{ color: "var(--vedika-gold)" }}
            >
              Ingredient Spotlight
            </div>
            <h2
              style={{
                color: "var(--vedika-gold-tint)",
                fontSize: "clamp(1.8rem,3vw,2.6rem)",
              }}
            >
              Ashwagandha, the vitality root
            </h2>
            <p style={{ color: "#CBD3C9" }}>
              Withania somnifera has anchored Ayurvedic wellness formulas for
              over three thousand years, prized for helping the body adapt to
              daily stress. We source ours from a single cooperative of farmers
              in Nagpur who&apos;ve grown it for three generations.
            </p>
            <button
              onClick={() => onNavigate("shop")}
              className="vedika-btn vedika-btn-gold"
              style={{ marginTop: 8 }}
            >
              Shop Ashwagandha Range
            </button>
            <div
              className="spot-stats"
              style={{ display: "flex", gap: 32, marginTop: 28 }}
            >
              <div>
                <strong
                  style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    color: "var(--vedika-gold-tint)",
                    fontSize: "1.4rem",
                    display: "block",
                  }}
                >
                  3,000+
                </strong>
                <span style={{ fontSize: ".76rem", color: "#A9B3A5" }}>
                  Years in use
                </span>
              </div>
              <div>
                <strong
                  style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    color: "var(--vedika-gold-tint)",
                    fontSize: "1.4rem",
                    display: "block",
                  }}
                >
                  1
                </strong>
                <span style={{ fontSize: ".76rem", color: "#A9B3A5" }}>
                  Farming cooperative
                </span>
              </div>
              <div>
                <strong
                  style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    color: "var(--vedika-gold-tint)",
                    fontSize: "1.4rem",
                    display: "block",
                  }}
                >
                  0
                </strong>
                <span style={{ fontSize: ".76rem", color: "#A9B3A5" }}>
                  Fillers added
                </span>
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
      <section
        style={{ background: "var(--vedika-bg-alt)", padding: "96px 0" }}
      >
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
          <div style={{ textAlign: "center", marginTop: 48 }}>
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
      <section className="vedika-section" style={{ paddingTop: 0 }}>
        <div className="vedika-container">
          <RecentlyViewed />
        </div>
      </section>
    </div>
  );
}
