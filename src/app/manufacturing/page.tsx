import type { Metadata } from "next";
import { ManufacturingClientPage } from "./client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Manufacturing | Biotic Naturals",
  description:
    "Explore Biotic Naturals' state-of-the-art FMCG contract manufacturing facilities, production lines, quality process, and private label capabilities.",
  openGraph: {
    title: "Manufacturing | Biotic Naturals",
    description: "State-of-the-art FMCG contract manufacturing facilities.",
  },
};

export default function Page() {
  return <ManufacturingClientPage />;
}
