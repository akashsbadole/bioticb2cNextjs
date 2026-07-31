import type { Metadata } from "next";
import { StoreShell } from "@/components/store/StoreShell";
import { getBlogInitialData } from "@/lib/storefront-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog | Biotic Naturals",
  description:
    "Read the latest articles, news, and updates from Biotic Naturals.",
};

export default async function Page() {
  const data = await getBlogInitialData();

  return (
    <StoreShell
      initialPage="blog"
      initialData={data ? { blog: data } : undefined}
    />
  );
}
