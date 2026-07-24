"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  Loader2,
  Settings2,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { adminFetch } from "@/lib/admin-fetch";

export interface CustomFieldDefinition {
  id: string;
  storeId?: string;
  entityType: string;
  name: string;
  type: string;
  options: string;
  isRequired: boolean;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

type EntityType = "product" | "category";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "url", label: "URL" },
  { value: "color", label: "Color" },
  { value: "select", label: "Dropdown" },
] as const;

const emptyForm: Omit<CustomFieldDefinition, "id" | "createdAt" | "updatedAt" | "storeId"> = {
  entityType: "product",
  name: "",
  type: "text",
  options: "[]",
  isRequired: false,
  isVisible: true,
  sortOrder: 0,
};

export function AdminCustomFields() {
  const queryClient = useQueryClient();
  const [entityType, setEntityType] = useState<EntityType>("product");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data: definitions = [], isLoading: loading } = useQuery({
    queryKey: ["admin-custom-fields", entityType],
    queryFn: async () => {
      const res = await adminFetch(`/api/custom-fields?entityType=${entityType}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      return (json.definitions || []) as CustomFieldDefinition[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await adminFetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Custom field created");
      setOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-custom-fields"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await adminFetch(`/api/custom-fields/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Custom field updated");
      setOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-custom-fields"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/custom-fields/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
    },
    onSuccess: () => {
      toast.success("Custom field deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-custom-fields"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setFormData({ ...emptyForm, entityType });
    setEditingId(null);
  };

  const handleOpen = (def?: CustomFieldDefinition) => {
    if (def) {
      setFormData({
        entityType: def.entityType as EntityType,
        name: def.name,
        type: def.type,
        options: def.options || "[]",
        isRequired: def.isRequired,
        isVisible: def.isVisible,
        sortOrder: def.sortOrder,
      });
      setEditingId(def.id);
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...formData,
      options: formData.type === "select" ? formData.options : "[]",
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this custom field? All associated values will also be removed.")) {
      deleteMutation.mutate(id);
    }
  };

  const typeLabel = (type: string) => FIELD_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Custom Fields</h2>
          <p className="text-muted-foreground mt-1">
            Define structured fields for products and categories
          </p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="mr-2 h-4 w-4" /> Add Field
        </Button>
      </div>

      <Tabs value={entityType} onValueChange={(v) => setEntityType(v as EntityType)}>
        <TabsList>
          <TabsTrigger value="product">Products</TabsTrigger>
          <TabsTrigger value="category">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value={entityType} className="mt-4">
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : definitions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No custom fields yet. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  definitions.map((def) => (
                    <TableRow key={def.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium">{def.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeLabel(def.type)}</Badge>
                      </TableCell>
                      <TableCell>
                        {def.isRequired ? (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">Required</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Optional</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {def.isVisible ? (
                          <Eye className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{def.sortOrder}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpen(def)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(def.id)}
                          >
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
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "Add"} Custom Field</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cf-entity">Entity</Label>
              <Select
                value={formData.entityType}
                onValueChange={(v) => setFormData((p) => ({ ...p, entityType: v as EntityType }))}
              >
                <SelectTrigger id="cf-entity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-name">Field Name</Label>
              <Input
                id="cf-name"
                placeholder="e.g. Material, Origin, Certification"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-type">Field Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}
              >
                <SelectTrigger id="cf-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.type === "select" && (
              <div className="space-y-2">
                <Label htmlFor="cf-options">Options (one per line)</Label>
                <Textarea
                  id="cf-options"
                  placeholder={"Option A\nOption B\nOption C"}
                  value={formData.options}
                  onChange={(e) => setFormData((p) => ({ ...p, options: e.target.value }))}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Enter each option on a new line. Saved as a list.
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="cf-required" className="cursor-pointer">Required</Label>
                <Switch
                  id="cf-required"
                  checked={formData.isRequired}
                  onCheckedChange={(checked) => setFormData((p) => ({ ...p, isRequired: checked }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="cf-visible" className="cursor-pointer">Visible</Label>
                <Switch
                  id="cf-visible"
                  checked={formData.isVisible}
                  onCheckedChange={(checked) => setFormData((p) => ({ ...p, isVisible: checked }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf-order">Sort Order</Label>
              <Input
                id="cf-order"
                type="number"
                value={String(formData.sortOrder)}
                onChange={(e) => setFormData((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingId ? "Save Changes" : "Create Field"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
