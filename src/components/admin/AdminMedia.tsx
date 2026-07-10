"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  Search,
  Trash2,
  Image as ImageIcon,
  Copy,
  Check,
  MoreVertical,
  X,
  ChevronLeft,
  ChevronRight,
  FileImage,
  ZoomIn,
  Edit3,
  FolderOpen,
  FolderPlus,
  Folder,
  Move,
  Grid3X3,
  List,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin-fetch";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  url: string;
  thumbnails: string;
  alt: string | null;
  folder: string;
  createdAt: string;
}

interface MediaResponse {
  media: MediaItem[];
  total: number;
  page: number;
  limit: number;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getThumbnailUrl(item: MediaItem): string {
  try {
    const thumbs = JSON.parse(item.thumbnails);
    return thumbs.thumbnail || thumbs.small || item.url;
  } catch {
    return item.url;
  }
}

function getMediumUrl(item: MediaItem): string {
  try {
    const thumbs = JSON.parse(item.thumbnails);
    return thumbs.medium || item.url;
  } catch {
    return item.url;
  }
}

export function AdminMedia({ onSelect }: { onSelect?: (url: string) => void }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<MediaItem | null>(
    null,
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editAltOpen, setEditAltOpen] = useState(false);
  const [editAlt, setEditAlt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const limit = 30;

  // Folder state
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveFileId, setMoveFileId] = useState<string | null>(null);
  const [moveTargetFolder, setMoveTargetFolder] = useState("");

  const { data: mediaData, isLoading: loading } = useQuery({
    queryKey: ["admin-media", page, search, activeFolder],
    queryFn: async () => {
        const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
        });
        if (search) params.set("search", search);
        if (activeFolder) params.set("folder", activeFolder);
        const res = await adminFetch(`/api/media?${params}`);
        if (!res.ok) throw new Error("Failed");
        return await res.json();
    }
  });

  const media = mediaData?.media || [];
  const total = mediaData?.total || 0;

  const { data: folders = [] } = useQuery({
    queryKey: ["admin-media-folders"],
    queryFn: async () => {
        const res = await adminFetch("/api/media/folders");
        const data = await res.json();
        return data.folders || [];
    }
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSelectFolder = (folder: string | null) => {
    setActiveFolder(folder);
    setPage(1);
  };

  const createFolderMutation = useMutation({
    mutationFn: async (folder: string) => {
        const res = await adminFetch("/api/media/folders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder }),
        });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("Folder created");
        setCreateFolderOpen(false);
        setNewFolderName("");
        queryClient.invalidateQueries({ queryKey: ["admin-media-folders"] });
    }
  });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const folderPath = newFolderName.trim().startsWith("/")
      ? newFolderName.trim()
      : `/${newFolderName.trim()}`;
    createFolderMutation.mutate(folderPath);
  };

  const moveMutation = useMutation({
    mutationFn: async ({ id, folder }: { id: string, folder: string }) => {
        const res = await adminFetch("/api/media", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, folder }),
        });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("File moved");
        setMoveDialogOpen(false);
        setMoveFileId(null);
        queryClient.invalidateQueries({ queryKey: ["admin-media"] });
        queryClient.invalidateQueries({ queryKey: ["admin-media-folders"] });
    }
  });

  const handleMoveFile = () => {
    if (moveFileId && moveTargetFolder) {
        moveMutation.mutate({ id: moveFileId, folder: moveTargetFolder });
    }
  };

  const totalPages = Math.ceil(total / limit);

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
        const formData = new FormData();
        Array.from(files).forEach((f) => formData.append("files", f));
        const res = await adminFetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Failed");
        return await res.json();
    },
    onSuccess: (data) => {
        const successCount = data.files.filter((f: any) => !f.error).length;
        if (successCount > 0) toast.success(`${successCount} file(s) uploaded`);
        queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    }
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
        uploadMutation.mutate(e.target.files);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
        const res = await adminFetch(`/api/media/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("Deleted");
        queryClient.invalidateQueries({ queryKey: ["admin-media"] });
        setDeleteConfirmItem(null);
        setSelectedItem(null);
        setPreviewOpen(false);
    }
  });

  const handleDelete = (item: MediaItem) => {
    deleteMutation.mutate(item.id);
  };

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      toast.success("URL copied");
      setTimeout(() => setCopiedId(null), 2000);
      if (onSelect) onSelect(fullUrl);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const altMutation = useMutation({
    mutationFn: async ({ id, alt }: { id: string, alt: string }) => {
        const res = await adminFetch("/api/media", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, alt }),
        });
        if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
        toast.success("Alt text updated");
        setEditAltOpen(false);
        queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    }
  });

  const handleUpdateAlt = () => {
    if (selectedItem) {
        altMutation.mutate({ id: selectedItem.id, alt: editAlt });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && fileInputRef.current) {
      const dt = new DataTransfer();
      Array.from(files).forEach((f) => dt.items.add(f));
      fileInputRef.current.files = dt.files;
      fileInputRef.current.dispatchEvent(
        new Event("change", { bubbles: true }),
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileImage className="h-6 w-6" />
            Media Library
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {total} file{total !== 1 ? "s" : ""} total
            {activeFolder && (
              <Badge variant="outline" className="ml-2">
                {activeFolder}
              </Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateFolderOpen(true)}
            className="gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {/* Folder Sidebar + Content */}
      <div className="flex gap-4">
        {/* Folder sidebar */}
        <div className="w-48 shrink-0 hidden md:block">
          <div className="sticky top-0 space-y-1">
            <button
              onClick={() => handleSelectFolder(null)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                !activeFolder
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              All Files
            </button>
            {folders.map((folder) => (
              <button
                key={folder}
                onClick={() => handleSelectFolder(folder)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeFolder === folder
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Folder className="h-4 w-4" />
                <span className="truncate">
                  {folder.replace(/^\//, "") || "/"}
                </span>
              </button>
            ))}
            {folders.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No folders yet
              </p>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => handleSearch("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Drop zone overlay hint */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="min-h-[400px]"
          >
            {loading ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                    : "space-y-2"
                }
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : media.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center border-2 border-dashed rounded-lg p-8">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No media files</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {search
                    ? "No files match your search."
                    : "Upload your first image or drag and drop files here."}
                </p>
                {!search && (
                  <Button
                    variant="outline"
                    className="mt-4 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Files
                  </Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {media.map((item) => (
                  <Card
                    key={item.id}
                    className="group relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => handleCopyUrl(item.url, item.id)}
                  >
                    <div className="aspect-square relative bg-muted">
                      <img
                        src={getThumbnailUrl(item)}
                        alt={item.alt || item.originalName}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                              setPreviewOpen(true);
                            }}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyUrl(item.url, item.id);
                            }}
                          >
                            {copiedId === item.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 text-white"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedItem(item);
                                  setEditAlt(item.alt || "");
                                  setEditAltOpen(true);
                                }}
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Alt Text
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setMoveFileId(item.id);
                                  setMoveTargetFolder(item.folder || "/");
                                  setMoveDialogOpen(true);
                                }}
                              >
                                <Move className="h-4 w-4 mr-2" />
                                Move to Folder
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCopyUrl(item.url, item.id)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy URL
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteConfirmItem(item)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {/* Copied badge */}
                      {copiedId === item.id && (
                        <Badge className="absolute top-2 left-2 text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Copied
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <p
                        className="text-xs font-medium truncate"
                        title={item.originalName}
                      >
                        {item.originalName}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatFileSize(item.size)}
                        {item.width &&
                          item.height &&
                          ` · ${item.width}×${item.height}`}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-2">
                {media.map((item) => (
                  <Card
                    key={item.id}
                    className="group hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                    onClick={() => handleCopyUrl(item.url, item.id)}
                  >
                    <CardContent className="p-3 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={getThumbnailUrl(item)}
                          alt={item.alt || item.originalName}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.originalName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(item.size)}
                          {item.width &&
                            item.height &&
                            ` · ${item.width}×${item.height}`}
                          {item.alt && ` · Alt: ${item.alt}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setPreviewOpen(true);
                          }}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(item.url, item.id);
                          }}
                        >
                          {copiedId === item.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} items)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-9 h-9 p-0"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.originalName}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-muted flex items-center justify-center max-h-[60vh]">
                <img
                  src={getMediumUrl(selectedItem)}
                  alt={selectedItem.alt || selectedItem.originalName}
                  className="object-contain max-w-full max-h-[60vh]"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">
                    {formatFileSize(selectedItem.size)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dimensions</p>
                  <p className="font-medium">
                    {selectedItem.width && selectedItem.height
                      ? `${selectedItem.width} × ${selectedItem.height}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">
                    {selectedItem.mimeType.split("/")[1]?.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium">
                    {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {selectedItem.alt && (
                <div>
                  <p className="text-muted-foreground text-sm">Alt Text</p>
                  <p className="font-medium text-sm">{selectedItem.alt}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={() =>
                    handleCopyUrl(selectedItem.url, selectedItem.id)
                  }
                >
                  {copiedId === selectedItem.id ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy URL
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    setEditAlt(selectedItem.alt || "");
                    setEditAltOpen(true);
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Alt
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => {
                    handleDelete(selectedItem);
                    setPreviewOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Alt Dialog */}
      <Dialog open={editAltOpen} onOpenChange={setEditAltOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Alt Text</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter alt text for accessibility..."
              value={editAlt}
              onChange={(e) => setEditAlt(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditAltOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAlt}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="/folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <p className="text-xs text-muted-foreground">
              Folder paths start with &quot;/&quot;. e.g., /products, /blog
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateFolderOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || createFolderMutation.isPending}
              >
                Create
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move to Folder Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <button
                onClick={() => setMoveTargetFolder("/")}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  moveTargetFolder === "/"
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                Root (/)
              </button>
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => setMoveTargetFolder(folder)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    moveTargetFolder === folder
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Folder className="h-4 w-4" />
                  {folder}
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setMoveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleMoveFile} disabled={!moveTargetFolder || moveMutation.isPending}>
                Move
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmItem}
        onOpenChange={() => setDeleteConfirmItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirmItem && handleDelete(deleteConfirmItem)
              }
              className="bg-rose-600 hover:bg-rose-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
