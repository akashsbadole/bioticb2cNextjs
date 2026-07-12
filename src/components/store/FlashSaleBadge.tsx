"use client";

import { useEffect, useState } from "react";
import { useActiveFlashSales, formatTimeRemaining, getFlashSalePrice } from "@/lib/flash-sales";
import { Badge } from "@/components/ui/badge";

export function FlashSaleBadge({ productId, className }: { productId: string; className?: string }) {
  const { productMap } = useActiveFlashSales();
  const discount = productMap[productId];
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    if (!discount) return;
    setTimeStr(formatTimeRemaining(discount.endDate));
    const interval = setInterval(() => {
      setTimeStr(formatTimeRemaining(discount.endDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [discount]);

  if (!discount) return null;

  return (
    <Badge className={`bg-orange-500 text-white border-none animate-pulse ${className || ""}`}>
      ⚡ {discount.discountValue}{discount.discountType === "percentage" ? "%" : "₹"} OFF
      {timeStr && <span className="ml-1 text-[10px] opacity-80">· {timeStr}</span>}
    </Badge>
  );
}

export function FlashSalePrice({
  productId,
  price,
  currency = "INR",
  formatPrice,
}: {
  productId: string;
  price: number;
  currency?: string;
  formatPrice: (price: number, currency?: string) => string;
}) {
  const { productMap } = useActiveFlashSales();
  const discount = productMap[productId];
  if (!discount) return null;

  const { salePrice, discountPercent } = getFlashSalePrice(price, discount);

  return (
    <div className="flex items-center gap-2">
      <span className="text-primary font-black text-base md:text-lg">
        {formatPrice(salePrice, currency)}
      </span>
      {salePrice < price && (
        <span className="text-xs text-muted-foreground line-through">
          {formatPrice(price, currency)}
        </span>
      )}
      <Badge className="bg-orange-500 text-white border-none text-[10px]">
        -{discountPercent}%
      </Badge>
    </div>
  );
}
