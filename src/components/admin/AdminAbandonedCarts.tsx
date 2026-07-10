"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Mail, Search, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminFetch } from "@/lib/admin-fetch";
import { formatDistanceToNow } from "date-fns";
import { formatPrice } from "@/lib/pricing";
import { useAppStore } from "@/lib/store";

export function AdminAbandonedCarts() {
  const queryClient = useQueryClient();
  const { settings } = useAppStore();
  const currency = settings?.currency || "INR";

  const { data: carts = [], isLoading: loading } = useQuery({
    queryKey: ["admin-abandoned-carts"],
    queryFn: async () => {
        const res = await adminFetch("/api/admin/abandoned-carts");
        return (await res.json()).carts || [];
    }
  });

  const remindMutation = useMutation({
    mutationFn: async ({ email, userName, cartId }: { email: string, userName: string, cartId: string }) => {
        const res = await adminFetch("/api/admin/abandoned-carts", {
            method: 'POST',
            body: JSON.stringify({ email, userName, cartId })
        });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("Reminder sent!");
        queryClient.invalidateQueries({ queryKey: ["admin-abandoned-carts"] });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Abandoned Carts</h2>
        <p className="text-muted-foreground mt-1">Customers who left items in their cart without checking out</p>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : carts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No abandoned carts found</TableCell></TableRow>
            ) : (
              carts.map((cart) => {
                const total = cart.items.reduce((sum: number, i: any) => sum + (i.Product.price * i.quantity), 0);
                return (
                  <TableRow key={cart.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{cart.User?.name || 'Guest'}</span>
                        <span className="text-xs text-muted-foreground">{cart.User?.email || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{cart.items.length} items</span>
                    </TableCell>
                    <TableCell className="font-bold">{formatPrice(total, currency)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(cart.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!cart.User?.email || remindMutation.isPending}
                            onClick={() => remindMutation.mutate({ email: cart.User.email, userName: cart.User.name, cartId: cart.id })}
                        >
                            {remindMutation.isPending && remindMutation.variables?.cartId === cart.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="mr-2 h-3 w-3" />}
                            Remind
                        </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
