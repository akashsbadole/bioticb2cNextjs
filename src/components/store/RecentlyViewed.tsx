"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { getFirstImage } from "@/lib/utils";
import { formatPrice } from "@/lib/pricing";

export function RecentlyViewed({ productId }: { productId?: string }) {
  const { navigate, settings, recentlyViewed } = useAppStore();
  const currency = settings?.currency || "INR";

  const products = productId
    ? recentlyViewed.filter(p => p.id !== productId).slice(0, 4)
    : recentlyViewed.slice(0, 4);

  if (products.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => {
          const image = getFirstImage(p.images);
          return (
            <div
                key={p.id}
                className="border rounded-xl p-2 cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => navigate("product-page", p.slug)}
            >
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                {image && <img src={image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />}
              </div>
              <p className="text-xs font-bold truncate">{p.name}</p>
              <p className="text-[10px] text-primary font-bold">{formatPrice(p.price, currency)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
