"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react";

interface OrderSuccessPageProps {
  orderId: string;
}

export function OrderSuccessPage({ orderId }: OrderSuccessPageProps) {
  const { navigate } = useAppStore();

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-emerald-50 p-6 dark:bg-emerald-900/20">
          <CheckCircle2 className="h-16 w-16 text-emerald-600" />
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-1">
        Thank you for your purchase. Your order has been received.
      </p>
      <p className="text-sm font-medium text-primary mb-8">
        Order ID: {orderId}
      </p>

      <div className="max-w-md mx-auto grid gap-4 sm:grid-cols-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("products")}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Continue Shopping
        </Button>
        <Button className="w-full" onClick={() => navigate("home")}>
          Return Home
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="mt-12 p-6 border rounded-xl bg-card max-w-lg mx-auto text-left">
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="font-bold">What happens next?</h2>
        </div>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-emerald-600 font-bold">1.</span>
            You'll receive an email confirmation with your order details.
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-600 font-bold">2.</span>
            We'll process your order and prepare it for shipping.
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-600 font-bold">3.</span>
            Once shipped, we'll send you a tracking number to follow your package.
          </li>
        </ul>
      </div>
    </div>
  );
}
