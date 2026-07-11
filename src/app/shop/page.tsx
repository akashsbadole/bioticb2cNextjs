import type { Metadata } from "next";
import { ShopClientPage } from "./client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop | Purva Bites",
  description: "Browse our products. Premium quality FMCG products with fast delivery.",
};

export default function Page() {
  return <ShopClientPage />;
}
