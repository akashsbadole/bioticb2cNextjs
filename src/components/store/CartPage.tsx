"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/pricing";

export function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, navigate, settings } = useAppStore();
  const currency = settings?.currency || "INR";

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center bg-card border-2 border-dashed rounded-[3rem] my-12">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative rounded-full bg-primary/10 p-10 ring-1 ring-primary/20">
                <ShoppingCart className="h-16 w-16 text-primary" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-black mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg">
          Looks like you haven't added anything to your cart yet. Browse our collections to find something you love.
        </p>
        <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20" onClick={() => navigate("products")}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || "base"}`}
              className="flex items-center gap-4 p-4 border rounded-lg bg-card"
            >
              <div className="h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted border">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate hover:text-primary cursor-pointer" onClick={() => navigate("product-page", item.productId.split('/').pop())}>{item.name}</h3>
                <p className="text-sm text-primary font-bold mt-1">
                  {formatPrice(item.price, currency)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={() =>
                      updateCartQuantity(
                        item.productId,
                        Math.max(1, item.quantity - 1),
                        item.variantId
                      )
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={() =>
                      updateCartQuantity(
                        item.productId,
                        item.quantity + 1,
                        item.variantId
                      )
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeFromCart(item.productId, item.variantId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="p-6 border rounded-lg bg-card sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
            </div>
            <Button
              className="w-full mt-6"
              size="lg"
              onClick={() => navigate("checkout")}
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Secure checkout powered by PayU
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-[1px] bg-border ${className}`} />;
}
