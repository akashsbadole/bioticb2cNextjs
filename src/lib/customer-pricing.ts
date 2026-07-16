"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "./store";

interface CustomerPriceMap {
  [productId: string]: number;
}

let cachedPrices: CustomerPriceMap | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

export function useCustomerPrices(): {
  prices: CustomerPriceMap;
  getPrice: (defaultPrice: number, productId: string) => number;
  loading: boolean;
} {
  const [prices, setPrices] = useState<CustomerPriceMap>({});
  const [loading, setLoading] = useState(false);
  const { auth } = useAppStore();
  const userId = auth?.user?.id;
  const userRole = auth?.user?.role;

  const fetchPrices = useCallback(async () => {
    if (!userId || userRole === "admin") {
      setPrices({});
      return;
    }

    if (cachedPrices && Date.now() - cacheTimestamp < CACHE_TTL) {
      setPrices(cachedPrices);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/prices");
      if (res.ok) {
        const data = await res.json();
        cachedPrices = data.prices || {};
        cacheTimestamp = Date.now();
        setPrices({ ...cachedPrices });
      }
    } catch {
      // Silently fail - use default prices
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const getPrice = useCallback(
    (defaultPrice: number, productId: string): number => {
      if (prices[productId] !== undefined) return prices[productId];
      return defaultPrice;
    },
    [prices]
  );

  return { prices, getPrice, loading };
}

export async function getCustomerPriceFromServer(
  productId: string
): Promise<number | null> {
  try {
    const res = await fetch("/api/account/prices");
    if (!res.ok) return null;
    const data = await res.json();
    return data.prices?.[productId] ?? null;
  } catch {
    return null;
  }
}
