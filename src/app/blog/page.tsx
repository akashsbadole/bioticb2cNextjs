import type { Metadata } from "next";
import { BlogClientPage } from "./client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog | Biotic Naturals",
  description:
    "Read the latest articles, news, and updates from Biotic Naturals.",
};

export default function Page() {
  return <BlogClientPage />;
}
