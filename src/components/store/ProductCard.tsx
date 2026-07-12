"use client";

import { memo } from "react";
import { Zap } from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import { getFirstImage } from "@/lib/utils";
import { FlashSaleBadge } from "./FlashSaleBadge";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string;
    customerPrice?: number | null;
    flashPriceInfo?: { salePrice: number; originalPrice: number } | null;
    stock?: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    createdAt?: string;
  };
  currency?: string;
  onNavigate: (page: string, data?: unknown) => void;
}

export const ProductCard = memo(function ProductCard({ product, currency = "INR", onNavigate }: ProductCardProps) {
  const imageUrl = getFirstImage(product.images);
  const isNew = product.createdAt
    ? Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
    : false;

  return (
    <div
      className="bg-background rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={() => onNavigate("product-page", product.slug)}
    >
      <div className="aspect-square bg-muted rounded-xl overflow-hidden mb-4 relative">
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <FlashSaleBadge productId={product.id} />
          {product.comparePrice && (
            <div className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Zap className="h-3 w-3 fill-current" /> SALE
            </div>
          )}
          {isNew && (
            <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
              NEW
            </div>
          )}
          {product.isBestSeller && (
            <div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
              BEST SELLER
            </div>
          )}
        </div>
        {product.isFeatured && (
          <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
            FEATURED
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
          {formatPrice(product.flashPriceInfo?.salePrice ?? product.customerPrice ?? product.price, currency)}
        </span>
        {(product.flashPriceInfo?.originalPrice || product.customerPrice || product.comparePrice) && (
          <span className="text-xs text-muted-foreground line-through">
            {formatPrice(product.flashPriceInfo?.originalPrice ?? (product.customerPrice ? product.price : (product.comparePrice || 0)), currency)}
          </span>
        )}
      </div>
    </div>
  );
});
