import type { Metadata } from "next";
import { AboutClientPage } from "./client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About Us | Biotic Naturals",
  description:
    "Learn about Biotic Naturals - our story, mission, vision, and the team behind India's trusted FMCG manufacturer.",
  openGraph: {
    title: "About Us | Biotic Naturals",
    description:
      "Learn about Biotic Naturals - our story, mission, vision, and team.",
  },
};

export default function Page() {
  return <AboutClientPage />;
}
