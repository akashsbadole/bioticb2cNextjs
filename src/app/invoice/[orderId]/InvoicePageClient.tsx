"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InvoicePageClientProps {
  order: {
    id: string;
    orderNumber?: string | null;
    totalAmount: number;
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    paymentStatus: string;
    paymentMethod: string | null;
    paymentId?: string | null;
    trackingNumber?: string | null;
    gstin?: string | null;
    notes?: string | null;
    createdAt: Date;
    items: Array<{
      id: string;
      name: string;
      sku?: string | null;
      hsnCode?: string | null;
      quantity: number;
      price: number;
      total: number;
    }>;
    User?: { name: string; email: string; phone?: string | null } | null;
    Store?: {
      name: string;
      logo?: string | null;
    } | null;
  };
  companyGstin?: string | null;
  siteEmail?: string | null;
  sitePhone?: string | null;
  siteAddress?: string | null;
}

export function InvoicePageClient({ order, companyGstin, siteEmail, sitePhone, siteAddress }: InvoicePageClientProps) {
  const [printing, setPrinting] = useState(false);

  const storeGstin = companyGstin || null;

  const gstRate = order.subtotal > 0 ? (order.tax / (order.subtotal - order.discount)) * 100 : 0;
  const cgstAmount = order.tax / 2;
  const sgstAmount = order.tax / 2;

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  const handleDownload = () => {
    handlePrint();
    toast.info("Use your browser's print dialog to save as PDF");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <Button onClick={handleDownload} disabled={printing}>
          {printing ? "Preparing..." : "Download Invoice"}
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          Print
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border p-6 sm:p-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8 pb-8 border-b">
            <div>
              <h1 className="text-3xl font-bold mb-1">INVOICE</h1>
              <p className="text-muted-foreground">#{order.orderNumber || order.id.slice(0, 8)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {order.Store?.logo && (
              <div className="flex items-center justify-center">
                <img
                  src={order.Store.logo}
                  alt={order.Store.name || "Store logo"}
                  className="h-16 w-auto object-contain"
                />
              </div>
            )}
          </div>

          {/* Store & Customer Info */}
          <div className="grid sm:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-bold uppercase text-muted-foreground mb-2">
                From
              </h3>
              <p className="font-bold text-lg">{order.Store?.name || "Store"}</p>
              {siteAddress && (
                <p className="text-sm text-muted-foreground mt-1">
                  {siteAddress}
                </p>
              )}
              {siteEmail && (
                <p className="text-sm text-muted-foreground">
                  {siteEmail}
                </p>
              )}
              {sitePhone && (
                <p className="text-sm text-muted-foreground">
                  {sitePhone}
                </p>
              )}
              {storeGstin && (
                <p className="text-sm text-muted-foreground">
                  GSTIN: {storeGstin}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase text-muted-foreground mb-2">
                Bill To
              </h3>
              <p className="font-medium">{order.User?.name || order.id}</p>
              {order.User?.email && (
                <p className="text-sm text-muted-foreground">
                  {order.User.email}
                </p>
              )}
              {order.User?.phone && (
                <p className="text-sm text-muted-foreground">
                  {order.User.phone}
                </p>
              )}
              {order.gstin && (
                <p className="text-sm text-muted-foreground">
                  GSTIN: {order.gstin}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-foreground">
                  <th className="text-left py-2 font-bold">Item</th>
                  <th className="text-center py-2 font-bold">HSN/SAC</th>
                  <th className="text-center py-2 font-bold">Qty</th>
                  <th className="text-right py-2 font-bold">Price</th>
                  <th className="text-right py-2 font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">
                      <p className="font-medium">{item.name}</p>
                      {item.sku && (
                        <p className="text-xs text-muted-foreground">
                          SKU: {item.sku}
                        </p>
                      )}
                    </td>
                    <td className="text-center py-3 text-xs font-mono text-muted-foreground">
                      {item.hsnCode || "—"}
                    </td>
                    <td className="text-center py-3">{item.quantity}</td>
                    <td className="text-right py-3">
                      {formatPrice(item.price, "INR")}
                    </td>
                    <td className="text-right py-3">
                      {formatPrice(item.total, "INR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col sm:flex-row justify-end mb-8">
            <div className="w-full sm:w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal, "INR")}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount, "INR")}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shipping === 0
                    ? "Free"
                    : formatPrice(order.shipping, "INR")}
                </span>
              </div>
              {order.tax > 0 && gstRate > 0 ? (
                <>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>CGST @ {(gstRate / 2).toFixed(1)}%</span>
                    <span>{formatPrice(cgstAmount, "INR")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>SGST @ {(gstRate / 2).toFixed(1)}%</span>
                    <span>{formatPrice(sgstAmount, "INR")}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(order.tax, "INR")}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount, "INR")}</span>
              </div>
            </div>
          </div>

          {/* Payment & Status */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8 pb-8 border-b">
            <div>
              <h3 className="text-sm font-bold uppercase text-muted-foreground mb-2">
                Payment Method
              </h3>
              <p className="font-medium capitalize">
                {order.paymentMethod || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                Status: {order.paymentStatus}
              </p>
              {order.paymentId && (
                <p className="text-sm text-muted-foreground">
                  Transaction ID: {order.paymentId}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase text-muted-foreground mb-2">
                Tracking
              </h3>
              <p className="font-medium">
                {order.trackingNumber || "Not yet shipped"}
              </p>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-muted-foreground mb-2">
                Notes
              </h3>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-8 border-t">
            <p>Thank you for your order!</p>
            <p className="mt-1">
              For any questions, contact us with your order number.
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
          .bg-muted\\/30 {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
