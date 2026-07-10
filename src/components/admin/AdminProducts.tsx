"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Upload,
  Star,
  RefreshCw,
  ImageIcon,
  ChevronDown,
  SearchCode,
  Package,
  EyeOff,
  Eye,
  Undo2,
  Trash,
  Download,
  FileText,
  Link2,
  Check,
  X,
} from "lucide-react";
import { AdminProductVariants } from "./AdminProductVariants";
import { formatPrice as libFormatPrice } from "@/lib/pricing";
import type { PageBlock } from "@/lib/page-blocks";
import { normalizePageBlocks } from "@/lib/page-blocks";

const WysiwygEditor = dynamic(
  () => import("@/components/admin/WysiwygEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[300px] rounded-md border border-input bg-muted/30 animate-pulse" />
    ),
  },
);
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminFetch } from "@/lib/admin-fetch";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  wholesalePrice: number | null;
  minOrderQty: number;
  sku: string | null;
  barcode: string | null;
  images: string;
  categoryId: string | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  isDigital: boolean;
  downloadUrl: string;
  videoUrl: string;
  sortOrder: number;
  specifications: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  customSchema: string | null;
  whatsappNumber: string | null;
  tags: string | null;
  attributes: string | null;
  deletedAt: string | null;
  stock: number;
  lowStockThreshold: number;
  relatedProductIds: string;
  blocks: string;
  Category?: Category | null;
  createdAt: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  comparePrice: string;
  wholesalePrice: string;
  minOrderQty: string;
  sku: string;
  barcode: string;
  images: string;
  categoryId: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  isDigital: boolean;
  downloadUrl: string;
  videoUrl: string;
  sortOrder: string;
  specifications: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  customSchema: string;
  whatsappNumber: string;
  tags: string;
  attributes: string;
  stock: string;
  lowStockThreshold: string;
  relatedProductIds: string;
}

const emptyForm: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  price: "",
  comparePrice: "",
  wholesalePrice: "",
  minOrderQty: "1",
  sku: "",
  barcode: "",
  images: "",
  categoryId: "",
  isFeatured: false,
  isBestSeller: false,
  isActive: true,
  isDigital: false,
  downloadUrl: "",
  videoUrl: "",
  sortOrder: "0",
  specifications: "",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  customSchema: "",
  whatsappNumber: "",
  tags: "",
  attributes: "{}",
  stock: "0",
  lowStockThreshold: "10",
  relatedProductIds: "",
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseImages(images: string): string[] {
  if (!images || images.trim() === "" || images.trim() === "[]") return [];
  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fallback: split by comma
  }
  return images
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function getFirstImageUrl(product: Product): string {
  const imgs = parseImages(product.images);
  return imgs.length > 0 ? imgs[0] : "";
}

