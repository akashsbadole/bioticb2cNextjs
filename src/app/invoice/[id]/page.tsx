"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/pricing";
import { format } from "date-fns";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  couponCode?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  paymentId?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function InvoicePage() {
  const params = useParams();
  const orderId = params.id as string;
  const { settings } = useAppStore();
  const currency = settings?.currency || "INR";
  const siteName = settings?.site_name || "Store";
  const siteAddress = settings?.site_address || "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    fetch(`/api/orders?orderId=${orderId}`)
      .then((r) => {
        if (r.status === 401) throw new Error("Please log in to view your invoice");
        if (!r.ok) throw new Error("Order not found");
        return r.json();
      })
      .then((data) => {
        if (data.order) setOrder(data.order);
        else throw new Error("Order not found");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Link href="/login" className="text-primary underline">Login</Link>
      </div>
    );
  }

  if (!order) return null;

  const parseAddress = () => {
    try {
      const addr = JSON.parse(order.shippingAddress || "{}");
      return `${addr.address || ""}, ${addr.city || ""}, ${addr.state || ""} ${addr.zipCode || ""}`;
    } catch {
      return order.shippingAddress || "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Action Bar — hidden when printing */}
      <div className="sticky top-0 z-10 bg-white border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to Store
          </Link>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Invoice */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="bg-white rounded-xl shadow-sm print:shadow-none overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-8 print:bg-gray-100 print:text-gray-900">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">INVOICE</h1>
                <p className="text-emerald-100 print:text-gray-500 mt-1">
                  #{order.id.slice(0, 8)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{siteName}</p>
                {siteAddress && (
                  <p className="text-sm text-emerald-100 print:text-gray-500">
                    {siteAddress}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Billing & Order Info */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">
                  Bill To
                </h3>
                <p className="font-semibold">{order.customerName}</p>
                <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                {order.customerPhone && (
                  <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">{parseAddress()}</p>
              </div>
              <div className="text-right">
                <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">
                  Order Info
                </h3>
                <p className="text-sm">
                  <span className="text-muted-foreground">Date:</span>{" "}
                  {format(new Date(order.createdAt), "PPP")}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Payment:</span>{" "}
                  {order.paymentStatus.toUpperCase()}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Method:</span>{" "}
                  {order.paymentMethod || "N/A"}
                </p>
                {order.paymentId && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">TXN ID:</span>{" "}
                    {order.paymentId}
                  </p>
                )}
                {order.trackingNumber && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Tracking:</span>{" "}
                    {order.trackingNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs uppercase text-muted-foreground font-bold tracking-wider">
                    <th className="text-left pb-3">Product</th>
                    <th className="text-center pb-3">Qty</th>
                    <th className="text-right pb-3">Price</th>
                    <th className="text-right pb-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 text-sm">{item.name}</td>
                      <td className="py-3 text-center text-sm">{item.quantity}</td>
                      <td className="py-3 text-right text-sm">
                        {formatPrice(item.price, currency)}
                      </td>
                      <td className="py-3 text-right text-sm font-medium">
                        {formatPrice(item.price * item.quantity, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-72 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal, currency)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                    <span>-{formatPrice(order.discount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.shipping === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      formatPrice(order.shipping, currency)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(order.tax, currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount, currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-8 py-4 text-center text-xs text-muted-foreground">
            <p>Thank you for your order at {siteName}!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
