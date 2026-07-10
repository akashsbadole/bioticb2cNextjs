"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2, ShoppingCart, ShoppingBag } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/pricing";
import { getFirstImage } from "@/lib/utils";
import { toast } from "sonner";

export function WishlistPage() {
  const { auth, settings, navigate, addToCart } = useAppStore();
  const queryClient = useQueryClient();
  const currency = settings?.currency || "INR";

  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ["wishlist"],
    enabled: !!auth.user,
    queryFn: async () => {
        const res = await fetch("/api/wishlist");
        return (await res.json()).items || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
        const res = await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("Removed from wishlist");
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    }
  });

  const removeFromWishlist = (productId: string) => {
    deleteMutation.mutate(productId);
  };

  const handleMoveToCart = (item: any) => {
    const product = item.Product;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: getFirstImage(product.images) || undefined,
    });
    removeFromWishlist(product.id);
    toast.success("Moved to cart");
  };

  if (!auth.user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center bg-card border-2 border-dashed rounded-[3rem] my-12">
        <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-rose-50 p-10 ring-1 ring-rose-100">
                <Heart className="h-16 w-16 text-rose-500" />
            </div>
        </div>
        <h1 className="text-3xl font-black mb-4">Your wishlist awaits</h1>
        <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg">
          Please log in to save your favorite items and sync them across all your devices.
        </p>
        <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold" onClick={() => navigate("home")}>Log In Now</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-32 bg-card border-2 border-dashed rounded-[3rem]">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-muted p-10">
                <Heart className="h-16 w-16 text-muted-foreground/30" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-10">Tap the heart icon on any product to save it here.</p>
          <Button size="lg" variant="outline" className="rounded-full px-8 font-bold" onClick={() => navigate("products")}>Browse Collections</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.Product;
            const image = getFirstImage(product.images);
            return (
              <div key={item.id} className="border rounded-xl overflow-hidden bg-card group flex flex-col">
                <div className="relative h-40 bg-muted cursor-pointer" onClick={() => navigate("product-page", product.slug)}>
                  {image && <img src={image} alt={product.name} className="h-full w-full object-cover" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromWishlist(product.id); }}
                    className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full text-destructive hover:bg-background shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-sm mb-1 truncate">{product.name}</h3>
                  <p className="text-primary font-bold text-sm mb-4">{formatPrice(product.price, currency)}</p>
                  <div className="mt-auto space-y-2">
                    <Button size="sm" className="w-full" onClick={() => handleMoveToCart(item)}>
                        <ShoppingCart className="mr-2 h-3.5 w-3.5" /> Move to Cart
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
