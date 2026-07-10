import type { Metadata } from "next";
import { CategoryClientPage } from "./client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} | Purva Bites`,
    description: `Explore our ${slug} product range. Premium quality FMCG products for bulk orders and B2B partnerships.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <CategoryClientPage slug={slug} />;
}
