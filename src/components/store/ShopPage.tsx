"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/pricing";
import { getFirstImage } from "@/lib/utils";
import { useActiveFlashSales, getFlashSalePrice } from "@/lib/flash-sales";
import { useCustomerPrices } from "@/lib/customer-pricing";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { QuickViewModal } from "./QuickViewModal";
import { BioticFilterSidebar, BioticFilterGroup } from "./biotic-components";
import { Skeleton } from "@/components/ui/skeleton";

export function ShopPage({ onNavigate: _onNavigate }: { onNavigate?: any }) {
  const {
    auth,
    settings,
    navigate,
    addToCart,
    addToCompare,
    wishlistIds,
    toggleWishlistId,
  } = useAppStore();
  const { productMap: flashProductMap } = useActiveFlashSales();
  const { getPrice: getCustomerPrice, prices: customerPrices } =
    useCustomerPrices();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    categoryId: "all",
    brandId: "all",
    minPrice: "",
    maxPrice: "",
    sortBy: "featured",
    stockStatus: "in_stock",
  });
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const currency = settings?.currency || "INR";

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await fetch("/api/categories");
      return (await res.json()).categories || [];
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await fetch("/api/brands");
      return (await res.json()).brands || [];
    },
  });

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ["products", searchQuery, filters],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (filters.categoryId !== "all")
        params.set("categoryId", filters.categoryId);
      if (filters.brandId !== "all") params.set("brandId", filters.brandId);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.sortBy !== "featured") params.set("sort", filters.sortBy);
      if (filters.stockStatus === "in_stock") params.set("inStock", "true");
      else if (filters.stockStatus === "out_of_stock")
        params.set("stockStatus", "out_of_stock");

      const res = await fetch(`/api/products?${params.toString()}`);
      return (await res.json()).products || [];
    },
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
    } catch {
      /* ignore */
    }
  };

  const filterContent = (
    <div>
      <BioticFilterGroup title="Categories">
        <button
          onClick={() => setFilters({ ...filters, categoryId: "all" })}
          className={`flex items-center gap-2.5 text-sm text-biotic-ink-soft mb-3 cursor-pointer bg-transparent border-none font-inherit ${filters.categoryId === "all" ? "font-bold" : ""}`}
        >
          <input
            type="checkbox"
            checked={filters.categoryId === "all"}
            onChange={() => {}}
            className="accent-biotic-green w-[15px] h-[15px]"
          />
          All Products
        </button>
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setFilters({ ...filters, categoryId: cat.id })}
            className={`flex items-center gap-2.5 text-sm text-biotic-ink-soft mb-3 cursor-pointer bg-transparent border-none font-inherit ${filters.categoryId === cat.id ? "font-bold" : ""}`}
          >
            <input
              type="checkbox"
              checked={filters.categoryId === cat.id}
              onChange={() => {}}
              className="accent-biotic-green w-[15px] h-[15px]"
            />
            {cat.name}
          </button>
        ))}
      </BioticFilterGroup>

      <BioticFilterGroup title="Brands">
        <select
          value={filters.brandId}
          onChange={(e) => setFilters({ ...filters, brandId: e.target.value })}
          className="input-biotic"
        >
          <option value="all">All Brands</option>
          {brands.map((b: any) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </BioticFilterGroup>

      <BioticFilterGroup title="Availability">
        <select
          value={filters.stockStatus}
          onChange={(e) =>
            setFilters({ ...filters, stockStatus: e.target.value })
          }
          className="input-biotic"
        >
          <option value="all">All Items</option>
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </BioticFilterGroup>

      <BioticFilterGroup title="Price Range">
        <div className="flex items-center gap-2.5">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value })
            }
            className="input-biotic !w-1/2 text-xs"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
            className="input-biotic !w-1/2 text-xs"
          />
        </div>
      </BioticFilterGroup>

      <button
        onClick={() => {
          setFilters({
            categoryId: "all",
            brandId: "all",
            minPrice: "",
            maxPrice: "",
            sortBy: "featured",
            stockStatus: "in_stock",
          });
          setSearchQuery("");
        }}
        className="biotic-btn biotic-btn-outline biotic-btn-sm w-full mt-2"
      >
        Reset Filters
      </button>
    </div>
  );

  const renderProductCard = (product: any) => {
    const custPrice = getCustomerPrice(product.price, product.id);
    const flashDisc = flashProductMap[product.id];
    let displayPrice = custPrice;
    let displayCompare =
      customerPrices[product.id] !== undefined
        ? product.price
        : product.comparePrice || null;
    let discountLabel: string | null = null;
    if (flashDisc) {
      const { salePrice, discountPercent } = getFlashSalePrice(
        custPrice,
        flashDisc,
      );
      displayPrice = salePrice;
      displayCompare = custPrice;
      discountLabel = `-${discountPercent}%`;
    }
    const image = getFirstImage(product.images);
    return (
      <div
        key={product.id}
        className="bg-biotic-paper rounded-xl border border-biotic-line overflow-hidden relative transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_-14px_rgba(28,44,35,0.28)]"
      >
        <div
          className={`aspect-[1/1.05] flex items-center justify-center relative overflow-hidden cursor-pointer ${image ? "bg-biotic-bg-alt" : "bg-gradient-to-br from-biotic-bg-alt to-biotic-green-tint"}`}
          onClick={() => navigate("product-page", product.slug)}
        >
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover absolute inset-0 hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="w-[56%] h-[56%] text-biotic-green opacity-30"
            >
              <path d="M12 22V10M12 10c-3 0-6 1-6 5s3 5 6 5 6-1 6-5-3-5-6-5z" />
            </svg>
          )}
          {discountLabel && (
            <span className="absolute top-3.5 left-3.5 bg-biotic-red text-white text-[.66rem] font-bold tracking-wider px-2.5 py-1.5 rounded-full uppercase">
              {discountLabel}
            </span>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-black font-bold text-xs px-3.5 py-1.5 rounded-full">
                OUT OF STOCK
              </span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleWishlist(product.id);
            }}
            className={`icon-circle-sm absolute top-3 right-3 ${wishlistIds.includes(product.id) ? "text-biotic-red" : "text-biotic-green-dark"}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={wishlistIds.includes(product.id) ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              className="w-4 h-4"
            >
              <path d="M12 21s-7-4.5-9.5-9C1 8.5 3 5 6.5 5c2 0 3.3 1.1 4 2 .7-.9 2-2 4-2C18 5 20 8.5 18.5 12 16 16.5 12 21 12 21z" />
            </svg>
          </button>
        </div>
        <div className="p-5">
          {product.Category && (
            <div className="text-xs text-biotic-ink-soft mb-2">
              {product.Category.name}
            </div>
          )}
          <h4
            className="font-fraunces text-lg mb-1 text-biotic-green-dark cursor-pointer line-clamp-3"
            onClick={() => navigate("product-page", product.slug)}
          >
            {product.name}
          </h4>
          <div className="flex items-center justify-between mt-2.5">
            <div className="font-fraunces text-xl font-semibold text-biotic-green-dark">
              {product.ProductVariant?.length > 0 ? "From " : ""}
              {formatPrice(displayPrice, currency)}
              {displayCompare && (
                <span className="text-xs text-biotic-sand line-through ml-1.5 font-work-sans">
                  {formatPrice(displayCompare, currency)}
                </span>
              )}
            </div>
            {product.stock > 0 && (
              <button
                onClick={() => handleAddToCart(product)}
                className="icon-circle"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <section className="bg-biotic-green-dark text-biotic-bg py-[70px] pb-[60px] relative overflow-hidden">
        <div className="biotic-container relative z-1">
          <div className="text-biotic-gold biotic-eyebrow">Products</div>
          <h1 className="text-white text-[clamp(2.4rem,4.5vw,3.8rem)] leading-[1.05] max-w-[640px] overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            Shop All
          </h1>
          <p className="text-[#B7C0B4] max-w-[560px] mt-3">
            Shop by category, ingredient, or dosha — every product is lab-tested
            and made in small batches.
          </p>
        </div>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          className="absolute -right-15 -top-15 w-80 h-80 opacity-12 pointer-events-none"
        >
          <path
            d="M100 20c-20 40-50 50-50 90s30 60 50 70c20-10 50-30 50-70s-30-50-50-90z"
            stroke="currentColor"
            strokeWidth=".6"
            fill="currentColor"
            fillOpacity=".06"
          />
        </svg>
      </section>

      <div className="biotic-container">
        <div className="py-5 text-xs text-biotic-ink-soft flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate("home")}
            className="bg-transparent border-none cursor-pointer font-inherit text-inherit"
          >
            Home
          </button>
          <span className="text-biotic-sand">/</span>
          <span className="text-biotic-red">Shop</span>
        </div>
      </div>

      <div className="biotic-container pb-24">
        <div className="shop-layout grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-11 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-30">
              <BioticFilterSidebar>{filterContent}</BioticFilterSidebar>
            </div>
          </aside>

          {/* Main Content */}
          <main>
            <div className="flex justify-between items-center mb-7 flex-wrap gap-3.5">
              <div className="relative flex-1 max-w-[400px]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-biotic-ink-soft pointer-events-none"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-biotic pl-10"
                />
              </div>
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      className="biotic-btn biotic-btn-outline biotic-btn-sm lg:hidden flex text-xs"
                      onClick={() => {}}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="w-3.5 h-3.5 mr-1.5"
                      >
                        <path d="M4 6h16M8 12h8M11 18h2" />
                      </svg>
                      Filters
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[300px] bg-biotic-paper"
                  >
                    <SheetHeader>
                      <SheetTitle className="font-fraunces text-biotic-green-dark">
                        Filter Products
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">{filterContent}</div>
                  </SheetContent>
                </Sheet>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                  className="input-biotic w-auto"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="biotic-product-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <Skeleton className="aspect-[4/5] w-full rounded-2xl bg-muted" />
                    <div className="flex flex-col gap-1.5 px-1">
                      <Skeleton className="h-4 w-1/3 bg-muted" />
                      <Skeleton className="h-5 w-full bg-muted" />
                      <Skeleton className="h-6 w-1/2 bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  className="w-16 h-16 mx-auto mb-4 text-biotic-sand"
                >
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M8 7V5a4 4 0 0 1 8 0v2" />
                </svg>
                <h3 className="mb-2">No products found</h3>
                <p className="text-biotic-ink-soft">
                  Try clearing some filters or searching for something else.
                </p>
              </div>
            ) : (
              <>
                <div className="biotic-product-grid">
                  {products
                    .slice(0, visibleCount)
                    .map((product) => renderProductCard(product))}
                </div>
                {products.length > visibleCount && (
                  <div className="text-center mt-14">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                      className="biotic-btn biotic-btn-outline"
                    >
                      Load More Products
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          open={!!quickViewProduct}
          onOpenChange={(open) => {
            if (!open) setQuickViewProduct(null);
          }}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}
