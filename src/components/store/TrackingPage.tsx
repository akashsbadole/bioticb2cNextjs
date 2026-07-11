"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Search, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

export function TrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [searched, setSearched] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tracking", orderId, email],
    enabled: false,
    queryFn: async () => {
      const res = await fetch(
        `/api/tracking?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch tracking");
      }
      return res.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) {
      toast.error("Please enter both Order ID and Email");
      return;
    }
    setSearched(true);
    refetch();
  };

  const steps = data?.steps || [];
  const currentIndex = data?.currentIndex || 0;
  const order = data?.order;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <Package className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground">
          Enter your order ID and email to check the status
        </p>
      </div>

      <Card className="p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="orderId">Order ID</Label>
            <Input
              id="orderId"
              placeholder="e.g. clx1234567890"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Track
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {searched && !isLoading && !order && (
        <Card className="p-8 text-center">
          <Package className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-medium mb-1">Order not found</h3>
          <p className="text-sm text-muted-foreground">
            Please check your Order ID and email and try again.
          </p>
        </Card>
      )}

      {order && (
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8 pb-6 border-b">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-mono font-medium text-lg">
                #{order.orderNumber || order.id.slice(0, 8)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant="secondary"
                className={`mt-1 capitalize ${statusColors[order.status] || ""}`}
              >
                {order.status}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1 capitalize">
                Payment: {order.paymentStatus}
              </p>
            </div>
          </div>

          {order.trackingNumber && (
            <div className="mb-8 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tracking Number</p>
                <p className="font-mono text-sm mt-1">{order.trackingNumber}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  window.open(
                    `https://tracking.example.com/${order.trackingNumber}`,
                    "_blank"
                  )
                }
              >
                Track <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase text-muted-foreground mb-6">
              Order Progress
            </h3>
            <div className="relative">
              {steps.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                return (
                  <div key={step.key} className="flex gap-4 mb-6 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? "✓" : index + 1}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-px h-12 ${
                            isCompleted ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p
                        className={`text-sm font-medium ${
                          isCurrent ? "text-primary" : ""
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-bold uppercase text-muted-foreground mb-4">
              Items
            </h3>
            <div className="space-y-3">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm py-2 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold mt-4 pt-4 border-t">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
