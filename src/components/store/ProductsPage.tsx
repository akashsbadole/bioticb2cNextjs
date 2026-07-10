"use client";

import { useState } from "react";
import { Info, Download, ArrowRight } from "lucide-react";

interface ProductsPageProps {
  onNavigate: (page: string, data?: unknown) => void;
  data?: Record<string, unknown>;
}

const categories = [
  { id: "all", label: "All products" },
  { id: "khakhra", label: "Khakhra" },
  { id: "bhakhri", label: "Bhakhri" },
  { id: "makhana", label: "Makhana" },
  { id: "extruder", label: "Extruder" },
  { id: "digestive", label: "Digestive" },
];

const categoryInfo: Record<
  string,
  { name: string; tags: string[]; desc: string; variants: string }
> = {
  khakhra: {
    name: "Khakhra",
    tags: ["12+ variants", "Private label"],
    desc: "Thin, crispy, roasted flatbreads available in a wide range of flavours and spice levels. One of our flagship lines — highest daily output capacity. Ideal for B2B, retail brands and private label.",
    variants: "12+ variants",
  },
  bhakhri: {
    name: "Bhakhri",
    tags: ["8+ varieties"],
    desc: "Traditional recipes with modern automation. Consistent thickness and crunch across batches. Available in multiple grain compositions.",
    variants: "8+ varieties",
  },
  makhana: {
    name: "Makhana",
    tags: ["6+ flavours", "PL ready"],
    desc: "Specialised roasting and flavouring line for fox nuts. Light, crispy finish with even coating across all flavour variants.",
    variants: "6+ flavours",
  },
  extruder: {
    name: "Extruder",
    tags: ["10+ shapes"],
    desc: "High-speed extrusion for puffed and shaped snacks. Custom shapes and textures achievable for private label clients.",
    variants: "10+ shapes",
  },
  digestive: {
    name: "Digestive",
    tags: ["5+ varieties"],
    desc: "Baked digestive biscuits and health-focused snacks. Formulations customisable for target nutrition profiles.",
    variants: "5+ varieties",
  },
};

const products = [
  {
    name: "Plain Khakhra",
    category: "khakhra",
    tags: ["Khakhra", "PL ready"],
    sizes: "80g · 200g · 500g · bulk",
  },
  {
    name: "Methi Khakhra",
    category: "khakhra",
    tags: ["Khakhra", "Custom flavour"],
    sizes: "80g · 200g · bulk",
  },
  {
    name: "Masala Makhana",
    category: "makhana",
    tags: ["Makhana", "PL ready"],
    sizes: "30g · 80g · 200g · bulk",
  },
  {
    name: "Jeera Khakhra",
    category: "khakhra",
    tags: ["Khakhra", "PL ready"],
    sizes: "80g · 200g · bulk",
  },
  {
    name: "Bajra Bhakhri",
    category: "bhakhri",
    tags: ["Bhakhri"],
    sizes: "80g · 200g · bulk",
  },
  {
    name: "Spicy Makhana",
    category: "makhana",
    tags: ["Makhana", "Custom flavour"],
    sizes: "30g · 80g · 200g · bulk",
  },
  {
    name: "Corn Rings",
    category: "extruder",
    tags: ["Extruder"],
    sizes: "30g · 80g · 200g · bulk",
  },
  {
    name: "Digestive Biscuits",
    category: "digestive",
    tags: ["Digestive"],
    sizes: "80g · 200g · bulk",
  },
];

