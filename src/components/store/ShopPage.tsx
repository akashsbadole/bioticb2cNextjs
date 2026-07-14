"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/pricing";
import { getFirstImage } from "@/lib/utils";
import { useActiveFlashSales, getFlashSalePrice } from "@/lib/flash-sales";
import { useCustomerPrices } from "@/lib/customer-pricing";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { QuickViewModal } from "./QuickViewModal";
import { VedikaFilterSidebar, VedikaFilterGroup } from "./vedika-components";

export function ShopPage({ onNavigate: _onNavigate }: { onNavigate?: any }) {
  const { auth, settings, navigate, addToCart, addToCompare, wishlistIds, toggleWishlistId } = useAppStore();
  const { productMap: flashProductMap } = useActiveFlashSales();
  const { getPrice: getCustomerPrice, prices: customerPrices } = useCustomerPrices();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    categoryId: "all",
    brandId: "all",
    minPrice: "",
    maxPrice: "",
    sortBy: "featured",
    stockStatus: "in_stock"
  });
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const currency = settings?.currency || "INR";

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
        const res = await fetch("/api/categories");
        return (await res.json()).categories || [];
    }
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
        const res = await fetch("/api/brands");
        return (await res.json()).brands || [];
    }
  });

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ["products", searchQuery, filters],
    queryFn: async () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (filters.categoryId !== "all") params.set("categoryId", filters.categoryId);
        if (filters.brandId !== "all") params.set("brandId", filters.brandId);
        if (filters.minPrice) params.set("minPrice", filters.minPrice);
        if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
        if (filters.sortBy !== "featured") params.set("sort", filters.sortBy);
        if (filters.stockStatus === "in_stock") params.set("inStock", "true");
        else if (filters.stockStatus === "out_of_stock") params.set("stockStatus", "out_of_stock");

        const res = await fetch(`/api/products?${params.toString()}`);
        return (await res.json()).products || [];
    }
  });

  const handleAddToCart = (product: any) => {
    if (product.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: getFirstImage(product.images) || undefined,
    });
    toast.success("Added to cart");
  };

  const handleWishlist = async (productId: string) => {
    if (!auth.user) {
        toast.error("Please log in to use wishlist");
        return;
    }
    const isAdded = wishlistIds.includes(productId);
    try {
        const res = await fetch("/api/wishlist", {
            method: isAdded ? "DELETE" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
        });
        if (res.ok) {
            toggleWishlistId(productId);
            toast.success(isAdded ? "Removed from wishlist" : "Added to wishlist");
        }
    } catch { /* ignore */ }
  };

  const filterContent = (
    <div>
      <VedikaFilterGroup title="Categories">
        <button onClick={() => setFilters({ ...filters, categoryId: "all" })}
          style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".88rem", color: "var(--vedika-ink-soft)", marginBottom: 12, cursor: "pointer", background: "none", border: "none", font: "inherit", fontWeight: filters.categoryId === "all" ? 700 : 400 }}>
          <input type="checkbox" checked={filters.categoryId === "all"} onChange={() => {}} style={{ accentColor: "var(--vedika-green)", width: 15, height: 15 }} />
          All Products
        </button>
        {categories.map((cat: any) => (
          <button key={cat.id} onClick={() => setFilters({ ...filters, categoryId: cat.id })}
            style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".88rem", color: "var(--vedika-ink-soft)", marginBottom: 12, cursor: "pointer", background: "none", border: "none", font: "inherit", fontWeight: filters.categoryId === cat.id ? 700 : 400 }}>
            <input type="checkbox" checked={filters.categoryId === cat.id} onChange={() => {}} style={{ accentColor: "var(--vedika-green)", width: 15, height: 15 }} />
            {cat.name}
          </button>
        ))}
      </VedikaFilterGroup>

      <VedikaFilterGroup title="Brands">
        <select value={filters.brandId} onChange={(e) => setFilters({ ...filters, brandId: e.target.value })}
          style={{ width: "100%", border: "1px solid var(--vedika-line)", borderRadius: "100px", padding: "10px 16px", background: "var(--vedika-paper)", font: "inherit", color: "var(--vedika-ink)", fontSize: ".88rem" }}>
          <option value="all">All Brands</option>
          {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </VedikaFilterGroup>

      <VedikaFilterGroup title="Availability">
        <select value={filters.stockStatus} onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
          style={{ width: "100%", border: "1px solid var(--vedika-line)", borderRadius: "100px", padding: "10px 16px", background: "var(--vedika-paper)", font: "inherit", color: "var(--vedika-ink)", fontSize: ".88rem" }}>
          <option value="all">All Items</option>
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </VedikaFilterGroup>

      <VedikaFilterGroup title="Price Range">
        <div className="price-range" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            style={{ width: "50%", border: "1px solid var(--vedika-line)", borderRadius: "100px", padding: "10px 14px", background: "var(--vedika-paper)", font: "inherit", fontSize: ".84rem" }} />
          <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            style={{ width: "50%", border: "1px solid var(--vedika-line)", borderRadius: "100px", padding: "10px 14px", background: "var(--vedika-paper)", font: "inherit", fontSize: ".84rem" }} />
        </div>
      </VedikaFilterGroup>

      <button onClick={() => { setFilters({ categoryId: "all", brandId: "all", minPrice: "", maxPrice: "", sortBy: "featured", stockStatus: "in_stock" }); setSearchQuery(""); }}
        className="vedika-btn vedika-btn-outline vedika-btn-sm" style={{ width: "100%", marginTop: 8 }}>
        Reset Filters
      </button>
    </div>
  );

  const shopToolbarSx: React.CSSProperties = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 28, flexWrap: "wrap", gap: 14,
  };

  const renderProductCard = (product: any) => {
    const custPrice = getCustomerPrice(product.price, product.id);
    const flashDisc = flashProductMap[product.id];
    let displayPrice = custPrice;
    let displayCompare = customerPrices[product.id] !== undefined ? product.price : product.comparePrice || null;
    let discountLabel: string | null = null;
    if (flashDisc) {
      const { salePrice, discountPercent } = getFlashSalePrice(custPrice, flashDisc);
      displayPrice = salePrice;
      displayCompare = custPrice;
      discountLabel = `-${discountPercent}%`;
    }
    const image = getFirstImage(product.images);
    return (
      <div key={product.id} className="product-card" style={{ background: "var(--vedika-paper)", borderRadius: "14px", border: "1px solid var(--vedika-line)", overflow: "hidden", transition: "transform .3s ease, box-shadow .3s ease", position: "relative" }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 12px 30px -14px rgba(28,44,35,.28)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <div className="product-media" style={{ aspectRatio: "1/1.05", background: image ? "var(--vedika-bg-alt)" : "linear-gradient(160deg, var(--vedika-bg-alt), var(--vedika-green-tint))", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", cursor: "pointer" }}
          onClick={() => navigate("product-page", product.slug)}>
          {image ? (
            <img src={image} alt={product.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
              className="group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: "56%", height: "56%", color: "var(--vedika-green)", opacity: 0.3 }}>
              <path d="M12 22V10M12 10c-3 0-6 1-6 5s3 5 6 5 6-1 6-5-3-5-6-5z"/>
            </svg>
          )}
          {discountLabel && <span className="product-tag" style={{ position: "absolute", top: 14, left: 14, background: "var(--vedika-red)", color: "#fff", fontSize: ".66rem", fontWeight: 700, letterSpacing: ".04em", padding: "5px 10px", borderRadius: 100, textTransform: "uppercase" }}>{discountLabel}</span>}
          {product.stock <= 0 && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ background: "#fff", color: "#000", fontWeight: 700, fontSize: ".76rem", padding: "6px 14px", borderRadius: 100 }}>OUT OF STOCK</span>
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); handleWishlist(product.id); }} className="product-wish" style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,253,246,.9)", display: "flex", alignItems: "center", justifyContent: "center", color: wishlistIds.includes(product.id) ? "var(--vedika-red)" : "var(--vedika-green-dark)", border: "none", cursor: "pointer", zIndex: 2 }}>
            <svg viewBox="0 0 24 24" fill={wishlistIds.includes(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" style={{ width: 16, height: 16 }}>
              <path d="M12 21s-7-4.5-9.5-9C1 8.5 3 5 6.5 5c2 0 3.3 1.1 4 2 .7-.9 2-2 4-2C18 5 20 8.5 18.5 12 16 16.5 12 21 12 21z"/>
            </svg>
          </button>
        </div>
        <div className="product-info" style={{ padding: 20 }}>
          {product.Category && <div className="cat-label" style={{ fontSize: ".74rem", color: "var(--vedika-ink-soft)", marginBottom: 8 }}>{product.Category.name}</div>}
          <h4 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "1.05rem", marginBottom: 4, color: "var(--vedika-green-dark)", cursor: "pointer" }} onClick={() => navigate("product-page", product.slug)}>{product.name}</h4>
          <div className="price-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <div className="price" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "var(--vedika-green-dark)" }}>
              {product.ProductVariant?.length > 0 ? "From " : ""}{formatPrice(displayPrice, currency)}
              {displayCompare && <span className="was" style={{ fontSize: ".82rem", color: "var(--vedika-sand)", textDecoration: "line-through", marginLeft: 6, fontFamily: "var(--font-work-sans), sans-serif" }}>{formatPrice(displayCompare, currency)}</span>}
            </div>
            {product.stock > 0 && (
              <button onClick={() => handleAddToCart(product)} className="add-btn" style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--vedika-green)", color: "var(--vedika-paper)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M12 5v14M5 12h14"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <section className="page-hero" style={{ background: "var(--vedika-green-dark)", color: "var(--vedika-bg)", padding: "70px 0 60px", position: "relative", overflow: "hidden" }}>
        <div className="vedika-container" style={{ position: "relative", zIndex: 1 }}>
          <div className="vedika-eyebrow" style={{ color: "var(--vedika-gold)" }}>Our Collection</div>
          <h1 style={{ color: "#fff", fontSize: "clamp(2.4rem,4.5vw,3.8rem)", lineHeight: 1.05, maxWidth: 640 }}>Ayurvedic formulations for every dosha</h1>
          <p style={{ color: "#B7C0B4", maxWidth: 560, marginTop: 12 }}>Shop by category, ingredient, or dosha — every product is lab-tested and made in small batches.</p>
        </div>
        <svg viewBox="0 0 200 200" fill="none" style={{ position: "absolute", right: -60, top: -60, width: 320, height: 320, opacity: 0.12, pointerEvents: "none" }}>
          <path d="M100 20c-20 40-50 50-50 90s30 60 50 70c20-10 50-30 50-70s-30-50-50-90z" stroke="currentColor" strokeWidth=".6" fill="currentColor" fillOpacity=".06"/>
        </svg>
      </section>

      <div className="vedika-container">
        <div className="breadcrumb" style={{ padding: "20px 0", fontSize: ".82rem", color: "var(--vedika-ink-soft)", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit" }}>Home</button>
          <span style={{ color: "var(--vedika-sand)" }}>/</span>
          <span style={{ color: "var(--vedika-red)" }}>Shop</span>
        </div>
      </div>

      <div className="vedika-container" style={{ paddingBottom: 96 }}>
        <div className="shop-layout grid grid-cols-1 lg:grid-cols-[260px_1fr]" style={{ gap: 44, alignItems: "start" }}>
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div style={{ position: "sticky", top: 120 }}>
              <VedikaFilterSidebar>{filterContent}</VedikaFilterSidebar>
            </div>
          </aside>

          {/* Main Content */}
          <main>
            <div style={shopToolbarSx}>
              <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--vedika-ink-soft)", pointerEvents: "none" }}>
                  <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
                </svg>
                <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "100%", border: "1px solid var(--vedika-line)", borderRadius: "100px", padding: "10px 16px 10px 40px", background: "var(--vedika-paper)", font: "inherit", fontSize: ".88rem", color: "var(--vedika-ink)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="vedika-btn vedika-btn-outline vedika-btn-sm lg:hidden flex" style={{ fontSize: ".82rem" }}
                      onClick={() => {}}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 14, height: 14, marginRight: 6 }}><path d="M4 6h16M8 12h8M11 18h2"/></svg>
                      Filters
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]" style={{ background: "var(--vedika-paper)" }}>
                    <SheetHeader><SheetTitle style={{ fontFamily: "var(--font-fraunces), Georgia, serif", color: "var(--vedika-green-dark)" }}>Filter Products</SheetTitle></SheetHeader>
                    <div style={{ marginTop: 24 }}>{filterContent}</div>
                  </SheetContent>
                </Sheet>
                <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  style={{ border: "1px solid var(--vedika-line)", borderRadius: "100px", padding: "10px 16px", background: "var(--vedika-paper)", font: "inherit", color: "var(--vedika-ink)", fontSize: ".88rem" }}>
                  <option value="featured">Featured</option>
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--vedika-ink-soft)" }}>Loading products...</div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ width: 64, height: 64, margin: "0 auto 16px", color: "var(--vedika-sand)" }}>
                  <rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/>
                </svg>
                <h3 style={{ marginBottom: 8 }}>No products found</h3>
                <p style={{ color: "var(--vedika-ink-soft)" }}>Try clearing some filters or searching for something else.</p>
              </div>
            ) : (
              <>
                <div className="vedika-product-grid">
                  {products.slice(0, visibleCount).map((product) => renderProductCard(product))}
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

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} open={!!quickViewProduct} onOpenChange={(open) => { if (!open) setQuickViewProduct(null); }} onNavigate={navigate} />
      )}
    </div>
  );
}
