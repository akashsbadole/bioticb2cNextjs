import type { Metadata } from "next";
import { ProductsClientPage } from "./client";

export const metadata: Metadata = {
  title: "All Products | Purva Bites",
  description: "Browse all product categories from Purva Bites. Premium FMCG products for wholesale and B2B.",
};

export default function Page() {
  return <ProductsClientPage />;
}
