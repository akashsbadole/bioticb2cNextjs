"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle2, XCircle, Trash2, Search, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminFetch } from "@/lib/admin-fetch";
import { format } from "date-fns";

export function AdminReviews() {
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading: loading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
        const res = await adminFetch("/api/admin/reviews");
        return (await res.json()).reviews || [];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
        const res = await adminFetch(`/api/admin/reviews/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive }),
        });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: (_, variables) => {
        toast.success(variables.isActive ? "Review approved" : "Review hidden");
        queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("Review deleted");
        queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    }
  });

  const updateStatus = (id: string, isActive: boolean) => {
    updateStatusMutation.mutate({ id, isActive });
  };

  const deleteReview = (id: string) => {
    if (confirm("Are you sure?")) deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Product Reviews</h2>
        <p className="text-muted-foreground mt-1">Moderate customer ratings and comments</p>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Loading...</TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No reviews found</TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.Product?.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{review.User?.name}</span>
                        <span className="text-xs text-muted-foreground">{review.User?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : ""}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{review.comment}</TableCell>
                  <TableCell>
                    <Badge variant={review.isActive ? "default" : "secondary"}>
                      {review.isActive ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        {review.isActive ? (
                            <Button variant="ghost" size="icon" onClick={() => updateStatus(review.id, false)} title="Hide">
                                <XCircle className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button variant="ghost" size="icon" className="text-emerald-600" onClick={() => updateStatus(review.id, true)} title="Approve">
                                <CheckCircle2 className="h-4 w-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteReview(review.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
