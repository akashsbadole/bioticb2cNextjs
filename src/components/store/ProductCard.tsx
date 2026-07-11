"use client";

import { Zap } from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import { getFirstImage } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string;
    stock?: number;
  };
  currency?: string;
  onNavigate: (page: string, data?: unknown) => void;
}

export function ProductCard({ product, currency = "INR", onNavigate }: ProductCardProps) {
  const imageUrl = getFirstImage(product.images);

  return (
    <div
      className="bg-background rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onNavigate("product-page", product.slug)}
    >
      <div className="aspect-square bg-muted rounded-xl overflow-hidden mb-4 relative">
        {product.comparePrice && (
          <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 flex items-center gap-1">
            <Zap className="h-3 w-3 fill-current" /> SALE
          </div>
        )}
        {!imageUrl ? (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        )}
      </div>
      <h3 className="font-bold text-sm truncate">{product.name}</h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-primary font-bold">
          {formatPrice(product.price, currency)}
        </span>
        {product.comparePrice && (
          <span className="text-xs text-muted-foreground line-through">
            {formatPrice(product.comparePrice, currency)}
          </span>
        )}
      </div>
    </div>
  );
}
