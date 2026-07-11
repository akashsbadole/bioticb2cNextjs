import type { Metadata } from "next";
import { CategoryClientPage } from "./client";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} | Purva Bites`,
    description: `Explore our ${slug} product range. Premium quality FMCG products with fast delivery and great prices for retail customers.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <CategoryClientPage slug={slug} />;
}
