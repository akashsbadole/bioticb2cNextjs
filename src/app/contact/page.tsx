import type { Metadata } from "next";
import { ContactClientPage } from "./client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact Us | Biotic Naturals",
  description:
    "Get in touch with Biotic Naturals. Send us your enquiry for orders, partnerships, or any questions.",
  openGraph: {
    title: "Contact Us | Biotic Naturals",
    description:
      "Get in touch with Biotic Naturals for enquiries and partnerships.",
  },
};

export default function Page() {
  return <ContactClientPage />;
}