export function ProductsPage({
  onNavigate,
  data: externalData,
}: ProductsPageProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  // If external data is provided (from PageBlockRenderer), show preview
  if (externalData) {
    return (
      <div className="flex flex-col">
        <div className="p-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {(externalData.hero as any)?.title || "Our Product Catalog"}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {(externalData.hero as any)?.subtitle ||
              "Discover our complete range of quality products"}
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

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);
  const currentCat = categoryInfo[activeCategory];

  return (
    <div className="flex flex-col">
      {/* P-Hero */}
      <section className="relative bg-gradient-to-br from-green-900 via-[#abd0ff] to-green-900 text-white py-28 px-4">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Manufactured in-house.
            <br />
            Available at scale.
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            5 product categories · 80+ SKUs · bulk, private label & branded
            formats — all from our own factory
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => onNavigate("contact")}
              className="bg-primary text-primary-foreground text-sm font-medium rounded-full px-6 py-2.5 hover:bg-primary/90 transition-colors"
            >
              Enquire for bulk / private label
            </button>
            <button
              onClick={() => onNavigate("catalogue")}
              className="bg-white/10 text-gray-300 text-sm font-medium rounded-full px-6 py-2.5 hover:bg-white/20 transition-colors"
            >
              Download catalogue
            </button>
          </div>
        </div>
      </section>

      {/* Breadcrumb + B2B notice */}
      <section className="bg-muted/40 py-3 px-4">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Home › Products</p>
          <div className="flex items-center gap-2 bg-background border rounded px-3 py-1.5">
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              We do not sell retail. All orders are B2B, bulk & trade only.
            </span>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-6 px-4 border-b">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground">Filter:</span>
              {["Private label ready", "Bulk available", "Custom flavour"].map(
                (f) => (
                  <span
                    key={f}
                    className="text-[10px] bg-muted border rounded px-2 py-1 cursor-pointer hover:bg-muted/80"
                  >
                    {f}
                  </span>
                ),
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Showing {filtered.length} products
            {activeCategory !== "all"
              ? ` in ${currentCat?.name || activeCategory}`
              : " across all categories"}
          </p>
        </div>
      </section>

      {/* Category Hero Strip */}
      {activeCategory !== "all" && currentCat && (
        <section className="bg-muted/40 py-6 px-4">
          <div className="container mx-auto max-w-5xl flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-32 h-24 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
              Category photo
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold">{currentCat.name}</h2>
                {currentCat.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentCat.desc}
              </p>
            </div>
            <button
              onClick={() => onNavigate("contact")}
              className="text-sm border rounded-full px-4 py-2 whitespace-nowrap hover:bg-muted transition-colors"
            >
              Enquire for this category →
            </button>
          </div>
        </section>
      )}

      {/* Product Grid */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <div
                key={product.name}
                className="border rounded-xl overflow-hidden bg-background"
              >
                <div className="h-32 bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  Product photo
                </div>
                <div className="p-3">
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${tag === "PL ready" ? "bg-emerald-50 text-emerald-700" : tag === "Custom flavour" ? "bg-amber-50 text-amber-700" : "bg-primary/10 text-primary"}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    Available: {product.sizes}
                  </p>
                  <p className="text-[10px] text-muted-foreground mb-3">
                    Min. order: B2B / trade only
                  </p>
                  <button
                    onClick={() => onNavigate("contact")}
                    className="w-full bg-primary text-primary-foreground text-xs font-medium rounded py-2 hover:bg-primary/90 transition-colors"
                  >
                    Enquire
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="bg-primary text-primary-foreground border-primary rounded-full px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
              Load more products ↓
            </button>
          </div>
        </div>
      </section>

      {/* Packaging Showcase */}
      <section className="bg-muted/40 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-xl font-bold mb-2">
            Packaging built for retail & trade
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Available in three formats — choose what works for your business
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Purva Bites branded",
                desc: "Ready-branded packs for distributors, modern trade and institutional buyers",
                tag: "Distributor friendly",
                highlight: false,
              },
              {
                title: "Your brand / private label",
                desc: "Send your artwork — we print, pack and ship under your brand identity. No minimums disclosed publicly.",
                tag: "Private label",
                highlight: true,
              },
              {
                title: "Bulk / institutional",
                desc: "5kg, 10kg, 25kg formats for canteens, hotels, airlines and govt procurement",
                tag: "Bulk format",
                highlight: false,
              },
            ].map((item) => (
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
                  {item.title} pack photo
                </div>
                <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {item.desc}
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

      {/* Inline Enquiry Form */}
      <section className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-xl font-bold text-center mb-2">
            Interested in bulk or private label?
          </h2>
          <p className="text-xs text-gray-400 text-center mb-8">
            Share your requirement — our team will respond within 24 hours with
            pricing & sample details
          </p>
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <input
                placeholder="Your name *"
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500"
              />
              <input
                placeholder="Company name *"
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500"
              />
              <input
                placeholder="Phone number *"
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500"
              />
              <input
                placeholder="Email address"
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <select className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-gray-500">
                <option>Product category</option>
                {categories
                  .filter((c) => c.id !== "all")
                  .map((c) => (
                    <option key={c.id}>{c.label}</option>
                  ))}
              </select>
              <select className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-gray-500">
                <option>Order type (bulk / PL / branded)</option>
                <option>Bulk</option>
                <option>Private label</option>
                <option>Branded</option>
              </select>
              <input
                placeholder="Approx. qty / month"
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500"
              />
            </div>
            <textarea
              placeholder="Any specific requirements, flavour preferences or packaging notes (optional)"
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500 mb-4 h-20 resize-none"
            />
            <div className="text-center">
              <button
                onClick={() => onNavigate("contact")}
                className="bg-primary text-primary-foreground text-sm font-medium rounded-full px-8 py-2.5 hover:bg-primary/90 transition-colors"
              >
                Submit product enquiry
              </button>
              <p className="text-[10px] text-gray-500 mt-2">
                Goes directly to CRM · no spam · sales team alerted instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="bg-muted/40 py-6 px-4">
        <div className="container mx-auto max-w-5xl flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground">
            Want full product specs, flavour lists and pack details?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate("catalogue")}
              className="text-xs bg-primary text-primary-foreground rounded-full px-4 py-2 flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
            >
              <Download className="h-3 w-3" /> Download full catalogue
            </button>
            <button
              onClick={() => onNavigate("manufacturing")}
              className="text-xs border rounded-full px-4 py-2 flex items-center gap-1.5 hover:bg-muted transition-colors"
            >
              View manufacturing capabilities →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
