import type { Metadata } from "next";
import { AboutClientPage } from "./client";

export const metadata: Metadata = {
  title: "About Us | Purva Bites",
  description: "Learn about Purva Bites - our story, mission, vision, and the team behind India's trusted FMCG manufacturer.",
  openGraph: {
    title: "About Us | Purva Bites",
    description: "Learn about Purva Bites - our story, mission, vision, and team.",
  },
};

export default function Page() {
  return <AboutClientPage />;
}
