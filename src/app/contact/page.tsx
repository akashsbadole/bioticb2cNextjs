import type { Metadata } from "next";
import { ContactClientPage } from "./client";

export const metadata: Metadata = {
  title: "Contact Us | Purva Bites",
  description: "Get in touch with Purva Bites. Send us your enquiry for bulk orders, private labelling, or partnership opportunities.",
  openGraph: {
    title: "Contact Us | Purva Bites",
    description: "Get in touch with Purva Bites for enquiries and partnerships.",
  },
};

export default function Page() {
  return <ContactClientPage />;
}
