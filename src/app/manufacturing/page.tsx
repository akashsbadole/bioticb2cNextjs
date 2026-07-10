import type { Metadata } from "next";
import { ManufacturingClientPage } from "./client";

export const metadata: Metadata = {
  title: "Manufacturing | Purva Bites",
  description: "Explore Purva Bites' state-of-the-art FMCG contract manufacturing facilities, production lines, quality process, and private label capabilities.",
  openGraph: {
    title: "Manufacturing | Purva Bites",
    description: "State-of-the-art FMCG contract manufacturing facilities.",
  },
};

export default function Page() {
  return <ManufacturingClientPage />;
}
