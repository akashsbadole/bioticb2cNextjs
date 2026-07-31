import type { Metadata } from "next";
import { StoreShell } from "@/components/store/StoreShell";
import {
  getCategoryInitialData,
  getCategorySlugs,
} from "@/lib/storefront-data";

export const revalidate = 300;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} | Biotic Naturals`,
    description: `Explore our ${slug} product range. Premium quality FMCG products with fast delivery and great prices for retail customers.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const data = await getCategoryInitialData(slug);

  return (
    <StoreShell
      initialPage={{ type: "category", slug }}
      initialData={data ? { category: data } : undefined}
    />
  );
}
