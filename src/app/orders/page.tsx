import type { Metadata } from "next";
import { OrdersClientPage } from "./client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "My Orders | Biotic Naturals",
  description: "View your order history and track shipments.",
};

export default function Page() {
  return <OrdersClientPage />;
}
