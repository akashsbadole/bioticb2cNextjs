"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Check, Heart, Eye, ShoppingCart, Filter, ChevronRight, ArrowRightLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/pricing";
import { getFirstImage } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QuickViewModal } from "./QuickViewModal";
import { Breadcrumbs } from "./Breadcrumbs";
import { StoreLoading } from "./StoreLoading";

export function CataloguePage({ onNavigate: _onNavigate }: { onNavigate?: any }) {
  const { auth, settings, navigate, addToCart, addToCompare, wishlistIds, toggleWishlistId } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    categoryId: "all",
    brandId: "all",
    minPrice: "",
    maxPrice: "",
    sortBy: "featured",
    stockStatus: "all"
  });
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const isB2C = settings?.store_mode === "b2c";
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
        if (filters.stockStatus !== "all") params.set("stockStatus", filters.stockStatus);

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

  const renderFilterSidebar = () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider">Categories</h3>
        <div className="flex flex-col gap-2">
            <button
                onClick={() => setFilters({ ...filters, categoryId: "all" })}
                className={`text-sm text-left px-3 py-2 rounded-lg transition-colors ${filters.categoryId === 'all' ? 'bg-primary text-white font-bold' : 'hover:bg-muted'}`}
            >
                All Products
            </button>
            {categories.map((cat: any) => (
                <button
                    key={cat.id}
                    onClick={() => setFilters({ ...filters, categoryId: cat.id })}
                    className={`text-sm text-left px-3 py-2 rounded-lg transition-colors ${filters.categoryId === cat.id ? 'bg-primary text-white font-bold' : 'hover:bg-muted'}`}
                >
                    {cat.name}
                </button>
            ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider">Brands</h3>
        <Select value={filters.brandId} onValueChange={(v) => setFilters({ ...filters, brandId: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider">Availability</h3>
        <Select value={filters.stockStatus} onValueChange={(v) => setFilters({ ...filters, stockStatus: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider">Price Range</h3>
        <div className="grid grid-cols-2 gap-2">
            <Input
                placeholder="Min"
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="h-9"
            />
            <Input
                placeholder="Max"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="h-9"
            />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full text-xs uppercase font-bold"
        onClick={() => {
            setFilters({ categoryId: "all", brandId: "all", minPrice: "", maxPrice: "", sortBy: "featured", stockStatus: "all" });
            setSearchQuery("");
        }}
      >
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Catalogue" }]} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
                {renderFilterSidebar()}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 border rounded-2xl">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    className="pl-10 h-10 bg-muted/50 border-transparent focus:bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="lg:hidden shrink-0 h-10 px-4">
                            <Filter className="mr-2 h-4 w-4" /> Filters
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px]">
                        <SheetHeader className="mb-6">
                            <SheetTitle>Filter Products</SheetTitle>
                        </SheetHeader>
                        {renderFilterSidebar()}
                    </SheetContent>
                </Sheet>

                <Select value={filters.sortBy} onValueChange={(v) => setFilters({ ...filters, sortBy: v })}>
                    <SelectTrigger className="h-10 w-full sm:w-[180px]">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <StoreLoading />
            ) : products.length === 0 ? (
              <div className="text-center py-32 bg-card border border-dashed rounded-3xl">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold">No products found</h3>
                <p className="text-muted-foreground">Try clearing some filters or searching for something else.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.slice(0, visibleCount).map((product) => {
                  const image = getFirstImage(product.images);
                  return (
                    <div key={product.id} className="group bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                      <div className="relative aspect-[4/5] overflow-hidden bg-muted cursor-pointer" onClick={() => navigate("product-page", product.slug)}>
                        {image && (
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                        {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                <Badge className="bg-white text-black font-bold">OUT OF STOCK</Badge>
                            </div>
                        )}
                        {product.comparePrice && (
                            <div className="absolute top-3 left-3">
                                <Badge className="bg-rose-500 text-white border-none">SALE</Badge>
                            </div>
                        )}

                        {/* Action Overlay */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleWishlist(product.id); }}
                                className={`h-9 w-9 rounded-full flex items-center justify-center shadow-lg transition-colors ${wishlistIds.includes(product.id) ? 'bg-rose-50 text-rose-500' : 'bg-white hover:bg-rose-50 hover:text-rose-500'}`}
                            >
                                <Heart className={`h-4 w-4 ${wishlistIds.includes(product.id) ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                                className="h-9 w-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-colors"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); addToCompare(product); }}
                                className="h-9 w-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-50 hover:text-blue-500 transition-colors"
                            >
                                <ArrowRightLeft className="h-4 w-4" />
                            </button>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex-1">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">{product.Category?.name || 'General'}</p>
                            <h3 className="font-bold text-sm md:text-base mb-1 line-clamp-2 hover:text-primary transition-colors cursor-pointer" onClick={() => navigate("product-page", product.slug)}>
                                {product.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-primary font-black text-base md:text-lg">
                                    {product.ProductVariant?.length > 0 ? 'From ' : ''}
                                    {formatPrice(product.price, currency)}
                                </span>
                                {product.comparePrice && (
                                    <span className="text-xs text-muted-foreground line-through">{formatPrice(product.comparePrice, currency)}</span>
                                )}
                            </div>
                        </div>

                        {isB2C ? (
                            <Button
                                size="sm"
                                className="w-full rounded-xl gap-2 font-bold"
                                disabled={product.stock <= 0}
                                onClick={() => handleAddToCart(product)}
                            >
                                <ShoppingCart className="h-4 w-4" /> Add to Cart
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full rounded-xl gap-2 font-bold"
                                onClick={() => useAppStore.getState().openEnquiryModal(product.name, product.id)}
                            >
                                Send Enquiry
                            </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {products.length > visibleCount && (
                <div className="text-center pt-12 pb-20">
                    <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full px-12 h-12 font-bold"
                        onClick={() => setVisibleCount(prev => prev + 12)}
                    >
                        Load More Products
                    </Button>
                </div>
            )}
          </main>
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          open={!!quickViewProduct}
          onOpenChange={(open) => { if (!open) setQuickViewProduct(null); }}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}
