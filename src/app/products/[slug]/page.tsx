import type { Metadata } from "next";
import { ProductClientPage } from "./client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} | Purva Bites`,
    description: `View product details for ${slug} from Purva Bites.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ProductClientPage slug={slug} />;
}
