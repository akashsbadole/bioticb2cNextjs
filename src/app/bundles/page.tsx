import type { Metadata } from "next";
import { BundlesClientPage } from "./client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Bundles | Biotic Naturals",
  description: "Explore curated product bundles and save more.",
};

export default function Page() {
  return <BundlesClientPage />;
}
