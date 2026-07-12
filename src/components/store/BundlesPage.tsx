"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/pricing";
import { getFirstImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Gift, ShoppingCart, Package } from "lucide-react";

interface BundleItem {
  id: string;
  productId: string;
  quantity: number;
  Product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string;
    stock: number;
    comparePrice: number | null;
    shortDescription: string | null;
  };
}

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  items: BundleItem[];
}

export function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings, navigate, addToCart } = useAppStore();

  const currency = settings?.currency || "INR";

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const res = await fetch("/api/bundles");
        const data = await res.json();
        setBundles(data.bundles || []);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, []);

  const handleAddBundle = (bundle: Bundle) => {
    for (const item of bundle.items) {
      if (item.Product.stock <= 0) {
        toast.error(`${item.Product.name} is out of stock`);
        return;
      }
    }
    for (const item of bundle.items) {
      for (let i = 0; i < item.quantity; i++) {
        addToCart({
          productId: item.productId,
          name: item.Product.name,
          price: item.Product.price,
          quantity: 1,
          image: getFirstImage(item.Product.images) || undefined,
        });
      }
    }
    toast.success(`${bundle.name} added to cart`);
    navigate("cart");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Gift className="h-8 w-8 text-primary" />
          Product Bundles
        </h1>
        <p className="text-muted-foreground mt-1">
          Save money with our curated product bundles.
        </p>
      </div>

      {bundles.length === 0 && (
        <div className="text-center py-32 text-muted-foreground">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <h2 className="text-xl font-bold mb-2">No bundles available</h2>
          <p>Check back later for special offers.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {bundles.map((bundle) => {
          const totalOriginal = bundle.items.reduce(
            (sum, item) => sum + item.Product.price * item.quantity,
            0
          );
          const savings = totalOriginal - bundle.price;
          const allInStock = bundle.items.every((item) => item.Product.stock > 0);

          return (
            <Card key={bundle.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{bundle.name}</CardTitle>
                    {bundle.description && (
                      <CardDescription>{bundle.description}</CardDescription>
                    )}
                  </div>
                  {savings > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-none shrink-0">
                      Save {formatPrice(savings, currency)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {bundle.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 border rounded-lg"
                    >
                      <div className="h-12 w-12 rounded bg-muted shrink-0 overflow-hidden">
                        {getFirstImage(item.Product.images) && (
                          <img
                            src={getFirstImage(item.Product.images)!}
                            alt={item.Product.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.quantity}x {item.Product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.Product.price, currency)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground line-through">
                      {formatPrice(totalOriginal, currency)}
                    </p>
                    <p className="text-2xl font-black text-primary">
                      {formatPrice(bundle.price, currency)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleAddBundle(bundle)}
                    disabled={!allInStock}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {allInStock ? "Add Bundle" : "Out of Stock"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
