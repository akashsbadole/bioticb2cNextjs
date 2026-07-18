"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Package, Send, ChevronDown, ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw, ZoomIn, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFirstImage } from "@/lib/utils";
import { formatPrice as libFormatPrice } from "@/lib/pricing";
import { toast } from "sonner";
import { useSeo } from "@/lib/use-seo";
import { useAppStore } from "@/lib/store";
import { StoreLoading, ProductSkeleton } from "./StoreLoading";
import { ProductReviews } from "./ProductReviews";
import { RecentlyViewed } from "./RecentlyViewed";
import { Breadcrumbs } from "./Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FlashSaleBadge } from "./FlashSaleBadge";
import { useActiveFlashSales, getFlashSalePrice, formatTimeRemaining } from "@/lib/flash-sales";
import { useCustomerPrices } from "@/lib/customer-pricing";

interface ProductPageProps {
  slug: string;
  onNavigate: (page: string, data?: unknown) => void;
}

export function ProductPage({ slug, onNavigate }: ProductPageProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [flashTime, setFlashTime] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySent, setNotifySent] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [productAddons, setProductAddons] = useState<any[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});

  const { auth, settings, addToCart, addToRecentlyViewed, wishlistIds, toggleWishlistId } = useAppStore();
  const { productMap: flashProductMap } = useActiveFlashSales();
  const currency = settings?.currency || "INR";
  const { data: product, isLoading: loading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
        const res = await fetch(`/api/products?slug=${slug}`);
        const data = await res.json();
        const prod = (data.products || [])[0];
        if (prod) {
            addToRecentlyViewed({
                id: prod.id,
                name: prod.name,
                slug: prod.slug,
                images: prod.images,
                price: prod.price
            });
        }
        return prod || null;
    }
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related-products", product?.id],
    enabled: !!product?.categoryId,
    queryFn: async () => {
        const res = await fetch(`/api/products?categoryId=${product.categoryId}&inStock=true&limit=5`);
        const data = await res.json();
        return (data.products || []).filter((p: any) => p.id !== product.id).slice(0, 4);
    }
  });

  useEffect(() => {
    if (product && !activeImage) {
        const firstImg = getFirstImage(product.images);
        if (firstImg) setActiveImage(firstImg);
    }
  }, [product, activeImage]);

  useEffect(() => {
    if (!product) return;
    fetch(`/api/products/${product.id}/addons`)
      .then((r) => r.json())
      .then((data) => setProductAddons(data.addons?.filter((a: any) => a.isActive) || []))
      .catch(() => {});
  }, [product?.id]);

  const flashDisc = product ? flashProductMap[product.id] : undefined;
  const flashPrice = flashDisc ? getFlashSalePrice(product.price, flashDisc) : null;

  useEffect(() => {
    if (!flashDisc) return;
    setFlashTime(formatTimeRemaining(flashDisc.endDate));
    const interval = setInterval(() => {
      setFlashTime(formatTimeRemaining(flashDisc.endDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [flashDisc]);

  const images = (() => {
    try {
      const parsed = JSON.parse(product?.images || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  })();

  const productJsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.shortDescription || product.description || undefined,
        sku: product.sku || undefined,
        image: images[0] || product.ogImage || undefined,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: currency,
          availability:
            product.stock != null && product.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      }
    : null;

  useSeo(`product-${slug}`, {
    title: product?.metaTitle || product?.name,
    description: product?.metaDescription || product?.shortDescription,
    ogImage: product?.ogImage,
    jsonLd: productJsonLd,
    canonical: typeof window !== 'undefined' ? window.location.href : undefined,
  });

  const { getPrice: getCustomerPrice } = useCustomerPrices();

  if (loading) return <ProductSkeleton />;
  if (!product) return <div className="py-20 text-center">Product not found</div>;

  const selectedVariant = product.ProductVariant?.find((v: any) => v.id === selectedVariantId);
  const basePrice = selectedVariant?.price ?? product.price;
  const currentPrice = getCustomerPrice(basePrice, product.id);

  const handleNotify = async () => {
    if (!notifyEmail) { toast.error("Enter your email"); return; }
    setNotifyLoading(true);
    try {
      const res = await fetch("/api/stock-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: notifyEmail, productId: product.id }),
      });
      const data = await res.json();
      if (res.ok) { setNotifySent(true); toast.success(data.message); }
      else toast.error(data.error || "Failed to subscribe");
    } catch { toast.error("Network error"); }
    finally { setNotifyLoading(false); }
  };

  const handleAddToCart = () => {
    const activeAddons = productAddons.filter((a: any) => selectedAddons[a.id]);
    const addonTotal = activeAddons.reduce((sum: number, a: any) => sum + a.price, 0);
    const addonNames = activeAddons.map((a: any) => a.name).join(" + ");
    addToCart({
      productId: product.id,
      variantId: selectedVariantId || undefined,
      name: addonNames ? `${product.name} + ${addonNames}` : (selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name),
      price: currentPrice + addonTotal,
      quantity: 1,
      image: activeImage || undefined,
    });
    toast.success("Added to cart");
  };

  const handleWishlist = async () => {
    if (!auth.user) { toast.error("Please log in"); return; }
    const isAdded = wishlistIds.includes(product!.id);
    const res = await fetch("/api/wishlist", {
        method: isAdded ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product!.id }),
    });
    if (res.ok) {
        toggleWishlistId(product!.id);
        toast.success(isAdded ? "Removed from wishlist" : "Added to wishlist");
    }
  };

  const specs = (() => {
    try {
        const baseSpecs = JSON.parse(product.specifications || "{}");
        const attrs = JSON.parse(product.attributes || "{}");
        return { ...baseSpecs, ...attrs };
    } catch { return {}; }
  })();

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[
            { label: "Shop", page: "shop" },
            { label: product.Category?.name || "General", page: "category", slug: product.Category?.slug },
            { label: product.name }
        ]} />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-square bg-muted rounded-3xl overflow-hidden border group cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
                {activeImage && (
                    <Image
                        src={activeImage}
                        alt={product.name}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                )}
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <ZoomIn className="h-5 w-5" />
                </div>
                <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                    <FlashSaleBadge productId={product.id} />
                    {product.comparePrice && (
                        <Badge className="bg-rose-500 text-white border-none px-3 py-1">SALE</Badge>
                    )}
                    {product.createdAt && Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000 && (
                        <Badge className="bg-emerald-500 text-white border-none px-3 py-1">NEW</Badge>
                    )}
                    {product.isBestSeller && (
                        <Badge className="bg-amber-500 text-white border-none px-3 py-1">BEST SELLER</Badge>
                    )}
                </div>
            </div>

            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img: string, idx: number) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImage(img)}
                            className={`relative h-24 w-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <div className="flex-1 space-y-6">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">{product.Category?.name || 'General'}</Badge>
                        <FlashSaleBadge productId={product.id} />
                        {product.isFeatured && (
                            <Badge className="bg-primary text-white border-none">FEATURED</Badge>
                        )}
                        {product.isBestSeller && (
                            <Badge className="bg-amber-500 text-white border-none">BEST SELLER</Badge>
                        )}
                        {product.createdAt && Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000 && (
                            <Badge className="bg-emerald-500 text-white border-none">NEW</Badge>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4">{product.name}</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-black text-primary">
                                {flashPrice ? libFormatPrice(flashPrice.salePrice, currency) : libFormatPrice(currentPrice, currency)}
                            </span>
                            {(flashPrice || product.comparePrice) && (
                                <span className="text-lg text-muted-foreground line-through decoration-rose-500/50">
                                    {libFormatPrice(flashPrice ? product.price : (product.comparePrice || 0), currency)}
                                </span>
                            )}
                        </div>
                        {flashPrice && (
                            <Badge className="bg-orange-500 text-white border-none text-[10px] font-bold animate-pulse">
                                -{flashPrice.discountPercent}% · {flashTime}
                            </Badge>
                        )}
                        {!flashPrice && product.comparePrice && (
                            <Badge className="bg-emerald-500 border-none text-[10px] font-bold">
                                {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                            </Badge>
                        )}
                    </div>
                </div>

                <p className="text-muted-foreground leading-relaxed text-lg">{product.shortDescription}</p>

                {product.ProductVariant?.length > 0 && (
                    <div className="space-y-4">
                        <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Select Option</Label>
                        <div className="flex flex-wrap gap-2">
                            {product.ProductVariant.map((v: any) => (
                                <button
                                    key={v.id}
                                    onClick={() => {
                                        setSelectedVariantId(v.id);
                                        const vImg = getFirstImage(v.images);
                                        if (vImg) setActiveImage(vImg);
                                    }}
                                    className={`px-6 py-2.5 rounded-xl border-2 font-bold transition-all ${selectedVariantId === v.id ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25' : 'border-muted hover:border-primary/50'}`}
                                >
                                    {v.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {productAddons.length > 0 && (
                    <div className="space-y-3 border-t pt-6">
                        <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Available Add-ons</Label>
                        <div className="space-y-2">
                            {productAddons.map((addon: any) => (
                                <label
                                    key={addon.id}
                                    className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!selectedAddons[addon.id]}
                                        onChange={(e) => setSelectedAddons((prev) => ({ ...prev, [addon.id]: e.target.checked }))}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{addon.name}</p>
                                        {addon.description && <p className="text-xs text-muted-foreground">{addon.description}</p>}
                                    </div>
                                    <span className="text-sm font-bold text-primary">+{libFormatPrice(addon.price, currency)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {flashDisc && (
                    <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                        <div className="text-2xl">⚡</div>
                        <div className="flex-1">
                            <p className="font-bold text-sm">{flashDisc.flashSaleName}</p>
                            <p className="text-xs opacity-90">Sale ends in {flashTime}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-lg">{libFormatPrice(flashPrice!.salePrice, currency)}</p>
                            <p className="text-xs line-through opacity-70">{libFormatPrice(product.price, currency)}</p>
                        </div>
                    </div>
                )}

                {product.stock <= 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 space-y-3">
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Out of stock</p>
                        {notifySent ? (
                            <p className="text-sm text-amber-700 dark:text-amber-300">You'll be notified when this product is back in stock.</p>
                        ) : (
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={notifyEmail}
                                    onChange={(e) => setNotifyEmail(e.target.value)}
                                    className="h-10"
                                />
                                <Button variant="outline" className="shrink-0 h-10" onClick={handleNotify} disabled={notifyLoading}>
                                    {notifyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Notify Me"}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <Button size="lg" className="flex-1 h-14 rounded-2xl text-lg font-bold gap-2 shadow-xl shadow-primary/20" onClick={handleAddToCart} disabled={product.stock <= 0}>
                        <ShoppingCart className="h-5 w-5" /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className={`h-14 w-14 rounded-2xl p-0 transition-colors ${wishlistIds.includes(product.id) ? 'bg-rose-50 text-rose-500 border-rose-200' : 'hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200'}`}
                        onClick={handleWishlist}
                    >
                        <Heart className={`h-6 w-6 ${wishlistIds.includes(product.id) ? 'fill-current' : ''}`} />
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-8">
                    <div className="flex items-center gap-3 p-4 border rounded-2xl bg-muted/30">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <Truck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide">Free Shipping</p>
                            <p className="text-[10px] text-muted-foreground">On orders over {libFormatPrice(500, currency)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 border rounded-2xl bg-muted/30">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide">Secure Payment</p>
                            <p className="text-[10px] text-muted-foreground">100% safe transactions</p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="my-12" />

            {/* Tabs Style Sections */}
            <div className="space-y-12">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">Product Description</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                </div>

                {Object.keys(specs).length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Specifications</h3>
                        <div className="border rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                                <tbody>
                                    {Object.entries(specs).map(([k, v]: [string, any], idx) => (
                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                                            <td className="px-4 py-3 font-bold text-muted-foreground w-1/3 border-r">{k}</td>
                                            <td className="px-4 py-3">{v}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-24 pt-12 border-t">
            <ProductReviews productId={product.id} />
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
            <section className="mt-24 pt-12 border-t">
                <h2 className="text-2xl font-bold mb-8">Related Products</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map((p) => {
                        const img = getFirstImage(p.images);
                        return (
                            <div key={p.id} className="group cursor-pointer bg-card border rounded-2xl p-3 hover:shadow-lg transition-all" onClick={() => onNavigate("product-page", p.slug)}>
                                <div className="aspect-square bg-muted rounded-xl overflow-hidden mb-4">
                                    {img && <img src={img} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                                </div>
                                <h3 className="font-bold text-sm truncate mb-1">{p.name}</h3>
                                <p className="text-primary font-black">{libFormatPrice(p.price, currency)}</p>
                            </div>
                        );
                    })}
                </div>
            </section>
        )}

        <section className="mt-24 pt-12 border-t">
            <RecentlyViewed productId={product.id} />
        </section>
      </div>

      {/* Lightbox Implementation */}
      {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setLightboxOpen(false)}>
              <button className="absolute top-6 right-6 text-white hover:text-primary transition-colors">
                  <X className="h-8 w-8" />
              </button>
              <img src={activeImage!} alt="" className="max-h-[85vh] max-w-full object-contain rounded-lg animate-in zoom-in-95" />
          </div>
      )}
    </div>
  );
}
