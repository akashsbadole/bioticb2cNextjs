import type { Metadata } from "next";
import { BlogClientPage } from "./client";

export const metadata: Metadata = {
  title: "Blog | Purva Bites",
  description: "Read the latest articles, news, and updates from Purva Bites.",
};

export default function Page() {
  return <BlogClientPage />;
}
