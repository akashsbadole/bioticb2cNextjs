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
import type { StorefrontInitialData } from "@/lib/storefront-data";
import {
  BioticProductCard,
  BioticFilterSidebar,
  BioticFilterGroup,
  BioticSectionTitle,
  BioticCategoryCard,
} from "./biotic-components";

interface CategoryPageProps {
  slug: string;
  onNavigate: (page: string, data?: unknown) => void;
  initialData?: StorefrontInitialData["category"];
}

export function CategoryPage({ slug, onNavigate, initialData }: CategoryPageProps) {
  const { navigate, addToCart, wishlistIds, toggleWishlistId, auth, settings } = useAppStore();
  const { productMap: flashProductMap } = useActiveFlashSales();
  const { getPrice: getCustomerPrice, prices: customerPrices } = useCustomerPrices();
  const currency = settings?.currency || "INR";
  const [visibleCount, setVisibleCount] = useState(12);
  const [sortBy, setSortBy] = useState("featured");

  const { data, isLoading: loading } = useQuery({
    queryKey: ["category-page", slug, sortBy],
    staleTime: 5 * 60 * 1000,
    initialData:
      initialData && sortBy === "featured" ? initialData : undefined,
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
      <div className="text-center py-20">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="w-12 h-12 mx-auto mb-4 text-biotic-sand">
          <rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/>
        </svg>
        <h2 className="mb-2">Category not found</h2>
        <p className="text-biotic-ink-soft mb-4">The category you&apos;re looking for doesn&apos;t exist.</p>
        <button onClick={() => onNavigate("shop")} className="biotic-btn biotic-btn-primary">Back to shop</button>
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
      <section className="bg-biotic-green-dark text-biotic-bg py-[70px] pb-[60px] relative overflow-hidden">
        <div className="biotic-container relative z-1">
          <div className="text-biotic-gold biotic-eyebrow">{category.heroTitle || "Category"}</div>
          <h1 className="text-white text-[clamp(2.4rem,4.5vw,3.8rem)] leading-[1.05] max-w-[640px]">{category.heroSubtitle || category.name}</h1>
          {category.heroDescription && <p className="text-[#B7C0B4] max-w-[560px] mt-3">{category.heroDescription}</p>}
        </div>
        <svg viewBox="0 0 200 200" fill="none" className="absolute -right-15 -top-15 w-80 h-80 opacity-12 pointer-events-none">
          <path d="M100 20c-20 40-50 50-50 90s30 60 50 70c20-10 50-30 50-70s-30-50-50-90z" stroke="currentColor" strokeWidth=".6"/>
        </svg>
      </section>

      <div className="biotic-container">
        <div className="py-5 text-xs text-biotic-ink-soft flex items-center gap-2 flex-wrap">
          <button onClick={() => navigate("home")} className="bg-transparent border-none cursor-pointer font-inherit text-inherit">Home</button>
          <span className="text-biotic-sand">/</span>
          <button onClick={() => navigate("shop")} className="bg-transparent border-none cursor-pointer font-inherit text-inherit">Shop</button>
          <span className="text-biotic-sand">/</span>
          <span className="text-biotic-red">{category.name}</span>
        </div>
      </div>

      <div className="biotic-container pb-24">
        {(category as any)?.customFieldValues?.length > 0 && (() => {
            const visibleFields = (category as any).customFieldValues.filter((cf: any) => cf.definition?.isVisible !== false);
            if (visibleFields.length === 0) return null;
            return (
              <div className="mb-10 border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {visibleFields.map((cf: any, idx: number) => (
                      <tr key={cf.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                        <td className="px-4 py-3 font-bold text-muted-foreground w-1/3 border-r">
                          {cf.definition?.name || cf.definitionId}
                        </td>
                        <td className="px-4 py-3">
                          {cf.definition?.type === 'url' && cf.value ? (
                            <a href={cf.value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                              {cf.value}
                            </a>
                          ) : cf.definition?.type === 'color' && cf.value ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="w-4 h-4 rounded border" style={{ background: cf.value }} />
                              {cf.value}
                            </span>
                          ) : (
                            <span className="whitespace-pre-wrap break-words">{cf.value || '—'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}

        <div className="shop-layout grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-11 items-start">
          <aside className="hidden lg:block">
            <div className="sticky top-30">
              <BioticFilterSidebar>
                <BioticFilterGroup title="Categories">
                  {allCategories.map((cat: any) => (
                    <button key={cat.id} onClick={() => onNavigate("category", cat.slug)}
                      className={`block w-full text-left py-1.5 text-sm font-inherit bg-transparent border-none cursor-pointer ${cat.id === category.id ? "text-biotic-red font-semibold" : "text-biotic-ink-soft"}`}>
                      {cat.name}
                    </button>
                  ))}
                </BioticFilterGroup>
              </BioticFilterSidebar>
            </div>
          </aside>

          <main>
            <div className="flex justify-between items-center mb-7 flex-wrap gap-3.5">
              <p className="text-sm text-biotic-ink-soft m-0">{products.length} products</p>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="input-biotic w-auto">
                <option value="featured">Featured</option>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="mb-2">No products in this category yet</h3>
                <p className="text-biotic-ink-soft">Check back soon for new formulations.</p>
              </div>
            ) : (
              <>
                <div className="biotic-product-grid">
                  {products.slice(0, visibleCount).map((product: any) => (
                    <div key={product.id} className="bg-biotic-paper rounded-xl border border-biotic-line overflow-hidden relative transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_-14px_rgba(28,44,35,0.28)]">
                      <div className="aspect-[1/1.05] bg-gradient-to-br from-biotic-bg-alt to-biotic-green-tint flex items-center justify-center relative overflow-hidden cursor-pointer"
                        onClick={() => navigate("product-page", product.slug)}>
                        {(() => {
                          const img = getFirstImage(product.images);
                          return img ? <img src={img} alt={product.name} loading="lazy" className="w-full h-full object-cover absolute inset-0" />
                            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[56%] h-[56%] text-biotic-green opacity-30"><path d="M12 22V10M12 10c-3 0-6 1-6 5s3 5 6 5 6-1 6-5-3-5-6-5z"/></svg>;
                        })()}
                        {product.stock <= 0 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-white text-black font-bold text-xs px-3.5 py-1.5 rounded-full">OUT OF STOCK</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        {product.Category && <div className="text-xs text-biotic-ink-soft mb-2">{product.Category.name}</div>}
                        <h4 className="font-fraunces text-lg mb-1 text-biotic-green-dark cursor-pointer" onClick={() => navigate("product-page", product.slug)}>{product.name}</h4>
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="font-fraunces text-xl font-semibold text-biotic-green-dark">
                            {formatPrice(getCustomerPrice(product.price, product.id), currency)}
                          </div>
                          {product.stock > 0 && (
                            <button onClick={() => handleAddToCart(product)} className="icon-circle">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14"/></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {products.length > visibleCount && (
                  <div className="text-center mt-14">
                    <button onClick={() => setVisibleCount(prev => prev + 12)} className="biotic-btn biotic-btn-outline">Load More Products</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {allCategories.length > 0 && (
        <section className="bg-biotic-bg-alt py-16">
          <div className="biotic-container">
            <BioticSectionTitle eyebrow="Explore More" title="Other categories" align="center" />
            <div className="biotic-grid-4">
              {allCategories.filter((c: any) => c.id !== category.id).slice(0, 4).map((cat: any) => (
                <BioticCategoryCard key={cat.id} name={cat.name} count={cat._count?.products || 0} onClick={() => onNavigate("category", cat.slug)} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
