import { useEffect, useState } from "react";

export interface FlashSaleDiscount {
  flashSaleId: string;
  flashSaleName: string;
  endDate: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
}

export interface ActiveFlashSales {
  productMap: Record<string, FlashSaleDiscount>;
  nearestEndDate: string | null;
}

let cachedPromise: Promise<ActiveFlashSales> | null = null;

function fetchFlashSales(): Promise<ActiveFlashSales> {
  if (cachedPromise) return cachedPromise;
  cachedPromise = fetch("/api/flash-sales?active=true")
    .then((r) => r.json())
    .then((res) => {
      const flashSales = res.flashSales || [];
      const productMap: Record<string, FlashSaleDiscount> = {};
      let nearestEnd: string | null = null;

      for (const fs of flashSales) {
        if (!nearestEnd || new Date(fs.endDate) < new Date(nearestEnd)) {
          nearestEnd = fs.endDate;
        }
        for (const fp of fs.products || []) {
          if (!productMap[fp.productId]) {
            productMap[fp.productId] = {
              flashSaleId: fs.id,
              flashSaleName: fs.name,
              endDate: fs.endDate,
              discountType: fp.discountType,
              discountValue: fp.discountValue,
            };
          }
        }
      }

      return { productMap, nearestEndDate: nearestEnd };
    })
    .catch(() => ({ productMap: {}, nearestEndDate: null }));

  return cachedPromise;
}

export function useActiveFlashSales(): ActiveFlashSales {
  const [data, setData] = useState<ActiveFlashSales>({ productMap: {}, nearestEndDate: null });

  useEffect(() => {
    fetchFlashSales().then(setData);
    const interval = setInterval(() => {
      cachedPromise = null;
      fetchFlashSales().then(setData);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return data;
}

export function getFlashSalePrice(price: number, discount: FlashSaleDiscount): { salePrice: number; discountPercent: number } {
  if (discount.discountType === "fixed") {
    const salePrice = Math.max(0, price - discount.discountValue);
    const discountPercent = price > 0 ? Math.round((1 - salePrice / price) * 100) : 0;
    return { salePrice, discountPercent };
  }
  const salePrice = Math.max(0, Math.round(price * (1 - discount.discountValue / 100) * 100) / 100);
  return { salePrice, discountPercent: Math.min(100, discount.discountValue) };
}

export function formatTimeRemaining(endDate: string): string {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
