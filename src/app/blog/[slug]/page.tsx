import type { Metadata } from "next";
import { StoreShell } from "@/components/store/StoreShell";
import {
  getBlogPostInitialData,
  getBlogSlugs,
} from "@/lib/storefront-data";

export const revalidate = 300;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")} | Biotic Naturals Blog`,
    description: `Read our latest blog post about ${slug.replace(/-/g, " ")}.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const data = await getBlogPostInitialData(slug);

  return (
    <StoreShell
      initialPage={{ type: "blog-post", slug }}
      initialData={data ? { blogPost: data } : undefined}
    />
  );
}
