import type { Metadata } from "next";
import { StoreShell } from "@/components/store/StoreShell";
import { getShopInitialData } from "@/lib/storefront-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop | Biotic Naturals",
  description:
    "Browse our products. Premium quality FMCG products with fast delivery.",
};

export default async function Page() {
  const data = await getShopInitialData();

  return (
    <StoreShell
      initialPage="shop"
      initialData={data ? { shop: data } : undefined}
    />
  );
}
