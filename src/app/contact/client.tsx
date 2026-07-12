"use client";

import { useAppStore } from "@/lib/store";
import { ContactPage } from "@/components/store/ContactPage";

export function ContactClientPage() {
  const { navigate } = useAppStore();
  return <ContactPage onNavigate={navigate} />;
}
