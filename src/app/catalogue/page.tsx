import type { Metadata } from "next";
import { CatalogueClientPage } from "./client";

export const metadata: Metadata = {
  title: "Product Catalogue | Purva Bites",
  description: "Browse our extensive catalogue of premium FMCG products. Fast delivery and great prices for retail customers.",
};

export default function Page() {
  return <CatalogueClientPage />;
}
