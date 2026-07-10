import type { Metadata } from "next";
import { CatalogueClientPage } from "./client";

export const metadata: Metadata = {
  title: "Product Catalogue | Purva Bites",
  description: "Browse our extensive catalogue of premium FMCG products. Bulk ordering and B2B wholesale available.",
};

export default function Page() {
  return <CatalogueClientPage />;
}
