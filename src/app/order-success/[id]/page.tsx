"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/lib/store";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.id as string;
  const clearCart = useAppStore((s) => s.clearCart);

  useEffect(() => {
    // Clear the local cart now that the order is placed.
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full mx-auto p-8 text-center border rounded-xl shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-1">
          Thank you for your order. We&apos;ve received your payment.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Order ID:{" "}
          <span className="font-mono font-medium text-foreground">{orderId}</span>
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href={`/invoice/${orderId}`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Download Invoice
          </Link>
          <Link
            href={`/tracking?orderId=${orderId}`}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Track Order
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
