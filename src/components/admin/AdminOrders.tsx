"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  Search,
  Eye,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminFetch } from "@/lib/admin-fetch";
import { formatPrice } from "@/lib/pricing";
import { useAppStore } from "@/lib/store";

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  paymentStatus: string;
  returnStatus?: string;
  refundAmount?: number;
  shippingAddress: string;
  paymentId: string;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export function AdminOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { settings } = useAppStore();
  const currency = settings?.currency || "INR";

  const handlePrint = () => {
    window.print();
  };

  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
        const res = await adminFetch("/api/admin/orders");
        return (await res.json()).orders || [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
        const res = await adminFetch(`/api/admin/orders/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed");
        return res.json();
    },
    onSuccess: (updated) => {
        toast.success("Order updated");
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        if (selectedOrder?.id === updated.order.id) {
            setSelectedOrder(updated.order);
        }
    }
  });

  const updateOrderStatus = (orderId: string, status: string) => {
    updateMutation.mutate({ id: orderId, data: { status } });
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "processing":
        return <Badge variant="default" className="bg-blue-500">Processing</Badge>;
      case "shipped":
        return <Badge variant="default" className="bg-purple-500">Shipped</Badge>;
      case "delivered":
        return <Badge variant="default" className="bg-emerald-500">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground mt-1">Manage customer orders and shipments</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">Loading orders...</TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">No orders found</TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{order.customerName}</span>
                      <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(order.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(order.totalAmount, currency)}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                        <Badge variant={order.paymentStatus === 'paid' ? 'outline' : 'secondary'} className={order.paymentStatus === 'paid' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : ''}>
                        {order.paymentStatus}
                        </Badge>
                        {order.returnStatus && (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                Return: {order.returnStatus}
                            </Badge>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedOrder(order); setViewDialogOpen(true); }}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "processing")}>
                          <Clock className="mr-2 h-4 w-4" /> Mark Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "shipped")}>
                          <Truck className="mr-2 h-4 w-4" /> Mark Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "delivered")}>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "cancelled")} className="text-destructive">
                          <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            const track = prompt("Enter tracking number:");
                            if (track !== null) updateMutation.mutate({ id: order.id, data: { trackingNumber: track } });
                        }}>
                            Add Tracking
                        </DropdownMenuItem>
                        <Separator />
                        <DropdownMenuItem onClick={() => {
                            const amt = prompt("Enter refund amount:");
                            if (amt) updateMutation.mutate({ id: order.id, data: { returnStatus: 'completed', refundAmount: amt } });
                        }}>
                            Issue Refund
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-6 py-4" id="printable-invoice">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold">INVOICE</h3>
                  <p className="text-sm text-muted-foreground">Order #{selectedOrder.id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{settings?.site_name}</p>
                  <p className="text-xs text-muted-foreground">{settings?.site_address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Bill To:</h4>
                  <p className="font-bold">{selectedOrder.customerName}</p>
                  <p className="text-sm">{selectedOrder.customerEmail}</p>
                  {selectedOrder.shippingAddress && (
                    <p className="text-sm mt-1">
                        {(() => {
                            try {
                                const addr = JSON.parse(selectedOrder.shippingAddress);
                                return `${addr.address || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`;
                            } catch {
                                return selectedOrder.shippingAddress;
                            }
                        })()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Order Info:</h4>
                  <p className="text-sm">Date: {format(new Date(selectedOrder.createdAt), "PPP")}</p>
                  <p className="text-sm">Payment: {selectedOrder.paymentStatus.toUpperCase()}</p>
                  <p className="text-sm">TXN ID: {selectedOrder.paymentId || 'N/A'}</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm">{item.name}</TableCell>
                        <TableCell className="text-center text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-right text-sm">{formatPrice(item.price, currency)}</TableCell>
                        <TableCell className="text-right text-sm font-medium">{formatPrice(item.price * item.quantity, currency)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatPrice(selectedOrder.totalAmount, currency)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter className="hide-print">
            <Button variant="outline" onClick={handlePrint}>Print Invoice</Button>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
