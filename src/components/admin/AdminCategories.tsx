"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  FolderOpen,
  AlertTriangle,
  ChevronDown,
  SearchCode,
  Power,
  PowerOff,
  FileText,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { adminFetch } from "@/lib/admin-fetch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AdminCategoryFields,
  type CategoryFieldValues,
} from "./AdminCategoryFields";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  customSchema?: string | null;
  parentId?: string | null;
  _count?: { Product: number };
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: string;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  customSchema: string;
  parentId: string;
  productIds: string[];
}

const emptyForm: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  image: "",
  sortOrder: "0",
  isActive: true,
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  customSchema: "",
  parentId: "",
  productIds: [],
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminCategories() {
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  const [categoryFields, setCategoryFields] = useState<CategoryFieldValues>({
    heroTitle: "",
    heroSubtitle: "",
    heroDescription: "",
    contentSplitImage: "",
    contentSplitHeading: "",
    contentSplitParagraph: "",
    contentSplitBullets: "[]",
    cardsTitle: "",
    cardsProductIds: "",
    cardsMaxCount: 8,
    cardsColumns: 4,
    ctaHeading: "",
    ctaDescription: "",
    ctaBulkText: "",
    ctaBulkLink: "",
    ctaPrivateLabelText: "",
    ctaPrivateLabelLink: "",
    ctaBackgroundColor: "",
    processTitle: "",
    processSubtitle: "",
    processSteps: "[]",
    infographicImage: "",
    infographicCaption: "",
    infographicAltText: "",
    galleryTitle: "",
    galleryImages: "[]",
    faqTitle: "",
    faqItems: "[]",
  });
  const [savingSections, setSavingSections] = useState(false);
  const [activeSectionTab, setActiveSectionTab] = useState("details");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Product picker state
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  // CSV import/export state
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
        const res = await adminFetch("/api/categories?all=true");
        if (!res.ok) throw new Error("Failed");
        return (await res.json()).categories || [];
    }
  });

  const resetCategoryFields = () => {
    setCategoryFields({
      heroTitle: "",
      heroSubtitle: "",
      heroDescription: "",
      contentSplitImage: "",
      contentSplitHeading: "",
      contentSplitParagraph: "",
      contentSplitBullets: "[]",
      cardsTitle: "",
      cardsProductIds: "",
      cardsMaxCount: 8,
      cardsColumns: 4,
      ctaHeading: "",
      ctaDescription: "",
      ctaBulkText: "",
      ctaBulkLink: "",
      ctaPrivateLabelText: "",
      ctaPrivateLabelLink: "",
      ctaBackgroundColor: "",
      processTitle: "",
      processSubtitle: "",
      processSteps: "[]",
      infographicImage: "",
      infographicCaption: "",
      infographicAltText: "",
      galleryTitle: "",
      galleryImages: "[]",
      faqTitle: "",
      faqItems: "[]",
    });
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setForm({ ...emptyForm, productIds: [] });
    setSeoOpen(false);
    resetCategoryFields();
    setFormOpen(true);
  };

  const { data: allProducts = [] } = useQuery({
    queryKey: ["admin-products-minimal"],
    queryFn: async () => {
        const res = await fetch("/api/products?limit=1000");
        const data = await res.json();
        return (data.products || []).map((p: any) => ({ id: p.id, name: p.name }));
    },
    enabled: formOpen
  });

  const handleOpenEdit = async (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      sortOrder: String(cat.sortOrder),
      isActive: cat.isActive,
      metaTitle: cat.metaTitle || "",
      metaDescription: cat.metaDescription || "",
      ogImage: cat.ogImage || "",
      customSchema: cat.customSchema || "",
      parentId: cat.parentId || "",
      productIds: [],
    });
    setSeoOpen(!!(cat.metaTitle || cat.metaDescription));
    resetCategoryFields();
    setFormOpen(true);

    // Fetch full category details including section fields and products
    try {
      const res = await adminFetch(`/api/categories/${cat.id}`);
      if (res.ok) {
        const data = await res.json();
        const c = data.category;
        if (c) {
          setCategoryFields({
            heroTitle: c.heroTitle || "",
            heroSubtitle: c.heroSubtitle || "",
            heroDescription: c.heroDescription || "",
            contentSplitImage: c.contentSplitImage || "",
            contentSplitHeading: c.contentSplitHeading || "",
            contentSplitParagraph: c.contentSplitParagraph || "",
            contentSplitBullets: c.contentSplitBullets || "[]",
            cardsTitle: c.cardsTitle || "",
            cardsProductIds: c.cardsProductIds || "",
            cardsMaxCount: c.cardsMaxCount ?? 8,
            cardsColumns: c.cardsColumns ?? 4,
            ctaHeading: c.ctaHeading || "",
            ctaDescription: c.ctaDescription || "",
            ctaBulkText: c.ctaBulkText || "",
            ctaBulkLink: c.ctaBulkLink || "",
            ctaPrivateLabelText: c.ctaPrivateLabelText || "",
            ctaPrivateLabelLink: c.ctaPrivateLabelLink || "",
            ctaBackgroundColor: c.ctaBackgroundColor || "",
            processTitle: c.processTitle || "",
            processSubtitle: c.processSubtitle || "",
            processSteps: c.processSteps || "[]",
            infographicImage: c.infographicImage || "",
            infographicCaption: c.infographicCaption || "",
            infographicAltText: c.infographicAltText || "",
            galleryTitle: c.galleryTitle || "",
            galleryImages: c.galleryImages || "[]",
            faqTitle: c.faqTitle || "",
            faqItems: c.faqItems || "[]",
          });
        }
        if (data.products) {
          setForm((prev) => ({
            ...prev,
            productIds: data.products.map((p: { id: string }) => p.id),
          }));
        }
      }
    } catch {
      // silently fail
    }
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string, data: any }) => {
        const url = id ? `/api/categories/${id}` : "/api/categories";
        const res = await adminFetch(url, {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Failed");
        return res.json();
    },
    onSuccess: () => {
        toast.success(editingCategory ? "Category updated" : "Category created");
        setFormOpen(false);
        queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || generateSlug(form.name),
        description: form.description.trim() || null,
        image: form.image.trim() || null,
        sortOrder: parseInt(form.sortOrder) || 0,
        isActive: form.isActive,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        ogImage: form.ogImage.trim() || null,
        customSchema: form.customSchema.trim() || null,
        parentId: form.parentId || null,
        productIds: form.productIds,
        // Category page fields
        ...categoryFields
    };

    saveMutation.mutate({ id: editingCategory?.id, data: payload });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === categories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map((c) => c.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const bulkMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: string[], action: string }) => {
        const res = await adminFetch("/api/categories/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids, action }),
        });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: (_, variables) => {
        toast.success(`Bulk action successful`);
        setSelectedIds([]);
        setBulkAction(null);
        queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    }
  });

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;
    if (action === "delete") {
      setBulkAction(action);
      return;
    }
    bulkMutation.mutate({ ids: selectedIds, action });
  };

  const handleBulkDelete = () => {
    bulkMutation.mutate({ ids: selectedIds, action: "delete" });
  };

  const handleDeleteClick = (cat: Category) => {
    setDeleteId(cat.id);
    setDeleteCategory(cat);
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await adminFetch("/api/categories/import", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Imported ${data.imported} category(ies)`);
        if (data.errors && data.errors.length > 0) {
          toast.warning(`${data.errors.length} error(s) during import`);
        }
        queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      } else {
        const err = await res.json();
        toast.error(err.error || "Import failed");
      }
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleCSVExport = async () => {
    setExporting(true);
    try {
      const res = await adminFetch("/api/categories/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `categories-export-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Categories exported");
      } else {
        toast.error("Export failed");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/categories/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("Category deleted");
        queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
        setDeleteId(null);
        setDeleteCategory(null);
    }
  });

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground mt-1">
            Organize your products into categories
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVImport}
              disabled={importing}
            />
            <Button variant="outline" size="sm" disabled={importing} asChild>
              <span>
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                {importing ? "Importing..." : "Import CSV"}
              </span>
            </Button>
          </label>
          <Button
            variant="outline"
            size="sm"
            disabled={exporting}
            onClick={handleCSVExport}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => handleBulkAction("activate")}
              disabled={bulkLoading}
            >
              <Power className="mr-1.5 h-3.5 w-3.5" />
              Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              onClick={() => handleBulkAction("deactivate")}
              disabled={bulkLoading}
            >
              <PowerOff className="mr-1.5 h-3.5 w-3.5" />
              Deactivate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => handleBulkAction("delete")}
              disabled={bulkLoading}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No categories yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first category to organize products
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        categories.length > 0 &&
                        selectedIds.length === categories.length
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Slug</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Products
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow
                    key={cat.id}
                    className={
                      selectedIds.includes(cat.id) ? "bg-muted/50" : ""
                    }
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(cat.id)}
                        onCheckedChange={() => handleSelectOne(cat.id)}
                        aria-label={`Select ${cat.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="h-8 w-8 rounded-md object-cover bg-muted hidden sm:block"
                          />
                        ) : (
                          <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {cat.slug}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground">
                      {cat.description || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline">
                        {cat._count?.Product || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          cat.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                        }
                      >
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => handleDeleteClick(cat)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <Tabs value={activeSectionTab} onValueChange={setActiveSectionTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="grid gap-4 py-4 max-h-[calc(90vh-210px)] overflow-y-auto">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-name">
                  Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="cat-name"
                  placeholder="Category name"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  placeholder="category-slug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                placeholder="Category description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-image">Image URL</Label>
              <Input
                id="cat-image"
                placeholder="https://example.com/image.jpg"
                value={form.image}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, image: e.target.value }))
                }
              />
              {form.image && (
                <img
                  src={form.image}
                  alt="Preview"
                  className="h-16 w-16 rounded-md object-cover bg-muted"
                />
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-sort">Sort Order</Label>
                <Input
                  id="cat-sort"
                  type="number"
                  placeholder="0"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sortOrder: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-parent">Parent Category</Label>
                <Select
                  value={form.parentId || "__none__"}
                  onValueChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      parentId: val === "__none__" ? "" : val,
                    }))
                  }
                >
                  <SelectTrigger id="cat-parent">
                    <SelectValue placeholder="No Parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No Parent</SelectItem>
                    {categories
                      .filter((c) => c.id !== editingCategory?.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label
                className="cursor-pointer"
                onClick={() =>
                  setForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
              >
                Active
              </Label>
            </div>

            {/* Products Picker */}
            <div className="space-y-2">
              <Label>Products in this Category</Label>
              <Popover
                open={productPickerOpen}
                onOpenChange={setProductPickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-auto min-h-10"
                  >
                    {form.productIds.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {form.productIds.slice(0, 5).map((id) => {
                          const p = allProducts.find((ap) => ap.id === id);
                          return p ? (
                            <Badge
                              key={id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {p.name}
                              <span
                                role="button"
                                tabIndex={0}
                                className="ml-1 hover:text-rose-500 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setForm((prev) => ({
                                    ...prev,
                                    productIds: prev.productIds.filter(
                                      (pid) => pid !== id,
                                    ),
                                  }));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.stopPropagation();
                                    setForm((prev) => ({
                                      ...prev,
                                      productIds: prev.productIds.filter(
                                        (pid) => pid !== id,
                                      ),
                                    }));
                                  }
                                }}
                              >
                                ×
                              </span>
                            </Badge>
                          ) : null;
                        })}
                        {form.productIds.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{form.productIds.length - 5} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Select products...
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search products..." />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup className="max-h-48 overflow-y-auto">
                        {allProducts.map((p) => {
                          const selected = form.productIds.includes(p.id);
                          return (
                            <CommandItem
                              key={p.id}
                              onSelect={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  productIds: selected
                                    ? prev.productIds.filter(
                                        (id) => id !== p.id,
                                      )
                                    : [...prev.productIds, p.id],
                                }));
                              }}
                            >
                              <Checkbox checked={selected} className="mr-2" />
                              {p.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {allProducts.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No products available. Create products first.
                </p>
              )}
            </div>

            <Separator />

            {/* SEO Section (Collapsible) */}
            <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <SearchCode className="h-4 w-4" />
                    SEO Settings
                    {(form.metaTitle || form.metaDescription) && (
                      <span className="text-xs text-emerald-600 font-normal">
                        (configured)
                      </span>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-3">
                <div className="space-y-2">
                  <Label htmlFor="cat-meta-title">Meta Title</Label>
                  <Input
                    id="cat-meta-title"
                    placeholder="Category Name | Store Name"
                    value={form.metaTitle}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        metaTitle: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use: Category Name | Purva Bites
                  </p>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="cat-meta-desc"
                    className="flex items-center justify-between"
                  >
                    <span>Meta Description</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {form.metaDescription.length}/160
                    </span>
                  </Label>
                  <Textarea
                    id="cat-meta-desc"
                    placeholder="A brief description for search engines..."
                    value={form.metaDescription}
                    onChange={(e) => {
                      if (e.target.value.length <= 160) {
                        setForm((prev) => ({
                          ...prev,
                          metaDescription: e.target.value,
                        }));
                      }
                    }}
                    rows={3}
                    className={
                      form.metaDescription.length >= 150
                        ? "border-amber-400"
                        : ""
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 150-160 characters for optimal SEO
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-og-image">OG Image URL</Label>
                  <Input
                    id="cat-og-image"
                    placeholder="https://example.com/og-image.jpg"
                    value={form.ogImage}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ogImage: e.target.value,
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Image shown when this category is shared on social media (recommended 1200×630px)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-custom-schema">
                    Custom JSON-LD Schema
                  </Label>
                  <Textarea
                    id="cat-custom-schema"
                    placeholder='{"@context": "https://schema.org", "@type": "CollectionPage", ...}'
                    value={form.customSchema}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        customSchema: e.target.value,
                      }))
                    }
                    rows={3}
                    className="font-mono text-xs"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>
          <TabsContent value="sections" className="py-4 max-h-[calc(90vh-210px)] overflow-y-auto">
            <AdminCategoryFields
              values={categoryFields}
              onChange={setCategoryFields}
              onSave={async () => {
                setSavingSections(true);
                try {
                  await handleSave();
                } finally {
                  setSavingSections(false);
                }
              }}
              saving={savingSections}
            />
          </TabsContent>
        </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? "Saving..."
                : editingCategory
                  ? "Update Category"
                  : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteCategory?.name}
              &rdquo;? This action cannot be undone.
              {deleteCategory && (deleteCategory._count?.Product || 0) > 0 && (
                <span className="block mt-2 font-medium text-rose-600">
                  Warning: This category has {deleteCategory._count?.Product}{" "}
                  product(s) associated with it.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog
        open={bulkAction === "delete"}
        onOpenChange={() => setBulkAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Bulk Delete Categories
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected
              categor{selectedIds.length === 1 ? "y" : "ies"}? This action
              cannot be undone. Products in these categories will have their
              category removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {bulkMutation.isPending
                ? "Deleting..."
                : `Delete ${selectedIds.length} Categor${selectedIds.length === 1 ? "y" : "ies"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
