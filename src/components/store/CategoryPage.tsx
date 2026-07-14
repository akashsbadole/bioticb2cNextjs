"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSeo } from "@/lib/use-seo";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/pricing";
import { getFirstImage } from "@/lib/utils";
import { useActiveFlashSales, getFlashSalePrice } from "@/lib/flash-sales";
import { useCustomerPrices } from "@/lib/customer-pricing";
import { toast } from "sonner";
import { StoreLoading } from "./StoreLoading";
import {
  VedikaProductCard,
  VedikaFilterSidebar,
  VedikaFilterGroup,
  VedikaSectionTitle,
  VedikaCategoryCard,
} from "./vedika-components";

interface CategoryPageProps {
  slug: string;
  onNavigate: (page: string, data?: unknown) => void;
}

export function CategoryPage({ slug, onNavigate }: CategoryPageProps) {
  const { navigate, addToCart, wishlistIds, toggleWishlistId, auth, settings } = useAppStore();
  const { productMap: flashProductMap } = useActiveFlashSales();
  const { getPrice: getCustomerPrice, prices: customerPrices } = useCustomerPrices();
  const currency = settings?.currency || "INR";
  const [visibleCount, setVisibleCount] = useState(12);
  const [sortBy, setSortBy] = useState("featured");

  const { data, isLoading: loading } = useQuery({
    queryKey: ["category-page", slug, sortBy],
    queryFn: async () => {
      const catRes = await fetch(`/api/categories?slug=${slug}`);
      const catData = await catRes.json();
      const cat = (catData.categories || [])[0] || catData.category;
      if (!cat) return null;

      const prodRes = await fetch(`/api/products?categoryId=${cat.id}&inStock=true&sort=${sortBy}`);
      const prodData = await prodRes.json();

      const allCatRes = await fetch("/api/categories");
      const allCatData = await allCatRes.json();
      const allCats = (allCatData.categories || []).slice(0, 6);

      return { category: cat, products: prodData.products || [], allCategories: allCats };
    }
  });

  const category = data?.category || null;
  const products = data?.products || [];
  const allCategories = data?.allCategories || [];

  useSeo(`category-${slug}`, {
    title: category?.metaTitle || category?.name,
    description: category?.metaDescription || category?.description,
    ogImage: category?.ogImage,
  });

  if (loading) return <StoreLoading />;

  if (!category) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ width: 48, height: 48, margin: "0 auto 16px", color: "var(--vedika-sand)" }}>
          <rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/>
        </svg>
        <h2 style={{ marginBottom: 8 }}>Category not found</h2>
        <p style={{ color: "var(--vedika-ink-soft)", marginBottom: 16 }}>The category you&apos;re looking for doesn&apos;t exist.</p>
        <button onClick={() => onNavigate("shop")} className="vedika-btn vedika-btn-primary">Back to shop</button>
      </div>
    );
  }

  const handleAddToCart = (product: any) => {
    if (product.stock <= 0) { toast.error("Out of stock"); return; }
    addToCart({ productId: product.id, name: product.name, price: product.price, quantity: 1, image: getFirstImage(product.images) || undefined });
    toast.success("Added to cart");
  };

  return (
    <div>
      <section className="page-hero" style={{ background: "var(--vedika-green-dark)", color: "var(--vedika-bg)", padding: "70px 0 60px", position: "relative", overflow: "hidden" }}>
        <div className="vedika-container" style={{ position: "relative", zIndex: 1 }}>
          <div className="vedika-eyebrow" style={{ color: "var(--vedika-gold)" }}>{category.heroTitle || "Category"}</div>
          <h1 style={{ color: "#fff", fontSize: "clamp(2.4rem,4.5vw,3.8rem)", lineHeight: 1.05, maxWidth: 640 }}>{category.heroSubtitle || category.name}</h1>
          {category.heroDescription && <p style={{ color: "#B7C0B4", maxWidth: 560, marginTop: 12 }}>{category.heroDescription}</p>}
        </div>
        <svg viewBox="0 0 200 200" fill="none" style={{ position: "absolute", right: -60, top: -60, width: 320, height: 320, opacity: 0.12, pointerEvents: "none" }}>
          <path d="M100 20c-20 40-50 50-50 90s30 60 50 70c20-10 50-30 50-70s-30-50-50-90z" stroke="currentColor" strokeWidth=".6"/>
        </svg>
      </section>

      <div className="vedika-container">
        <div className="breadcrumb" style={{ padding: "20px 0", fontSize: ".82rem", color: "var(--vedika-ink-soft)", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit" }}>Home</button>
          <span style={{ color: "var(--vedika-sand)" }}>/</span>
          <button onClick={() => navigate("shop")} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit" }}>Shop</button>
          <span style={{ color: "var(--vedika-sand)" }}>/</span>
          <span style={{ color: "var(--vedika-red)" }}>{category.name}</span>
        </div>
      </div>

      <div className="vedika-container" style={{ paddingBottom: 96 }}>
        <div className="shop-layout grid grid-cols-1 lg:grid-cols-[260px_1fr]" style={{ gap: 44, alignItems: "start" }}>
          <aside className="hidden lg:block">
            <div style={{ position: "sticky", top: 120 }}>
              <VedikaFilterSidebar>
                <VedikaFilterGroup title="Categories">
                  {allCategories.map((cat: any) => (
                    <button key={cat.id} onClick={() => onNavigate("category", cat.slug)}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 0", fontSize: ".88rem", color: cat.id === category.id ? "var(--vedika-red)" : "var(--vedika-ink-soft)", fontWeight: cat.id === category.id ? 600 : 400, background: "none", border: "none", cursor: "pointer", font: "inherit" }}>
                      {cat.name}
                    </button>
                  ))}
                </VedikaFilterGroup>
              </VedikaFilterSidebar>
            </div>
          </aside>

          <main>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
              <p style={{ fontSize: ".88rem", color: "var(--vedika-ink-soft)", margin: 0 }}>{products.length} products</p>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                style={{ border: "1px solid var(--vedika-line)", borderRadius: "100px", padding: "10px 16px", background: "var(--vedika-paper)", font: "inherit", color: "var(--vedika-ink)", fontSize: ".88rem" }}>
                <option value="featured">Featured</option>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <h3 style={{ marginBottom: 8 }}>No products in this category yet</h3>
                <p style={{ color: "var(--vedika-ink-soft)" }}>Check back soon for new formulations.</p>
              </div>
            ) : (
              <>
                <div className="vedika-product-grid">
                  {products.slice(0, visibleCount).map((product: any) => (
                    <div key={product.id} className="product-card" style={{ background: "var(--vedika-paper)", borderRadius: "14px", border: "1px solid var(--vedika-line)", overflow: "hidden", transition: "transform .3s ease, box-shadow .3s ease", position: "relative" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 12px 30px -14px rgba(28,44,35,.28)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <div className="product-media" style={{ aspectRatio: "1/1.05", background: "linear-gradient(160deg, var(--vedika-bg-alt), var(--vedika-green-tint))", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", cursor: "pointer" }}
                        onClick={() => navigate("product-page", product.slug)}>
                        {(() => {
                          const img = getFirstImage(product.images);
                          return img ? <img src={img} alt={product.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: "56%", height: "56%", color: "var(--vedika-green)", opacity: 0.3 }}><path d="M12 22V10M12 10c-3 0-6 1-6 5s3 5 6 5 6-1 6-5-3-5-6-5z"/></svg>;
                        })()}
                        {product.stock <= 0 && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ background: "#fff", color: "#000", fontWeight: 700, fontSize: ".76rem", padding: "6px 14px", borderRadius: 100 }}>OUT OF STOCK</span>
                          </div>
                        )}
                      </div>
                      <div className="product-info" style={{ padding: 20 }}>
                        {product.Category && <div className="cat-label" style={{ fontSize: ".74rem", color: "var(--vedika-ink-soft)", marginBottom: 8 }}>{product.Category.name}</div>}
                        <h4 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "1.05rem", marginBottom: 4, color: "var(--vedika-green-dark)", cursor: "pointer" }} onClick={() => navigate("product-page", product.slug)}>{product.name}</h4>
                        <div className="price-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                          <div className="price" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "var(--vedika-green-dark)" }}>
                            {formatPrice(getCustomerPrice(product.price, product.id), currency)}
                          </div>
                          {product.stock > 0 && (
                            <button onClick={() => handleAddToCart(product)} className="add-btn" style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--vedika-green)", color: "var(--vedika-paper)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M12 5v14M5 12h14"/></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {products.length > visibleCount && (
                  <div style={{ textAlign: "center", marginTop: 56 }}>
                    <button onClick={() => setVisibleCount(prev => prev + 12)} className="vedika-btn vedika-btn-outline">Load More Products</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {allCategories.length > 0 && (
        <section className="vedika-section" style={{ background: "var(--vedika-bg-alt)", padding: "64px 0" }}>
          <div className="vedika-container">
            <VedikaSectionTitle eyebrow="Explore More" title="Other categories" align="center" />
            <div className="vedika-grid-4">
              {allCategories.filter((c: any) => c.id !== category.id).slice(0, 4).map((cat: any) => (
                <VedikaCategoryCard key={cat.id} name={cat.name} count={cat._count?.products || 0} onClick={() => onNavigate("category", cat.slug)} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
