import type { Metadata } from "next";
import { ProductsClientPage } from "./client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Products | Purva Bites",
  description: "Browse all product categories from Purva Bites. Premium FMCG products for your home and business.",
};

export default function Page() {
  return <ProductsClientPage />;
}