export function AdminProducts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Collapsible sections
  const [seoOpen, setSeoOpen] = useState(false);
  const [b2bOpen, setB2bOpen] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Trash tab state
  const [activeTab, setActiveTab] = useState("active");
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(
    null,
  );
  const [permanentDeleting, setPermanentDeleting] = useState(false);

  // CSV import/export state
  const [importing, setImporting] = useState(false);
  const [importPlatform, setImportPlatform] = useState<string>("auto");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Inline stock edit state
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [inlineStock, setInlineStock] = useState("");

  // Related products search state
  const [relatedSearch, setRelatedSearch] = useState("");
  const [relatedResults, setRelatedResults] = useState<Product[]>([]);
  const [selectedRelatedIds, setSelectedRelatedIds] = useState<string[]>([]);

  // Edit dialog tab
  const [editTab, setEditTab] = useState("general");

  // Page builder state
  const [productBlocks, setProductBlocks] = useState<PageBlock[]>([]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderSaving, setBuilderSaving] = useState(false);

  // Queries
  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ["admin-products", activeTab, searchTerm, categoryFilter],
    queryFn: async () => {
        const params = new URLSearchParams({ all: "true" });
        if (activeTab === "trashed") params.set("trashed", "true");
        if (searchTerm) params.set("search", searchTerm);
        if (categoryFilter && categoryFilter !== "all")
            params.set("categoryId", categoryFilter);
        const res = await adminFetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load products");
        return (await res.json()).products || [];
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
        const res = await adminFetch("/api/categories?all=true");
        return (await res.json()).categories || [];
    }
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
        const res = await adminFetch("/api/store/settings");
        return (await res.json()).settings || [];
    }
  });

  const currency = useMemo(() => {
    return settings.find((s: any) => s.key === "currency")?.value || "INR";
  }, [settings]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async ({ id, data }: { id?: string, data: any }) => {
        const url = id ? `/api/products/${id}` : "/api/products";
        const res = await adminFetch(url, {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error((await res.json()).error || "Failed to save");
        return res.json();
    },
    onSuccess: () => {
        toast.success(editingProduct ? "Product updated" : "Product created");
        setFormOpen(false);
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/products/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("Product moved to trash");
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        setDeleteId(null);
    }
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/products/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ restore: true }),
        });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("Product restored");
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    }
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/products/${id}?permanent=true`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("Product permanently deleted");
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        setPermanentDeleteId(null);
    }
  });

  const bulkMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: string[], action: string }) => {
        const res = await adminFetch("/api/products/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids, action }),
        });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: (_, variables) => {
        toast.success(`Bulk action ${variables.action} successful`);
        setSelectedIds([]);
        setBulkAction(null);
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    }
  });

  const inlineStockMutation = useMutation({
    mutationFn: async ({ id, stock }: { id: string, stock: number }) => {
        const res = await adminFetch(`/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock }),
        });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("Stock updated");
        setEditingStockId(null);
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    }
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setSeoOpen(false);
    setB2bOpen(false);
    setFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    const imgs = parseImages(product.images);
    const relatedIds: string[] = (() => {
      try {
        const parsed = JSON.parse(product.relatedProductIds || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();
    setSelectedRelatedIds(relatedIds);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      price: String(product.price),
      comparePrice: product.comparePrice ? String(product.comparePrice) : "",
      wholesalePrice: product.wholesalePrice
        ? String(product.wholesalePrice)
        : "",
      minOrderQty: String(product.minOrderQty || 1),
      sku: product.sku || "",
      barcode: product.barcode || "",
      images: imgs.join(", "),
      categoryId: product.categoryId || "",
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller || false,
      isActive: product.isActive,
      isDigital: product.isDigital || false,
      downloadUrl: product.downloadUrl || "",
      videoUrl: product.videoUrl || "",
      sortOrder: String(product.sortOrder),
      specifications: product.specifications || "",
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      ogImage: product.ogImage || "",
      customSchema: product.customSchema || "",
      whatsappNumber: product.whatsappNumber || "",
      tags: product.tags || "",
      attributes: product.attributes || "{}",
      stock: String(product.stock ?? 0),
      lowStockThreshold: String(product.lowStockThreshold ?? 10),
      relatedProductIds: product.relatedProductIds || "",
    });
    setSeoOpen(!!(product.metaTitle || product.metaDescription));
    setB2bOpen(
      !!(
        product.wholesalePrice ||
        product.minOrderQty > 1 ||
        product.whatsappNumber
      ),
    );
    setEditTab("general");
    setProductBlocks(normalizePageBlocks(product.blocks || "[]"));
    setFormOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingProduct ? prev.slug : generateSlug(name),
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      toast.error("Valid price is required");
      return;
    }

    const imagesArray = form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || generateSlug(form.name),
        description: form.description.trim() || null,
        shortDescription: form.shortDescription.trim() || null,
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
        wholesalePrice: form.wholesalePrice
          ? Number(form.wholesalePrice)
          : null,
        minOrderQty: parseInt(form.minOrderQty) || 1,
        sku: form.sku.trim() || null,
        barcode: form.barcode.trim() || null,
        images: imagesArray,
        categoryId: form.categoryId || null,
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
        isActive: form.isActive,
        isDigital: form.isDigital,
        downloadUrl: form.downloadUrl.trim() || null,
        videoUrl: form.videoUrl.trim() || null,
        sortOrder: parseInt(form.sortOrder) || 0,
        specifications: form.specifications.trim() || null,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        ogImage: form.ogImage.trim() || null,
        customSchema: form.customSchema.trim() || null,
        whatsappNumber: form.whatsappNumber.trim() || null,
        tags: form.tags.trim() || null,
        attributes: form.attributes.trim() || "{}",
        stock: parseInt(form.stock) || 0,
        lowStockThreshold: parseInt(form.lowStockThreshold) || 10,
        relatedProductIds: JSON.stringify(selectedRelatedIds),
    };

    saveMutation.mutate({ id: editingProduct?.id, data: payload });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

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

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id);
  };

  const handlePermanentDelete = () => {
    if (permanentDeleteId) permanentDeleteMutation.mutate(permanentDeleteId);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await adminFetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const currentImages = form.images
          ? form.images
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        currentImages.push(data.url);
        setForm((prev) => ({
          ...prev,
          images: currentImages.join(", "),
        }));
        toast.success("Image uploaded");
      } else {
        toast.error("Failed to upload image");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const formatPrice = (price: number) => {
    return libFormatPrice(price, currency);
  };

  const getStockBadge = (stock: number, threshold: number) => {
    if (stock <= 0) {
      return (
        <Badge
          variant="secondary"
          className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
        >
          Out of stock
        </Badge>
      );
    }
    if (stock <= threshold) {
      return (
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        >
          Low ({stock})
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      >
        {stock}
      </Badge>
    );
  };

  const handleCSVImport = async (file: File) => {
    if (!file) return;
    setImporting(true);
    setShowImportDialog(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (importPlatform !== "auto") {
        formData.append("platform", importPlatform);
      }
      const res = await adminFetch("/api/products/import", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const platformLabel =
          data.platform === "woocommerce"
            ? "WooCommerce"
            : data.platform === "shopify"
              ? "Shopify/Shopify"
              : "Native";
        toast.success(
          `Imported ${data.imported} product(s) from ${platformLabel} CSV`,
        );
        if (data.categoriesCreated > 0) {
          toast.info(`${data.categoriesCreated} categor(ies) auto-created`);
        }
        if (data.errors && data.errors.length > 0) {
          toast.warning(`${data.errors.length} error(s) — check console`);
          console.warn("CSV Import Errors:", data.errors);
        }
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      } else {
        const err = await res.json();
        toast.error(err.error || "Import failed");
      }
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleCSVExport = async () => {
    setExporting(true);
    try {
      const res = await adminFetch("/api/products/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `products-export-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Products exported");
      } else {
        toast.error("Export failed");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleInlineStockSave = (productId: string) => {
    const newStock = parseInt(inlineStock);
    if (isNaN(newStock) || newStock < 0) {
      toast.error("Enter a valid stock quantity");
      return;
    }
    inlineStockMutation.mutate({ id: productId, stock: newStock });
  };

  const startInlineStockEdit = (product: Product) => {
    setEditingStockId(product.id);
    setInlineStock(String(product.stock));
  };

  const handleRelatedSearch = useCallback(
    async (query: string) => {
      setRelatedSearch(query);
      if (!query || query.length < 2) {
        setRelatedResults([]);
        return;
      }
      try {
        const res = await adminFetch(
          `/api/products?all=true&search=${encodeURIComponent(query)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setRelatedResults(
            (data.products || []).filter(
              (p: Product) =>
                !selectedRelatedIds.includes(p.id) &&
                (!editingProduct || p.id !== editingProduct.id),
            ),
          );
        }
      } catch {
        // ignore
      }
    },
    [selectedRelatedIds, editingProduct],
  );

  const handleAddRelated = (product: Product) => {
    setSelectedRelatedIds((prev) => [...prev, product.id]);
    setRelatedResults((prev) => prev.filter((p) => p.id !== product.id));
    setRelatedSearch("");
  };

  const handleRemoveRelated = (id: string) => {
    setSelectedRelatedIds((prev) => prev.filter((x) => x !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground mt-1">
            Manage your product catalogue
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled={importing}
            onClick={() => setShowImportDialog(true)}
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            {importing ? "Importing..." : "Import CSV"}
          </Button>
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
            Add Product
          </Button>
        </div>
      </div>

      {/* Tabs: Active / Trash */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setSelectedIds([]);
        }}
      >
        <TabsList>
          <TabsTrigger value="active">
            <Package className="mr-2 h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="trashed">
            <Trash className="mr-2 h-4 w-4" />
            Trash
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {activeTab === "active" && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          variant="outline"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Trash Bulk Actions */}
      {activeTab === "trashed" && selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              disabled={bulkLoading}
              onClick={() => handleBulkAction("restore")}
            >
              <Undo2 className="mr-1.5 h-3.5 w-3.5" />
              Restore
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              disabled={bulkLoading}
              onClick={() => handleBulkAction("permanent-delete")}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Permanent Delete
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Actions Toolbar (Active tab) */}
      {activeTab === "active" && selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("publish")}
              disabled={bulkLoading}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("unpublish")}
              disabled={bulkLoading}
            >
              <EyeOff className="mr-1.5 h-3.5 w-3.5" />
              Unpublish
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

      {/* Products Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No products found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm || categoryFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first product to get started"}
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
                        products.length > 0 &&
                        selectedIds.length === products.length
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Wholesale
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Featured
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const firstImg = getFirstImageUrl(product);
                  return (
                    <TableRow
                      key={product.id}
                      className={
                        selectedIds.includes(product.id) ? "bg-muted/50" : ""
                      }
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(product.id)}
                          onCheckedChange={() => handleSelectOne(product.id)}
                          aria-label={`Select ${product.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        {firstImg ? (
                          <img
                            src={firstImg}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover bg-muted"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            /{product.slug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">
                          {product.Category?.name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatPrice(product.price)}
                          </span>
                          {product.comparePrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.comparePrice)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {product.wholesalePrice ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-amber-700 dark:text-amber-400">
                              {formatPrice(product.wholesalePrice)}
                            </span>
                            {product.minOrderQty > 1 && (
                              <span className="text-xs text-muted-foreground">
                                MOQ: {product.minOrderQty}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingStockId === product.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min="0"
                              value={inlineStock}
                              onChange={(e) => setInlineStock(e.target.value)}
                              className="h-7 w-20 text-xs"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleInlineStockSave(product.id);
                                if (e.key === "Escape") setEditingStockId(null);
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => handleInlineStockSave(product.id)}
                            >
                              <Check className="h-3 w-3 text-emerald-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => setEditingStockId(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startInlineStockEdit(product)}
                            className="hover:opacity-80 transition-opacity"
                          >
                            {getStockBadge(
                              product.stock,
                              product.lowStockThreshold,
                            )}
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            product.isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                          }
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {product.isFeatured ? (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          >
                            <Star className="mr-1 h-3 w-3" />
                            Featured
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {activeTab === "trashed" ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleRestore(product.id)}
                                title="Restore"
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                onClick={() => setPermanentDeleteId(product.id)}
                                title="Permanent Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenEdit(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                onClick={() => setDeleteId(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditTab("general");
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <Tabs value={editTab} onValueChange={setEditTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="related">Related</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <ScrollArea className="max-h-[calc(90vh-140px)] pr-4">
            {(!editingProduct || editTab === "general") && (
              <div className="grid gap-4 py-4">
                {/* Name & Slug */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prod-name">
                      Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="prod-name"
                      placeholder="Product name"
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-slug">Slug</Label>
                    <Input
                      id="prod-slug"
                      placeholder="product-slug"
                      value={form.slug}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, slug: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description</Label>
                  <WysiwygEditor
                    value={form.description}
                    onChange={(val) =>
                      setForm((prev) => ({ ...prev, description: val }))
                    }
                    placeholder="Full product description..."
                  />
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                  <Label htmlFor="prod-short-desc">Short Description</Label>
                  <Textarea
                    id="prod-short-desc"
                    placeholder="Brief product summary"
                    value={form.shortDescription}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        shortDescription: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>

                {/* Price */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prod-price">
                      Price <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="prod-price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-compare">Compare Price</Label>
                    <Input
                      id="prod-compare"
                      type="number"
                      step="0.01"
                      placeholder="0.00 (optional)"
                      value={form.comparePrice}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          comparePrice: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* B2B Section (Collapsible) */}
                <Collapsible open={b2bOpen} onOpenChange={setB2bOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        B2B / Wholesale Settings
                        {(form.wholesalePrice ||
                          parseInt(form.minOrderQty) > 1) && (
                          <span className="text-xs text-emerald-600 font-normal">
                            (configured)
                          </span>
                        )}
                      </span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-3">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="prod-whatsapp">WhatsApp Number</Label>
                        <Input
                          id="prod-whatsapp"
                          type="tel"
                          placeholder="+1234567890"
                          value={form.whatsappNumber}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              whatsappNumber: e.target.value,
                            }))
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          WhatsApp number for product inquiries
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prod-wholesale">Wholesale Price</Label>
                        <Input
                          id="prod-wholesale"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={form.wholesalePrice}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              wholesalePrice: e.target.value,
                            }))
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave empty to hide wholesale pricing
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prod-moq">Min Order Quantity</Label>
                        <Input
                          id="prod-moq"
                          type="number"
                          min="1"
                          placeholder="1"
                          value={form.minOrderQty}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              minOrderQty: e.target.value,
                            }))
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Minimum units per order
                        </p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prod-tags">Tags (comma separated)</Label>
                    <Input id="prod-tags" placeholder="new, summer, popular" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-attrs">Attributes (JSON)</Label>
                    <Input id="prod-attrs" placeholder='{"Material": "Wood"}' value={form.attributes} onChange={(e) => setForm({ ...form, attributes: e.target.value })} />
                  </div>
                </div>

                {/* SKU & Barcode & Category */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prod-sku">SKU</Label>
                    <Input
                      id="prod-sku"
                      placeholder="SKU-001"
                      value={form.sku}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, sku: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-barcode">Barcode</Label>
                    <Input
                      id="prod-barcode"
                      placeholder="123456789"
                      value={form.barcode}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, barcode: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={form.categoryId}
                      onValueChange={(val) =>
                        setForm((prev) => ({ ...prev, categoryId: val }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Label htmlFor="prod-images">Image URLs</Label>
                  <Textarea
                    id="prod-images"
                    placeholder="Comma-separated image URLs"
                    value={form.images}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, images: e.target.value }))
                    }
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        asChild
                      >
                        <span>
                          <Upload className="mr-2 h-3.5 w-3.5" />
                          {uploading ? "Uploading..." : "Upload Image"}
                        </span>
                      </Button>
                    </label>
                    {form.images && (
                      <span className="text-xs text-muted-foreground">
                        {parseImages(form.images).length} image(s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Image Previews */}
                {form.images && parseImages(form.images).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {parseImages(form.images).map((url, i) => (
                      <div key={i} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${i + 1}`}
                          className="h-16 w-16 rounded-md object-cover bg-muted"
                        />
                        <button
                          type="button"
                          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white text-xs"
                          onClick={() => {
                            const imgs = parseImages(form.images).filter(
                              (_, idx) => idx !== i,
                            );
                            setForm((prev) => ({
                              ...prev,
                              images: imgs.join(", "),
                            }));
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sort Order */}
                <div className="space-y-2">
                  <Label htmlFor="prod-sort">Sort Order</Label>
                  <Input
                    id="prod-sort"
                    type="number"
                    placeholder="0"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sortOrder: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="prod-video">Video URL</Label>
                        <Input id="prod-video" placeholder="YouTube/Vimeo link" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="prod-download">Download URL (Digital)</Label>
                        <Input id="prod-download" placeholder="External link to file" value={form.downloadUrl} onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })} />
                    </div>
                </div>

                {/* Switches */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.isFeatured}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, isFeatured: checked }))
                      }
                    />
                    <Label
                      className="cursor-pointer"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          isFeatured: !prev.isFeatured,
                        }))
                      }
                    >
                      Featured
                    </Label>
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
                        setForm((prev) => ({
                          ...prev,
                          isActive: !prev.isActive,
                        }))
                      }
                    >
                      Active
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.isBestSeller}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, isBestSeller: checked }))
                      }
                    />
                    <Label>Best Seller</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.isDigital}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, isDigital: checked }))
                      }
                    />
                    <Label>Digital Product</Label>
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-2">
                  <Label htmlFor="prod-specs">Specifications (JSON)</Label>
                  <Textarea
                    id="prod-specs"
                    placeholder='{"Color": "Red", "Size": "L", "Material": "Cotton"}'
                    value={form.specifications}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        specifications: e.target.value,
                      }))
                    }
                    rows={3}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter valid JSON with key-value pairs for product
                    specifications
                  </p>
                </div>

                <Separator />

                {/* Stock & Low Stock Threshold */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prod-stock">Stock</Label>
                    <Input
                      id="prod-stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.stock}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, stock: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-low-threshold">
                      Low Stock Threshold
                    </Label>
                    <Input
                      id="prod-low-threshold"
                      type="number"
                      min="0"
                      placeholder="10"
                      value={form.lowStockThreshold}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          lowStockThreshold: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Stock at or below this shows "Low" warning
                    </p>
                  </div>
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
                      <Label htmlFor="prod-meta-title">Meta Title</Label>
                      <Input
                        id="prod-meta-title"
                        placeholder="Product Name | Store Name"
                        value={form.metaTitle}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            metaTitle: e.target.value,
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty to use: Product Name | Purva Bites
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="prod-meta-desc"
                        className="flex items-center justify-between"
                      >
                        <span>Meta Description</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {form.metaDescription.length}/160
                        </span>
                      </Label>
                      <Textarea
                        id="prod-meta-desc"
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
                      <Label htmlFor="prod-og-image">OG Image URL</Label>
                      <Input
                        id="prod-og-image"
                        placeholder="https://example.com/og-image.jpg"
                        value={form.ogImage}
                        onChange={(e) =>
                          setForm(prev => ({ ...prev, ogImage: e.target.value }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Image shown when this product is shared on social media (recommended 1200×630px)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prod-custom-schema">Custom JSON-LD Schema (optional)</Label>
                      <Textarea
                        id="prod-custom-schema"
                        placeholder='{"@type": "Product", ...}'
                        value={form.customSchema}
                        onChange={(e) =>
                          setForm(prev => ({ ...prev, customSchema: e.target.value }))
                        }
                        rows={3}
                        className="font-mono text-xs"
                      />
                      <p className="text-xs text-muted-foreground">
                        Override or extend the default Product schema. Must be valid JSON.
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Variants Tab */}
            {editingProduct && editTab === "variants" && (
              <div className="py-4">
                <AdminProductVariants
                  productId={editingProduct.id}
                  lowStockThreshold={parseInt(form.lowStockThreshold) || 10}
                />
              </div>
            )}

            {/* Related Products Tab */}
            {editingProduct && editTab === "related" && (
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>Related Products</Label>
                  <p className="text-xs text-muted-foreground">
                    Search and add products that are related to this one.
                  </p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={relatedSearch}
                    onChange={(e) => handleRelatedSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {relatedResults.length > 0 && (
                  <div className="rounded-md border max-h-40 overflow-y-auto">
                    {relatedResults.map((rp) => (
                      <button
                        key={rp.id}
                        type="button"
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 text-left transition-colors border-b last:border-b-0"
                        onClick={() => handleAddRelated(rp)}
                      >
                        {getFirstImageUrl(rp) ? (
                          <img
                            src={getFirstImageUrl(rp)}
                            alt={rp.name}
                            className="h-8 w-8 rounded object-cover bg-muted"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                            <ImageIcon className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {rp.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rp.Category?.name || "Uncategorized"}
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
                {selectedRelatedIds.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">
                      Selected ({selectedRelatedIds.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedRelatedIds.map((rid) => (
                        <Badge
                          key={rid}
                          variant="secondary"
                          className="pl-2 pr-1 gap-1"
                        >
                          <span className="max-w-[150px] truncate">
                            {products.find((p) => p.id === rid)?.name ||
                              rid.substring(0, 8)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRelated(rid)}
                            className="hover:text-rose-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}


          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? "Saving..."
                : editingProduct
                  ? "Update Product"
                  : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog
        open={bulkAction === "delete"}
        onOpenChange={() => setBulkAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.length} Product(s)
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected
              product(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {bulkMutation.isPending ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move this product to trash? You can
              restore it later from the Trash tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleteMutation.isPending ? "Moving..." : "Move to Trash"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CSV Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Products from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>CSV Platform Format</Label>
              <Select value={importPlatform} onValueChange={setImportPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto Detect</SelectItem>
                  <SelectItem value="native">Native Format</SelectItem>
                  <SelectItem value="woocommerce">WooCommerce</SelectItem>
                  <SelectItem value="shopify">Shopify / Shopofy</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {importPlatform === "auto" &&
                  "Detect format automatically from CSV headers."}
                {importPlatform === "native" &&
                  "Headers: name, price, slug, description, sku, categoryId, stock, etc."}
                {importPlatform === "woocommerce" &&
                  "Headers: post_title, regular_price, post_name, sku, tax:product_cat, images, stock, etc."}
                {importPlatform === "shopify" &&
                  "Headers: Title, Handle, Body (HTML), Variant Price, Variant SKU, Image Src, Type, etc. Rows with same Handle are merged."}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Select CSV File</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCSVImport(file);
                  e.target.value = "";
                }}
                disabled={importing}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Confirmation */}
      <AlertDialog
        open={!!permanentDeleteId}
        onOpenChange={() => setPermanentDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This product and all its associated
              data will be permanently removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              disabled={permanentDeleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {permanentDeleteMutation.isPending ? "Deleting..." : "Permanent Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
