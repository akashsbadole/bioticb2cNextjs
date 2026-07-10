"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, Home, Briefcase, CheckCircle2, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function AddressBook() {
  const { auth } = useAppStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    label: "Home",
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const { data: addresses = [], isLoading: loading } = useQuery({
    queryKey: ["addresses"],
    enabled: !!auth.token,
    queryFn: async () => {
        const res = await fetch("/api/account/addresses", {
            headers: { Authorization: `Bearer ${auth.token}` },
        });
        return (await res.json()).addresses || [];
    }
  });

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
        const res = await fetch("/api/account/addresses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed");
        return res.json();
    },
    onSuccess: () => {
        toast.success("Address added");
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: ["addresses"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const updated = addresses.filter((a: any) => a.id !== id);
        const res = await fetch("/api/account/addresses", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify({ addresses: updated }),
          });
          if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("Address deleted");
        queryClient.invalidateQueries({ queryKey: ["addresses"] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const deleteAddress = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Addresses</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {loading ? (
          <div className="h-32 bg-muted animate-pulse rounded-xl sm:col-span-2" />
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl sm:col-span-2 text-muted-foreground">
            No addresses saved yet.
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="p-4 border rounded-xl relative group hover:border-primary transition-colors">
              <div className="flex items-center gap-2 mb-2">
                {addr.label === "Home" ? <Home className="h-4 w-4 text-primary" /> : <Briefcase className="h-4 w-4 text-primary" />}
                <span className="font-bold text-sm uppercase tracking-wide">{addr.label}</span>
                {addr.isDefault && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              </div>
              <p className="font-medium text-sm">{addr.name}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-xs font-medium mt-2">{addr.phone}</p>

              <button
                onClick={() => deleteAddress(addr.id)}
                className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <div className="flex gap-2">
                {["Home", "Work", "Other"].map((l) => (
                  <Button
                    key={l}
                    type="button"
                    variant={formData.label === l ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, label: l })}
                  >
                    {l}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr">Address</Label>
              <Input required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Pincode</Label>
                <Input required value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Address
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
