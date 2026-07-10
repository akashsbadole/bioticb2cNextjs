import type { Metadata } from "next";
import { BlogPostClientPage } from "./client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} | Purva Bites Blog`,
    description: `Read our latest blog post about ${slug.replace(/-/g, " ")}.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <BlogPostClientPage slug={slug} />;
}
