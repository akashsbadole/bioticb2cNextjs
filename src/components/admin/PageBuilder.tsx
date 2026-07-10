"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensorOptions,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Image,
  LayoutGrid,
  MousePointerClick,
  Quote,
  Images,
  Type,
  MoveVertical,
  Minus,
  Package,
  HelpCircle,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  Copy,
  FileCode,
  Settings2,
  Home,
  User,
  Factory,
  Phone,
  FormInput,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaPickerField } from "@/components/admin/MediaPickerField";
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
import dynamic from "next/dynamic";
import type { PageBlock, BlockType } from "@/lib/page-blocks";
import {
  BLOCK_DEFAULTS,
  createBlock,
  normalizeBlockData,
  parseJsonPayload,
} from "@/lib/page-blocks";

const PreviewRenderer = dynamic(
  () =>
    import("@/components/store/PageBlockRenderer").then((m) => ({
      default: m.PageBlockRenderer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] rounded-md border border-input bg-muted/30 animate-pulse" />
    ),
  },
);

const BLOCK_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  // Essential reusable blocks
  hero: Image,
  text: Type,
  "image-gallery": Images,
  features: LayoutGrid,
  cta: MousePointerClick,
  testimonials: Quote,
  spacer: MoveVertical,
  divider: Minus,
  products: Package,
  "lead-capture": FormInput,
  faq: HelpCircle,

  // Page content blocks (fully customizable)
  "homepage-content": Home,
  "about-page-content": User,
  "manufacturing-content": Factory,
  "contact-page-content": Phone,
  "products-page-content": Package,
};

const PAGE_CONTENT_BLOCK_TYPES = new Set<BlockType>([
  "homepage-content",
  "about-page-content",
  "manufacturing-content",
  "contact-page-content",
  "products-page-content",
]);

function getTopLevelKeys(data: Record<string, unknown>): string[] {
  return Object.keys(data).sort();
}

function formatTopLevelKeys(data: Record<string, unknown>): string {
  const keys = getTopLevelKeys(data);
  if (keys.length === 0) return "No top-level fields";
  return keys.slice(0, 6).join(", ") + (keys.length > 6 ? ", ..." : "");
}

interface PageBuilderProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
  onNavigate?: (page: string, data?: unknown) => void;
}

// Sortable block card
function SortableBlockCard({
  block,
  index,
  total,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: {
  block: PageBlock;
  index: number;
  total: number;
  onEdit: (block: PageBlock) => void;
  onDelete: (block: PageBlock) => void;
  onDuplicate: (block: PageBlock) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = BLOCK_ICONS[block.type] || Type;
  const defaults = BLOCK_DEFAULTS[block.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-stretch gap-2 rounded-lg border bg-card p-3 shadow-sm"
    >
      {/* Drag Handle */}
      <div
        className="flex items-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Block Info */}
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {defaults?.label || block.type}
          </p>
          <p className="text-xs text-muted-foreground">#{index + 1}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onMoveDown(index)}
          disabled={index === total - 1}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onDuplicate(block)}
          title="Duplicate Block"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onEdit(block)}
          title="Edit Block"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          onClick={() => onDelete(block)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Block edit dialog
function BlockEditDialog({
  block,
  open,
  onClose,
  onSave,
}: {
  block: PageBlock | null;
  open: boolean;
  onClose: () => void;
  onSave: (block: PageBlock) => void;
}) {
  const [localData, setLocalData] = useState<Record<string, unknown>>({});
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [activeTab, setActiveTab] = useState("ui");

  // Sync local state when block changes
  useEffect(() => {
    if (open && block) {
      // Ensure block data is properly normalized before setting localData
      const normalizedData = normalizeBlockData(block.data || {});
      setLocalData(normalizedData);
      setJsonText(JSON.stringify(normalizedData, null, 2));
      setJsonError(null);
    }
  }, [block, open]);

  const handleSave = () => {
    if (!block) return;
    if (activeTab === "json") {
      try {
        const parsed = parseJsonPayload(jsonText);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          setJsonError("Block data must be a JSON object");
          return;
        }
        onSave({ ...block, data: parsed as Record<string, unknown> });
      } catch (e) {
        setJsonError((e as Error).message);
        return;
      }
    } else {
      onSave({ ...block, data: { ...localData } });
    }
  };

  const updateField = (key: string, value: unknown) => {
    const newData = { ...localData, [key]: value };
    setLocalData(newData);
    // Don't update jsonText here to avoid cursor jumping in JSON editor if it were ever synced both ways
    // Actually, jsonText is used by the JSON tab, and localData by UI tab.
    // We should keep them somewhat in sync if we switch tabs.
    setJsonText(JSON.stringify(newData, null, 2));
  };

  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = parseJsonPayload(val);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        setLocalData(parsed as Record<string, unknown>);
        setJsonError(null);
      } else {
        setJsonError("Block data must be a JSON object");
      }
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  if (!block) return null;

  const defaults = BLOCK_DEFAULTS[block.type];
  const isPageContentBlock = PAGE_CONTENT_BLOCK_TYPES.has(block.type);
  const topLevelKeys = getTopLevelKeys(localData);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Edit {defaults?.label || block.type}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="px-6 border-b">
            <TabsList className="grid w-full grid-cols-2 mt-2">
              <TabsTrigger value="ui" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                UI Editor
              </TabsTrigger>
              <TabsTrigger value="json" className="flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                JSON Editor
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ui" className="flex-1 min-h-0 m-0">
            <ScrollArea className="h-[calc(90vh-220px)] px-6">
              {isPageContentBlock && (
                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-medium">Full page payload</p>
                  <p className="mt-1 text-xs text-amber-700">
                    This block stores nested CMS fields. Use the JSON Editor tab
                    to update fields such as: {formatTopLevelKeys(localData)}.
                  </p>
                  {topLevelKeys.length > 0 && (
                    <p className="mt-2 text-xs text-amber-700">
                      Top-level fields ({topLevelKeys.length}):{" "}
                      {topLevelKeys.slice(0, 6).join(", ")}
                      {topLevelKeys.length > 6 &&
                        ` and ${topLevelKeys.length - 6} more`}
                    </p>
                  )}
                </div>
              )}
              <div className="grid gap-4 py-4">
                {/* Common fields based on block type */}
                {block.type === "hero" && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input
                        value={(localData.subtitle as string) || ""}
                        onChange={(e) =>
                          updateField("subtitle", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Button Text</Label>
                        <Input
                          value={(localData.buttonText as string) || ""}
                          onChange={(e) =>
                            updateField("buttonText", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button Link</Label>
                        <Input
                          value={(localData.buttonLink as string) || ""}
                          onChange={(e) =>
                            updateField("buttonLink", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <MediaPickerField
                      label="Background Image"
                      value={(localData.backgroundImage as string) || ""}
                      onChange={(v) => updateField("backgroundImage", v)}
                      placeholder="Image URL"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Height</Label>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                          value={(localData.height as string) || "medium"}
                          onChange={(e) =>
                            updateField("height", e.target.value)
                          }
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Alignment</Label>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                          value={(localData.alignment as string) || "center"}
                          onChange={(e) =>
                            updateField("alignment", e.target.value)
                          }
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {block.type === "features" && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Columns</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                        value={(localData.columns as number) || 3}
                        onChange={(e) =>
                          updateField("columns", Number(e.target.value))
                        }
                      >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">Features</Label>
                    {(Array.isArray(localData.features)
                      ? localData.features
                      : Object.values(localData.features || {})
                    ).map((f: any, i: number) => (
                      <Card key={i} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Feature {i + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600"
                            onClick={() => {
                              const feats = [
                                ...(Array.isArray(localData.features)
                                  ? localData.features
                                  : Object.values(localData.features || {})),
                              ];
                              feats.splice(i, 1);
                              updateField("features", feats);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Title"
                          value={f.title}
                          onChange={(e) => {
                            const feats = [
                              ...(Array.isArray(localData.features)
                                ? (localData.features as Array<
                                    Record<string, string>
                                  >)
                                : Object.values(localData.features || {})),
                            ];
                            feats[i] = { ...feats[i], title: e.target.value };
                            updateField("features", feats);
                          }}
                        />
                        <Input
                          placeholder="Description"
                          value={f.description}
                          onChange={(e) => {
                            const feats = [
                              ...(Array.isArray(localData.features)
                                ? (localData.features as Array<
                                    Record<string, string>
                                  >)
                                : Object.values(localData.features || {})),
                            ];
                            feats[i] = {
                              ...feats[i],
                              description: e.target.value,
                            };
                            updateField("features", feats);
                          }}
                        />
                        <Input
                          placeholder="Icon name (e.g. Star, Heart)"
                          value={f.icon}
                          onChange={(e) => {
                            const feats = [
                              ...(Array.isArray(localData.features)
                                ? (localData.features as Array<
                                    Record<string, string>
                                  >)
                                : Object.values(localData.features || {})),
                            ];
                            feats[i] = { ...feats[i], icon: e.target.value };
                            updateField("features", feats);
                          }}
                        />
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const feats = [
                          ...(Array.isArray(localData.features)
                            ? (localData.features as Array<
                                Record<string, string>
                              >)
                            : Object.values(localData.features || {})),
                          {
                            title: "New Feature",
                            description: "",
                            icon: "Star",
                          },
                        ];
                        updateField("features", feats);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Feature
                    </Button>
                  </>
                )}

                {block.type === "cta" && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={(localData.description as string) || ""}
                        onChange={(e) =>
                          updateField("description", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Button Text</Label>
                        <Input
                          value={(localData.buttonText as string) || ""}
                          onChange={(e) =>
                            updateField("buttonText", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button Link</Label>
                        <Input
                          value={(localData.buttonLink as string) || ""}
                          onChange={(e) =>
                            updateField("buttonLink", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                        value={
                          (localData.backgroundColor as string) || "emerald"
                        }
                        onChange={(e) =>
                          updateField("backgroundColor", e.target.value)
                        }
                      >
                        <option value="emerald">Emerald</option>
                        <option value="rose">Rose</option>
                        <option value="amber">Amber</option>
                        <option value="slate">Slate</option>
                      </select>
                    </div>
                  </>
                )}

                {block.type === "testimonials" && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">
                      Testimonials
                    </Label>
                    {(
                      (localData.testimonials as Array<
                        Record<string, string>
                      >) || []
                    ).map((t, i) => (
                      <Card key={i} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Testimonial {i + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600"
                            onClick={() => {
                              const items = [
                                ...((localData.testimonials as Array<unknown>) ||
                                  []),
                              ];
                              items.splice(i, 1);
                              updateField("testimonials", items);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            placeholder="Name"
                            value={t.name}
                            onChange={(e) => {
                              const items = [
                                ...((localData.testimonials as Array<
                                  Record<string, string>
                                >) || []),
                              ];
                              items[i] = { ...items[i], name: e.target.value };
                              updateField("testimonials", items);
                            }}
                          />
                          <Input
                            placeholder="Role"
                            value={t.role}
                            onChange={(e) => {
                              const items = [
                                ...((localData.testimonials as Array<
                                  Record<string, string>
                                >) || []),
                              ];
                              items[i] = { ...items[i], role: e.target.value };
                              updateField("testimonials", items);
                            }}
                          />
                        </div>
                        <Textarea
                          placeholder="Quote"
                          rows={2}
                          value={t.quote}
                          onChange={(e) => {
                            const items = [
                              ...((localData.testimonials as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            items[i] = { ...items[i], quote: e.target.value };
                            updateField("testimonials", items);
                          }}
                        />
                        <MediaPickerField
                          label="Avatar (optional)"
                          value={t.avatar}
                          onChange={(v) => {
                            const items = [
                              ...((localData.testimonials as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            items[i] = { ...items[i], avatar: v };
                            updateField("testimonials", items);
                          }}
                          placeholder="Avatar URL"
                        />
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const items = [
                          ...((localData.testimonials as Array<
                            Record<string, string>
                          >) || []),
                          {
                            name: "Name",
                            role: "Role",
                            quote: "Quote",
                            avatar: "",
                          },
                        ];
                        updateField("testimonials", items);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Testimonial
                    </Button>
                  </>
                )}

                {block.type === "image-gallery" && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Columns</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                        value={(localData.columns as number) || 3}
                        onChange={(e) =>
                          updateField("columns", Number(e.target.value))
                        }
                      >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">Images</Label>
                    {((localData.images as string[]) || []).map((img, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="flex-1">
                          <MediaPickerField
                            value={img}
                            onChange={(v) => {
                              const imgs = [
                                ...((localData.images as string[]) || []),
                              ];
                              imgs[i] = v;
                              updateField("images", imgs);
                            }}
                            placeholder="Image URL"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-rose-600 mt-6"
                          onClick={() => {
                            const imgs = [
                              ...((localData.images as string[]) || []),
                            ];
                            imgs.splice(i, 1);
                            updateField("images", imgs);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const imgs = [
                          ...((localData.images as string[]) || []),
                          "",
                        ];
                        updateField("images", imgs);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Image
                    </Button>
                  </>
                )}

                {block.type === "text" && (
                  <div className="space-y-2">
                    <Label>HTML Content</Label>
                    <Textarea
                      rows={12}
                      value={(localData.content as string) || ""}
                      onChange={(e) => updateField("content", e.target.value)}
                      placeholder="Enter HTML content..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports HTML tags: &lt;p&gt;, &lt;h1&gt;-&lt;h6&gt;,
                      &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;,
                      &lt;a&gt;, etc.
                    </p>
                  </div>
                )}

                {block.type === "spacer" && (
                  <div className="space-y-2">
                    <Label>Height (px)</Label>
                    <Input
                      type="number"
                      min={8}
                      max={512}
                      value={(localData.height as number) || 64}
                      onChange={(e) =>
                        updateField("height", Number(e.target.value))
                      }
                    />
                  </div>
                )}

                {block.type === "divider" && (
                  <div className="space-y-2">
                    <Label>Style</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                      value={(localData.style as string) || "solid"}
                      onChange={(e) => updateField("style", e.target.value)}
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </div>
                )}

                {block.type === "products" && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Max Products</Label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={(localData.maxProducts as number) || 6}
                          onChange={(e) =>
                            updateField("maxProducts", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Layout</Label>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                          value={(localData.layout as string) || "grid"}
                          onChange={(e) =>
                            updateField("layout", e.target.value)
                          }
                        >
                          <option value="grid">Grid</option>
                          <option value="list">List</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {block.type === "faq" && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">FAQ Items</Label>
                    {(
                      (localData.items as Array<Record<string, string>>) || []
                    ).map((item, i) => (
                      <Card key={i} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Item {i + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600"
                            onClick={() => {
                              const items = [
                                ...((localData.items as Array<unknown>) || []),
                              ];
                              items.splice(i, 1);
                              updateField("items", items);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Question"
                          value={item.question}
                          onChange={(e) => {
                            const items = [
                              ...((localData.items as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            items[i] = {
                              ...items[i],
                              question: e.target.value,
                            };
                            updateField("items", items);
                          }}
                        />
                        <Textarea
                          placeholder="Answer"
                          rows={2}
                          value={item.answer}
                          onChange={(e) => {
                            const items = [
                              ...((localData.items as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            items[i] = { ...items[i], answer: e.target.value };
                            updateField("items", items);
                          }}
                        />
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const items = [
                          ...((localData.items as Array<
                            Record<string, string>
                          >) || []),
                          { question: "", answer: "" },
                        ];
                        updateField("items", items);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                  </>
                )}

                {block.type === "slider" && (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="slider-autoplay"
                          checked={!!localData.autoplay}
                          onCheckedChange={(val) =>
                            updateField("autoplay", !!val)
                          }
                        />
                        <Label htmlFor="slider-autoplay">Autoplay</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label>Interval (ms)</Label>
                        <Input
                          type="number"
                          className="w-24 h-8"
                          value={(localData.interval as number) || 5000}
                          onChange={(e) =>
                            updateField("interval", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">Slides</Label>
                    {(
                      (localData.items as Array<Record<string, string>>) || []
                    ).map((slide, i) => (
                      <Card key={i} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Slide {i + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600"
                            onClick={() => {
                              const slides = [
                                ...((localData.items as Array<unknown>) || []),
                              ];
                              slides.splice(i, 1);
                              updateField("items", slides);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <MediaPickerField
                          label="Image"
                          value={slide.image}
                          onChange={(v) => {
                            const slides = [
                              ...((localData.items as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            slides[i] = { ...slides[i], image: v };
                            updateField("items", slides);
                          }}
                          placeholder="Image URL"
                        />
                        <Input
                          placeholder="Title"
                          value={slide.title}
                          onChange={(e) => {
                            const slides = [
                              ...((localData.items as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            slides[i] = { ...slides[i], title: e.target.value };
                            updateField("items", slides);
                          }}
                        />
                        <Input
                          placeholder="Subtitle"
                          value={slide.subtitle}
                          onChange={(e) => {
                            const slides = [
                              ...((localData.items as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            slides[i] = {
                              ...slides[i],
                              subtitle: e.target.value,
                            };
                            updateField("items", slides);
                          }}
                        />
                        <Input
                          placeholder="Link (optional)"
                          value={slide.link}
                          onChange={(e) => {
                            const slides = [
                              ...((localData.items as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            slides[i] = { ...slides[i], link: e.target.value };
                            updateField("items", slides);
                          }}
                        />
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const slides = [
                          ...((localData.items as Array<
                            Record<string, string>
                          >) || []),
                          { image: "", title: "Slide", subtitle: "", link: "" },
                        ];
                        updateField("items", slides);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Slide
                    </Button>
                  </>
                )}

                {block.type === "product-carousel" && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Max Products</Label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={(localData.maxProducts as number) || 10}
                          onChange={(e) =>
                            updateField("maxProducts", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category ID (optional)</Label>
                        <Input
                          value={(localData.categoryId as string) || ""}
                          onChange={(e) =>
                            updateField("categoryId", e.target.value)
                          }
                          placeholder="Leave empty for featured"
                        />
                      </div>
                    </div>
                  </>
                )}

                {block.type === "about" && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content (HTML)</Label>
                      <Textarea
                        rows={6}
                        value={(localData.content as string) || ""}
                        onChange={(e) => updateField("content", e.target.value)}
                      />
                    </div>
                    <MediaPickerField
                      label="Image"
                      value={(localData.image as string) || ""}
                      onChange={(v) => updateField("image", v)}
                      placeholder="Image URL"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Image Position</Label>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                          value={(localData.imagePosition as string) || "left"}
                          onChange={(e) =>
                            updateField("imagePosition", e.target.value)
                          }
                        >
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Button Text</Label>
                        <Input
                          value={(localData.buttonText as string) || ""}
                          onChange={(e) =>
                            updateField("buttonText", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                {block.type === "trust-bar" && (
                  <>
                    <Label className="text-base font-semibold">
                      Statistics
                    </Label>
                    {(
                      (localData.stats as Array<{
                        value: number;
                        suffix: string;
                        label: string;
                      }>) || []
                    ).map((stat, i) => (
                      <Card key={i} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Stat {i + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600"
                            onClick={() => {
                              const arr = [
                                ...((localData.stats as Array<unknown>) || []),
                              ];
                              arr.splice(i, 1);
                              updateField("stats", arr);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Input
                            placeholder="Value (number)"
                            type="number"
                            value={stat.value}
                            onChange={(e) => {
                              const arr = [
                                ...((localData.stats as Array<
                                  Record<string, unknown>
                                >) || []),
                              ];
                              arr[i] = {
                                ...arr[i],
                                value: Number(e.target.value),
                              };
                              updateField("stats", arr);
                            }}
                          />
                          <Input
                            placeholder="Suffix (e.g. +)"
                            value={stat.suffix}
                            onChange={(e) => {
                              const arr = [
                                ...((localData.stats as Array<
                                  Record<string, unknown>
                                >) || []),
                              ];
                              arr[i] = { ...arr[i], suffix: e.target.value };
                              updateField("stats", arr);
                            }}
                          />
                          <Input
                            placeholder="Label"
                            value={stat.label}
                            onChange={(e) => {
                              const arr = [
                                ...((localData.stats as Array<
                                  Record<string, unknown>
                                >) || []),
                              ];
                              arr[i] = { ...arr[i], label: e.target.value };
                              updateField("stats", arr);
                            }}
                          />
                        </div>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const arr = [
                          ...((localData.stats as Array<unknown>) || []),
                          { value: 100, suffix: "+", label: "New stat" },
                        ];
                        updateField("stats", arr);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Stat
                    </Button>
                  </>
                )}

                {block.type === "audience-cards" && (
                  <>
                    <div className="space-y-2">
                      <Label>Section Label</Label>
                      <Input
                        value={(localData.label as string) || ""}
                        onChange={(e) => updateField("label", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input
                        value={(localData.heading as string) || ""}
                        onChange={(e) => updateField("heading", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={(localData.description as string) || ""}
                        onChange={(e) =>
                          updateField("description", e.target.value)
                        }
                      />
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">Cards</Label>
                    {(
                      (localData.cards as Array<{
                        title: string;
                        description: string;
                        cta: string;
                        link?: string;
                      }>) || []
                    ).map((card, i) => (
                      <Card key={i} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Card {i + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600"
                            onClick={() => {
                              const arr = [
                                ...((localData.cards as Array<unknown>) || []),
                              ];
                              arr.splice(i, 1);
                              updateField("cards", arr);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Title"
                          value={card.title}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.cards as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            arr[i] = { ...arr[i], title: e.target.value };
                            updateField("cards", arr);
                          }}
                        />
                        <Input
                          placeholder="Description"
                          value={card.description}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.cards as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            arr[i] = { ...arr[i], description: e.target.value };
                            updateField("cards", arr);
                          }}
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input
                            placeholder="CTA text"
                            value={card.cta}
                            onChange={(e) => {
                              const arr = [
                                ...((localData.cards as Array<
                                  Record<string, string>
                                >) || []),
                              ];
                              arr[i] = { ...arr[i], cta: e.target.value };
                              updateField("cards", arr);
                            }}
                          />
                          <Input
                            placeholder="CTA link"
                            value={card.link}
                            onChange={(e) => {
                              const arr = [
                                ...((localData.cards as Array<
                                  Record<string, string>
                                >) || []),
                              ];
                              arr[i] = { ...arr[i], link: e.target.value };
                              updateField("cards", arr);
                            }}
                          />
                        </div>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const arr = [
                          ...((localData.cards as Array<unknown>) || []),
                          {
                            title: "New",
                            description: "",
                            cta: "Enquire",
                            link: "/contact",
                          },
                        ];
                        updateField("cards", arr);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Card
                    </Button>
                  </>
                )}

                {block.type === "capabilities" && (
                  <>
                    <div className="space-y-2">
                      <Label>Section Label</Label>
                      <Input
                        value={(localData.label as string) || ""}
                        onChange={(e) => updateField("label", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input
                        value={(localData.heading as string) || ""}
                        onChange={(e) => updateField("heading", e.target.value)}
                      />
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">
                      Capability Items
                    </Label>
                    {((localData.items as string[]) || []).map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.items as string[]) || []),
                            ];
                            arr[i] = e.target.value;
                            updateField("items", arr);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-rose-600"
                          onClick={() => {
                            const arr = [
                              ...((localData.items as string[]) || []),
                            ];
                            arr.splice(i, 1);
                            updateField("items", arr);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const arr = [
                          ...((localData.items as string[]) || []),
                          "New capability",
                        ];
                        updateField("items", arr);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                    <Separator />
                    <Label className="text-base font-semibold">
                      Gallery Images (2×2 grid)
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map((i) => (
                        <MediaPickerField
                          key={i}
                          label={`Image ${i + 1}`}
                          value={((localData.galleryImages as string[]) || [])[i] || ""}
                          onChange={(v) => {
                            const arr = [...((localData.galleryImages as string[]) || ["", "", "", ""])];
                            arr[i] = v;
                            updateField("galleryImages", arr);
                          }}
                          placeholder="Select image"
                        />
                      ))}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <MediaPickerField
                        label="Single Image (fallback)"
                        value={(localData.image as string) || ""}
                        onChange={(v) => updateField("image", v)}
                        placeholder="Select or upload an image"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Video URL</Label>
                      <Input
                        value={(localData.videoUrl as string) || ""}
                        onChange={(e) =>
                          updateField("videoUrl", e.target.value)
                        }
                        placeholder="https://youtube.com/..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Video is shown when gallery images are empty
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Image Caption</Label>
                        <Input
                          value={(localData.imageCaption as string) || ""}
                          onChange={(e) =>
                            updateField("imageCaption", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA Text</Label>
                        <Input
                          value={(localData.ctaText as string) || ""}
                          onChange={(e) =>
                            updateField("ctaText", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>CTA Link</Label>
                      <Input
                        value={(localData.ctaLink as string) || ""}
                        onChange={(e) => updateField("ctaLink", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {block.type === "product-categories" && (
                  <>
                    <div className="space-y-2">
                      <Label>Section Label</Label>
                      <Input
                        value={(localData.label as string) || ""}
                        onChange={(e) => updateField("label", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input
                        value={(localData.heading as string) || ""}
                        onChange={(e) => updateField("heading", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={(localData.description as string) || ""}
                        onChange={(e) =>
                          updateField("description", e.target.value)
                        }
                      />
                    </div>
                    <Separator />
                    <CategoryPicker
                      selectedIds={
                        (localData.categoryIds as string[]) || []
                      }
                      onChange={(ids) => updateField("categoryIds", ids)}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>CTA Text</Label>
                        <Input
                          value={(localData.ctaText as string) || ""}
                          onChange={(e) =>
                            updateField("ctaText", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA Link</Label>
                        <Input
                          value={(localData.ctaLink as string) || ""}
                          onChange={(e) =>
                            updateField("ctaLink", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                {block.type === "factory-reel" && (
                  <>
                    <div className="space-y-2">
                      <Label>Section Label</Label>
                      <Input
                        value={(localData.label as string) || ""}
                        onChange={(e) => updateField("label", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input
                        value={(localData.heading as string) || ""}
                        onChange={(e) => updateField("heading", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={(localData.description as string) || ""}
                        onChange={(e) =>
                          updateField("description", e.target.value)
                        }
                      />
                    </div>
                    <MediaPickerField
                      label="Video Thumbnail"
                      value={(localData.thumbnailUrl as string) || ""}
                      onChange={(v) => updateField("thumbnailUrl", v)}
                      placeholder="Thumbnail URL"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Video URL</Label>
                        <Input
                          value={(localData.videoUrl as string) || ""}
                          onChange={(e) =>
                            updateField("videoUrl", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>CTA Text</Label>
                        <Input
                          value={(localData.ctaText as string) || ""}
                          onChange={(e) =>
                            updateField("ctaText", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA Link</Label>
                        <Input
                          value={(localData.ctaLink as string) || ""}
                          onChange={(e) =>
                            updateField("ctaLink", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                {block.type === "certifications" && (
                  <>
                    <div className="space-y-2">
                      <Label>Section Label</Label>
                      <Input
                        value={(localData.label as string) || ""}
                        onChange={(e) => updateField("label", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input
                        value={(localData.heading as string) || ""}
                        onChange={(e) => updateField("heading", e.target.value)}
                      />
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">
                      Certification Names
                    </Label>
                    {((localData.items as string[]) || []).map((cert, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={cert}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.items as string[]) || []),
                            ];
                            arr[i] = e.target.value;
                            updateField("items", arr);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-rose-600"
                          onClick={() => {
                            const arr = [
                              ...((localData.items as string[]) || []),
                            ];
                            arr.splice(i, 1);
                            updateField("items", arr);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const arr = [
                          ...((localData.items as string[]) || []),
                          "New cert",
                        ];
                        updateField("items", arr);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Certification
                    </Button>
                    <Separator />
                    <Label className="text-base font-semibold">
                      Logo Gallery (image + caption)
                    </Label>
                    {((localData.gallery as Array<{ image: string; caption: string }>) || []).map((item, i) => (
                      <div key={i} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Item {i + 1}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600"
                            onClick={() => {
                              const arr = [...((localData.gallery as Array<{ image: string; caption: string }>) || [])];
                              arr.splice(i, 1);
                              updateField("gallery", arr);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <MediaPickerField
                          label="Logo Image"
                          value={item.image || ""}
                          onChange={(v) => {
                            const arr = [...((localData.gallery as Array<{ image: string; caption: string }>) || [])];
                            arr[i] = { ...arr[i], image: v };
                            updateField("gallery", arr);
                          }}
                          placeholder="Select or upload image"
                        />
                        <Input
                          placeholder="Caption (e.g. ISO 9001:2015)"
                          value={item.caption || ""}
                          onChange={(e) => {
                            const arr = [...((localData.gallery as Array<{ image: string; caption: string }>) || [])];
                            arr[i] = { ...arr[i], caption: e.target.value };
                            updateField("gallery", arr);
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const arr = [...((localData.gallery as Array<{ image: string; caption: string }>) || []), { image: "", caption: "" }];
                        updateField("gallery", arr);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Logo
                    </Button>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>CTA Text</Label>
                        <Input
                          value={(localData.ctaText as string) || ""}
                          onChange={(e) =>
                            updateField("ctaText", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA Link</Label>
                        <Input
                          value={(localData.ctaLink as string) || ""}
                          onChange={(e) =>
                            updateField("ctaLink", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                {block.type === "lead-capture" && (
                  <>
                    <div className="space-y-2">
                      <Label>Section Label (small text above heading)</Label>
                      <Input
                        value={(localData.label as string) || ""}
                        onChange={(e) => updateField("label", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input
                        value={(localData.heading as string) || ""}
                        onChange={(e) => updateField("heading", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={(localData.description as string) || ""}
                        onChange={(e) =>
                          updateField("description", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Success Message</Label>
                      <Input
                        value={(localData.successMessage as string) || ""}
                        onChange={(e) =>
                          updateField("successMessage", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>API Endpoint</Label>
                      <Input
                        value={(localData.apiEndpoint as string) || ""}
                        onChange={(e) =>
                          updateField("apiEndpoint", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Submit Button Text</Label>
                      <Input
                        value={(localData.submitText as string) || ""}
                        onChange={(e) =>
                          updateField("submitText", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Disclaimer</Label>
                      <Input
                        value={(localData.disclaimer as string) || ""}
                        onChange={(e) =>
                          updateField("disclaimer", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="lead-message-field"
                        checked={!!localData.messageField}
                        onCheckedChange={(val) =>
                          updateField("messageField", !!val)
                        }
                      />
                      <Label htmlFor="lead-message-field">
                        Show Message Field
                      </Label>
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">
                      Form Fields
                    </Label>
                    {(
                      (localData.fields as Array<{
                        name: string;
                        label: string;
                        type: string;
                        required: boolean;
                        placeholder: string;
                        options?: string[];
                      }>) || []
                    ).map((field, i) => (
                      <Card key={i} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Field {i + 1}: {field.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600"
                            onClick={() => {
                              const fields = [
                                ...((localData.fields as Array<unknown>) || []),
                              ];
                              fields.splice(i, 1);
                              updateField("fields", fields);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase">
                              Name
                            </Label>
                            <Input
                              placeholder="name"
                              value={field.name}
                              onChange={(e) => {
                                const fields = [
                                  ...((localData.fields as Array<
                                    Record<string, unknown>
                                  >) || []),
                                ];
                                fields[i] = {
                                  ...fields[i],
                                  name: e.target.value,
                                };
                                updateField("fields", fields);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase">
                              Label
                            </Label>
                            <Input
                              placeholder="Label"
                              value={field.label}
                              onChange={(e) => {
                                const fields = [
                                  ...((localData.fields as Array<
                                    Record<string, unknown>
                                  >) || []),
                                ];
                                fields[i] = {
                                  ...fields[i],
                                  label: e.target.value,
                                };
                                updateField("fields", fields);
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase">
                              Type
                            </Label>
                            <select
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                              value={field.type}
                              onChange={(e) => {
                                const fields = [
                                  ...((localData.fields as Array<
                                    Record<string, unknown>
                                  >) || []),
                                ];
                                fields[i] = {
                                  ...fields[i],
                                  type: e.target.value,
                                };
                                updateField("fields", fields);
                              }}
                            >
                              <option value="text">Text</option>
                              <option value="email">Email</option>
                              <option value="tel">Phone</option>
                              <option value="select">Select</option>
                              <option value="textarea">Textarea</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2 pt-6">
                            <Checkbox
                              id={`field-req-${i}`}
                              checked={field.required}
                              onCheckedChange={(val) => {
                                const fields = [
                                  ...((localData.fields as Array<
                                    Record<string, unknown>
                                  >) || []),
                                ];
                                fields[i] = { ...fields[i], required: !!val };
                                updateField("fields", fields);
                              }}
                            />
                            <Label htmlFor={`field-req-${i}`}>Required</Label>
                          </div>
                        </div>
                        <Input
                          placeholder="Placeholder"
                          value={field.placeholder}
                          onChange={(e) => {
                            const fields = [
                              ...((localData.fields as Array<
                                Record<string, unknown>
                              >) || []),
                            ];
                            fields[i] = {
                              ...fields[i],
                              placeholder: e.target.value,
                            };
                            updateField("fields", fields);
                          }}
                        />
                        {field.type === "select" && (
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase">
                              Options (one per line)
                            </Label>
                            <Textarea
                              placeholder="Option 1&#10;Option 2"
                              value={(field.options || []).join("\n")}
                              onChange={(e) => {
                                const fields = [
                                  ...((localData.fields as Array<
                                    Record<string, unknown>
                                  >) || []),
                                ];
                                fields[i] = {
                                  ...fields[i],
                                  options: e.target.value
                                    .split("\n")
                                    .filter(Boolean),
                                };
                                updateField("fields", fields);
                              }}
                            />
                          </div>
                        )}
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const fields = [
                          ...((localData.fields as Array<
                            Record<string, unknown>
                          >) || []),
                          {
                            name: "new_field",
                            label: "New Field",
                            type: "text",
                            required: false,
                            placeholder: "",
                          },
                        ];
                        updateField("fields", fields);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Field
                    </Button>
                  </>
                )}

                {block.type === "leadership" && (
                  <>
                    <div className="space-y-2">
                      <Label>Section Label</Label>
                      <Input
                        value={(localData.label as string) || ""}
                        onChange={(e) => updateField("label", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input
                        value={(localData.heading as string) || ""}
                        onChange={(e) => updateField("heading", e.target.value)}
                      />
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">
                      Team Members
                    </Label>
                    {(
                      (localData.members as Array<{
                        name: string;
                        role: string;
                        bio: string;
                        image?: string;
                      }>) || []
                    ).map((member, i) => (
                      <Card key={i} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Member {i + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600"
                            onClick={() => {
                              const arr = [
                                ...((localData.members as Array<unknown>) ||
                                  []),
                              ];
                              arr.splice(i, 1);
                              updateField("members", arr);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <MediaPickerField
                          label="Photo"
                          value={member.image || ""}
                          onChange={(v) => {
                            const arr = [
                              ...((localData.members as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            arr[i] = { ...arr[i], image: v };
                            updateField("members", arr);
                          }}
                        />
                        <Input
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.members as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            arr[i] = { ...arr[i], name: e.target.value };
                            updateField("members", arr);
                          }}
                        />
                        <Input
                          placeholder="Role"
                          value={member.role}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.members as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            arr[i] = { ...arr[i], role: e.target.value };
                            updateField("members", arr);
                          }}
                        />
                        <Textarea
                          placeholder="Bio"
                          rows={2}
                          value={member.bio}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.members as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            arr[i] = { ...arr[i], bio: e.target.value };
                            updateField("members", arr);
                          }}
                        />
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const arr = [
                          ...((localData.members as Array<unknown>) || []),
                          { name: "Name", role: "Role", bio: "Bio" },
                        ];
                        updateField("members", arr);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Member
                    </Button>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>CTA Text</Label>
                        <Input
                          value={(localData.ctaText as string) || ""}
                          onChange={(e) =>
                            updateField("ctaText", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CTA Link</Label>
                        <Input
                          value={(localData.ctaLink as string) || ""}
                          onChange={(e) =>
                            updateField("ctaLink", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                {block.type === "partner-logos" && (
                  <>
                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input
                        value={(localData.heading as string) || ""}
                        onChange={(e) => updateField("heading", e.target.value)}
                      />
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">Logos</Label>
                    {((localData.logos as string[]) || []).map((logo, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="flex-1">
                          <MediaPickerField
                            value={logo}
                            onChange={(v) => {
                              const arr = [
                                ...((localData.logos as string[]) || []),
                              ];
                              arr[i] = v;
                              updateField("logos", arr);
                            }}
                            placeholder="Logo URL"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-rose-600 mt-6"
                          onClick={() => {
                            const arr = [
                              ...((localData.logos as string[]) || []),
                            ];
                            arr.splice(i, 1);
                            updateField("logos", arr);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const arr = [
                          ...((localData.logos as string[]) || []),
                          "",
                        ];
                        updateField("logos", arr);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Logo
                    </Button>

                    <Separator />
                    <Label className="text-base font-semibold">
                      Testimonials
                    </Label>
                    {(
                      (localData.testimonials as Array<{
                        quote: string;
                        author: string;
                      }>) || []
                    ).map((t, i) => (
                      <Card key={i} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Testimonial {i + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600"
                            onClick={() => {
                              const arr = [
                                ...((localData.testimonials as Array<unknown>) ||
                                  []),
                              ];
                              arr.splice(i, 1);
                              updateField("testimonials", arr);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Quote"
                          rows={2}
                          value={t.quote}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.testimonials as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            arr[i] = { ...arr[i], quote: e.target.value };
                            updateField("testimonials", arr);
                          }}
                        />
                        <Input
                          placeholder="Author"
                          value={t.author}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.testimonials as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            arr[i] = { ...arr[i], author: e.target.value };
                            updateField("testimonials", arr);
                          }}
                        />
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const arr = [
                          ...((localData.testimonials as Array<unknown>) || []),
                          { quote: "", author: "" },
                        ];
                        updateField("testimonials", arr);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                    </Button>
                  </>
                )}

                {block.type === "blog-grid" && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Posts</Label>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={(localData.maxPosts as number) || 6}
                        onChange={(e) =>
                          updateField("maxPosts", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Layout</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                        value={(localData.layout as string) || "grid"}
                        onChange={(e) => updateField("layout", e.target.value)}
                      >
                        <option value="grid">Grid</option>
                        <option value="list">List</option>
                        <option value="carousel">Carousel</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category Filter (optional)</Label>
                      <Input
                        placeholder="Leave empty for all"
                        value={(localData.categoryId as string) || ""}
                        onChange={(e) =>
                          updateField("categoryId", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={(localData.showFeatured as boolean) !== false}
                        onCheckedChange={(checked) =>
                          updateField("showFeatured", checked)
                        }
                      />
                      <Label className="cursor-pointer">
                        Show featured post first
                      </Label>
                    </div>
                  </>
                )}

                {block.type === "pricing-table" && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={(localData.description as string) || ""}
                        onChange={(e) =>
                          updateField("description", e.target.value)
                        }
                      />
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">
                      Pricing Tiers
                    </Label>
                    {(
                      (localData.tiers as Array<{
                        name: string;
                        price: string;
                        description: string;
                        features: string[];
                        ctaText: string;
                        ctaLink: string;
                        highlighted: boolean;
                      }>) || []
                    ).map((tier, i) => (
                      <Card key={i} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Tier {i + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600"
                            onClick={() => {
                              const arr = [
                                ...((localData.tiers as Array<unknown>) || []),
                              ];
                              arr.splice(i, 1);
                              updateField("tiers", arr);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            placeholder="Plan Name"
                            value={tier.name}
                            onChange={(e) => {
                              const arr = [
                                ...((localData.tiers as Array<
                                  Record<string, unknown>
                                >) || []),
                              ];
                              arr[i] = { ...arr[i], name: e.target.value };
                              updateField("tiers", arr);
                            }}
                          />
                          <Input
                            placeholder="Price (e.g. ₹999)"
                            value={tier.price}
                            onChange={(e) => {
                              const arr = [
                                ...((localData.tiers as Array<
                                  Record<string, unknown>
                                >) || []),
                              ];
                              arr[i] = { ...arr[i], price: e.target.value };
                              updateField("tiers", arr);
                            }}
                          />
                        </div>
                        <Input
                          placeholder="Short description"
                          value={tier.description}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.tiers as Array<
                                Record<string, unknown>
                              >) || []),
                            ];
                            arr[i] = { ...arr[i], description: e.target.value };
                            updateField("tiers", arr);
                          }}
                        />
                        <div className="space-y-2">
                          <Label>Features (one per line)</Label>
                          <Textarea
                            rows={3}
                            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                            value={(tier.features || []).join("\n")}
                            onChange={(e) => {
                              const arr = [
                                ...((localData.tiers as Array<
                                  Record<string, unknown>
                                >) || []),
                              ];
                              arr[i] = {
                                ...arr[i],
                                features: e.target.value
                                  .split("\n")
                                  .filter(Boolean),
                              };
                              updateField("tiers", arr);
                            }}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            placeholder="CTA Text"
                            value={tier.ctaText}
                            onChange={(e) => {
                              const arr = [
                                ...((localData.tiers as Array<
                                  Record<string, unknown>
                                >) || []),
                              ];
                              arr[i] = { ...arr[i], ctaText: e.target.value };
                              updateField("tiers", arr);
                            }}
                          />
                          <Input
                            placeholder="CTA Link"
                            value={tier.ctaLink}
                            onChange={(e) => {
                              const arr = [
                                ...((localData.tiers as Array<
                                  Record<string, unknown>
                                >) || []),
                              ];
                              arr[i] = { ...arr[i], ctaLink: e.target.value };
                              updateField("tiers", arr);
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={tier.highlighted || false}
                            onCheckedChange={(checked) => {
                              const arr = [
                                ...((localData.tiers as Array<
                                  Record<string, unknown>
                                >) || []),
                              ];
                              arr[i] = { ...arr[i], highlighted: checked };
                              updateField("tiers", arr);
                            }}
                          />
                          <Label className="cursor-pointer">
                            Highlight this tier (featured)
                          </Label>
                        </div>
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const arr = [
                          ...((localData.tiers as Array<unknown>) || []),
                          {
                            name: "New Plan",
                            price: "₹___",
                            description: "",
                            features: ["Feature"],
                            ctaText: "Get started",
                            ctaLink: "/contact",
                            highlighted: false,
                          },
                        ];
                        updateField("tiers", arr);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Tier
                    </Button>
                  </>
                )}

                {block.type === "sticky-cta" && (
                  <>
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Input
                        value={(localData.text as string) || ""}
                        onChange={(e) => updateField("text", e.target.value)}
                      />
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">Buttons</Label>
                    {(
                      (localData.buttons as Array<{
                        text: string;
                        type: string;
                        action: string;
                        link?: string;
                      }>) || []
                    ).map((btn, i) => (
                      <Card key={i} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Button {i + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600"
                            onClick={() => {
                              const arr = [
                                ...((localData.buttons as Array<unknown>) ||
                                  []),
                              ];
                              arr.splice(i, 1);
                              updateField("buttons", arr);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Button Text"
                          value={btn.text}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.buttons as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            arr[i] = { ...arr[i], text: e.target.value };
                            updateField("buttons", arr);
                          }}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <select
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                              value={btn.type}
                              onChange={(e) => {
                                const arr = [
                                  ...((localData.buttons as Array<
                                    Record<string, string>
                                  >) || []),
                                ];
                                arr[i] = { ...arr[i], type: e.target.value };
                                updateField("buttons", arr);
                              }}
                            >
                              <option value="primary">Primary</option>
                              <option value="whatsapp">WhatsApp</option>
                              <option value="phone">Phone</option>
                              <option value="ghost">Ghost</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Action</Label>
                            <select
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                              value={btn.action}
                              onChange={(e) => {
                                const arr = [
                                  ...((localData.buttons as Array<
                                    Record<string, string>
                                  >) || []),
                                ];
                                arr[i] = { ...arr[i], action: e.target.value };
                                updateField("buttons", arr);
                              }}
                            >
                              <option value="enquiry">Open Enquiry</option>
                              <option value="whatsapp">WhatsApp Link</option>
                              <option value="phone">Phone Call</option>
                              <option value="link">Custom Link</option>
                            </select>
                          </div>
                        </div>
                        <Input
                          placeholder="Link (e.g. /contact or tel: or https://)"
                          value={btn.link}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.buttons as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            arr[i] = { ...arr[i], link: e.target.value };
                            updateField("buttons", arr);
                          }}
                        />
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const arr = [
                          ...((localData.buttons as Array<unknown>) || []),
                          {
                            text: "Button",
                            type: "primary",
                            action: "enquiry",
                          },
                        ];
                        updateField("buttons", arr);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Button
                    </Button>
                  </>
                )}

                {block.type === "product-hero" && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input
                        value={(localData.subtitle as string) || ""}
                        onChange={(e) => updateField("subtitle", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={(localData.description as string) || ""}
                        onChange={(e) => updateField("description", e.target.value)}
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {block.type === "product-content-split" && (
                  <>
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={(localData.image as string) || ""}
                        onChange={(e) => updateField("image", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input
                        value={(localData.heading as string) || ""}
                        onChange={(e) => updateField("heading", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Paragraph</Label>
                      <Textarea
                        value={(localData.paragraph as string) || ""}
                        onChange={(e) => updateField("paragraph", e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">Bullet Points</Label>
                    {((localData.bullets as string[]) || []).map((bullet, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={bullet}
                          onChange={(e) => {
                            const arr = [...((localData.bullets as string[]) || [])];
                            arr[i] = e.target.value;
                            updateField("bullets", arr);
                          }}
                          placeholder="Bullet point text"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-rose-600"
                          onClick={() => {
                            const arr = [...((localData.bullets as string[]) || [])];
                            arr.splice(i, 1);
                            updateField("bullets", arr);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const arr = [...((localData.bullets as string[]) || []), ""];
                        updateField("bullets", arr);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Bullet
                    </Button>
                  </>
                )}

                {block.type === "product-cards" && (
                  <>
                    <div className="space-y-2">
                      <Label>Section Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Product IDs (comma-separated)</Label>
                      <Input
                        value={((localData.productIds as string[]) || []).join(", ")}
                        onChange={(e) =>
                          updateField(
                            "productIds",
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          )
                        }
                        placeholder="Leave empty to show recent products"
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty to auto-select products. Comma-separated IDs for manual selection.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Max Cards</Label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={(localData.maxCards as number) ?? 8}
                          onChange={(e) => updateField("maxCards", parseInt(e.target.value) || 8)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Columns</Label>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                          value={(localData.columns as number) ?? 4}
                          onChange={(e) => updateField("columns", parseInt(e.target.value))}
                        >
                          <option value={2}>2 Columns</option>
                          <option value={3}>3 Columns</option>
                          <option value={4}>4 Columns</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {block.type === "product-cta" && (
                  <>
                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input
                        value={(localData.heading as string) || ""}
                        onChange={(e) => updateField("heading", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={(localData.description as string) || ""}
                        onChange={(e) => updateField("description", e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">Bulk Order CTA</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={(localData.showBulkCta as boolean) !== false}
                        onCheckedChange={(checked) => updateField("showBulkCta", checked)}
                      />
                      <Label className="cursor-pointer">Show Bulk Order CTA</Label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Button Text</Label>
                        <Input
                          value={(localData.bulkCtaText as string) || "Enquire for Bulk Order →"}
                          onChange={(e) => updateField("bulkCtaText", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button Link</Label>
                        <Input
                          value={(localData.bulkCtaLink as string) || "/contact"}
                          onChange={(e) => updateField("bulkCtaLink", e.target.value)}
                        />
                      </div>
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">Private Label CTA</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={(localData.showPrivateLabelCta as boolean) !== false}
                        onCheckedChange={(checked) => updateField("showPrivateLabelCta", checked)}
                      />
                      <Label className="cursor-pointer">Show Private Label CTA</Label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Button Text</Label>
                        <Input
                          value={(localData.privateLabelCtaText as string) || "Start Private Label →"}
                          onChange={(e) => updateField("privateLabelCtaText", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Button Link</Label>
                        <Input
                          value={(localData.privateLabelCtaLink as string) || "/contact"}
                          onChange={(e) => updateField("privateLabelCtaLink", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Background</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                        value={(localData.backgroundColor as string) || "dark"}
                        onChange={(e) => updateField("backgroundColor", e.target.value)}
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </div>
                  </>
                )}

                {block.type === "product-process" && (
                  <>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={(localData.title as string) || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input
                        value={(localData.subtitle as string) || ""}
                        onChange={(e) => updateField("subtitle", e.target.value)}
                      />
                    </div>
                    <Separator />
                    <Label className="text-base font-semibold">Steps</Label>
                    {(
                      (localData.steps as Array<{
                        title: string;
                        description: string;
                      }>) || []
                    ).map((step, i) => (
                      <Card key={i} className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Step {i + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600"
                            onClick={() => {
                              const arr = [
                                ...((localData.steps as Array<unknown>) || []),
                              ];
                              arr.splice(i, 1);
                              updateField("steps", arr);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Step title"
                          value={step.title}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.steps as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            arr[i] = { ...arr[i], title: e.target.value };
                            updateField("steps", arr);
                          }}
                        />
                        <Input
                          placeholder="Step description"
                          value={step.description}
                          onChange={(e) => {
                            const arr = [
                              ...((localData.steps as Array<
                                Record<string, string>
                              >) || []),
                            ];
                            arr[i] = {
                              ...arr[i],
                              description: e.target.value,
                            };
                            updateField("steps", arr);
                          }}
                        />
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const arr = [
                          ...((localData.steps as Array<unknown>) || []),
                          { title: "", description: "" },
                        ];
                        updateField("steps", arr);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Step
                    </Button>
                  </>
                )}

                {block.type === "product-infographic" && (
                  <>
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={(localData.image as string) || ""}
                        onChange={(e) => updateField("image", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Alt Text</Label>
                      <Input
                        value={(localData.altText as string) || "Infographic"}
                        onChange={(e) => updateField("altText", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Caption (optional)</Label>
                      <Input
                        value={(localData.caption as string) || ""}
                        onChange={(e) => updateField("caption", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Common Style Controls */}
                {/* <Separator className="my-2" />
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Style Settings
                  </Label>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          className="h-9 w-9 rounded-md border border-input cursor-pointer"
                          value={(localData.bgColor as string) || "#ffffff"}
                          onChange={(e) =>
                            updateField("bgColor", e.target.value)
                          }
                        />
                        <Input
                          placeholder="#ffffff"
                          value={(localData.bgColor as string) || ""}
                          onChange={(e) =>
                            updateField("bgColor", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Padding Top</Label>
                      <Input
                        type="number"
                        min={0}
                        max={200}
                        placeholder="px"
                        value={(localData.paddingTop as number) ?? 80}
                        onChange={(e) =>
                          updateField("paddingTop", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Padding Bottom</Label>
                      <Input
                        type="number"
                        min={0}
                        max={200}
                        placeholder="px"
                        value={(localData.paddingBottom as number) ?? 80}
                        onChange={(e) =>
                          updateField("paddingBottom", Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Custom CSS Class</Label>
                    <Input
                      placeholder="e.g. max-w-4xl mx-auto"
                      value={(localData.customClass as string) || ""}
                      onChange={(e) =>
                        updateField("customClass", e.target.value)
                      }
                    />
                  </div>
                </div> */}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="json"
            className="flex-1 min-h-0 m-0"
            style={{ overflow: "auto" }}
          >
            <div className="flex flex-col h-[calc(90vh-220px)] p-6 gap-4">
              <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">
                  Top-level fields ({topLevelKeys.length})
                </p>
                <p className="mt-1">{formatTopLevelKeys(localData)}</p>
              </div>
              <div className="flex-1 relative">
                <Textarea
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className={`h-full font-mono text-sm resize-none ${jsonError ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
                  placeholder="Paste block JSON data here..."
                />
              </div>
              {jsonError && (
                <div className="text-xs text-rose-500 bg-rose-50 p-2 rounded border border-rose-200">
                  <strong>Invalid JSON:</strong> {jsonError}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Editing the JSON directly allows you to add any custom data
                fields to the block.
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="p-6 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!!jsonError}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PageBuilder({
  blocks,
  onChange,
  onNavigate,
}: PageBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);
  const [deleteBlock, setDeleteBlock] = useState<PageBlock | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [deviceSize, setDeviceSize] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );

  const deviceWidths: Record<string, string> = {
    desktop: "w-full",
    tablet: "max-w-[768px]",
    mobile: "max-w-[375px]",
  };

  const deviceIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  };

  const handleAddBlock = useCallback(
    (type: BlockType) => {
      const newBlock = createBlock(type);
      onChange([...blocks, newBlock]);
    },
    [blocks, onChange],
  );

  const handleDuplicateBlock = useCallback(
    (block: PageBlock) => {
      const duplicated = {
        ...block,
        id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        data: JSON.parse(JSON.stringify(block.data)),
      };
      const index = blocks.findIndex((b) => b.id === block.id);
      if (index !== -1) {
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, duplicated);
        onChange(newBlocks);
      }
    },
    [blocks, onChange],
  );

  const handleDeleteBlock = useCallback(() => {
    if (!deleteBlock) return;
    onChange(blocks.filter((b) => b.id !== deleteBlock.id));
    setDeleteBlock(null);
  }, [blocks, deleteBlock, onChange]);

  const handleEditSave = useCallback(
    (updatedBlock: PageBlock) => {
      onChange(
        blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
      );
      setEditingBlock(null);
    },
    [blocks, onChange],
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [
        newBlocks[index],
        newBlocks[index - 1],
      ];
      onChange(newBlocks);
    },
    [blocks, onChange],
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= blocks.length - 1) return;
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [
        newBlocks[index + 1],
        newBlocks[index],
      ];
      onChange(newBlocks);
    },
    [blocks, onChange],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newBlocks = [...blocks];
          const [moved] = newBlocks.splice(oldIndex, 1);
          newBlocks.splice(newIndex, 0, moved);
          onChange(newBlocks);
        }
      }
    },
    [blocks, onChange],
  );

  const blockTypes = Object.keys(BLOCK_DEFAULTS) as BlockType[];
  const previewNavigate = onNavigate ?? (() => {});

  return (
    <div className="space-y-4">
      {/* Toolbar: Preview Toggle & Device Size */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? "Edit Blocks" : "Preview"}
          </Button>
          {previewMode && (
            <div className="flex items-center gap-1 ml-2 border-l pl-2">
              {(["desktop", "tablet", "mobile"] as const).map((device) => {
                const DeviceIcon = deviceIcons[device];
                return (
                  <Button
                    key={device}
                    variant={deviceSize === device ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setDeviceSize(device)}
                    title={`${device.charAt(0).toUpperCase() + device.slice(1)} view`}
                  >
                    <DeviceIcon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          )}
        </div>
        {!previewMode && blocks.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            onClick={() => onChange([])}
          >
            Clear All
          </Button>
        )}
      </div>

      {previewMode ? (
        /* Live Preview */
        <div className="flex justify-center">
          <div
            className={`${deviceWidths[deviceSize]} w-full rounded-lg border bg-white shadow-sm overflow-hidden`}
          >
            <div className="bg-muted px-4 py-2 text-xs text-muted-foreground border-b flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="ml-2 font-medium">Preview — {deviceSize}</span>
            </div>
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <LayoutGrid className="h-10 w-10 mb-2" />
                <p>Add blocks to see preview</p>
              </div>
            ) : (
              <PreviewRenderer blocks={blocks} onNavigate={previewNavigate} />
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar: Add Block Panel */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add Block</h3>
            <p className="text-sm text-muted-foreground">
              Click to add a block to the end
            </p>
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-2 pr-4">
                {blockTypes.map((type) => {
                  const defaults = BLOCK_DEFAULTS[type];
                  const Icon = BLOCK_ICONS[type] || Type;
                  return (
                    <button
                      key={type}
                      className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left hover:bg-accent/50 transition-colors"
                      onClick={() => handleAddBlock(type)}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                        <Icon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium">
                        {defaults.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Main: Block List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Page Blocks
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({blocks.length})
                </span>
              </h3>
            </div>

            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <LayoutGrid className="h-10 w-10 text-muted-foreground/50" />
                <h4 className="mt-4 text-lg font-medium">No blocks yet</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Click a block type from the left panel to start building your
                  page
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {blocks.map((block, index) => (
                      <SortableBlockCard
                        key={block.id}
                        block={block}
                        index={index}
                        total={blocks.length}
                        onEdit={setEditingBlock}
                        onDelete={setDeleteBlock}
                        onDuplicate={handleDuplicateBlock}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <BlockEditDialog
        block={editingBlock}
        open={!!editingBlock}
        onClose={() => setEditingBlock(null)}
        onSave={handleEditSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteBlock}
        onOpenChange={() => setDeleteBlock(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Block</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this block? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBlock}
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

function CategoryPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; productCount: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/categories?all=true");
        if (res.ok) {
          const json = await res.json();
          const cats = (json.categories || json.data || []).filter(
            (c: { isActive?: boolean }) => c.isActive !== false,
          );
          if (!cancelled) {
            setCategories(
              cats.map((c: { id: string; name: string; _count?: { Product: number } }) => ({
                id: c.id,
                name: c.name,
                productCount: c._count?.Product || 0,
              })),
            );
          }
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">Select Categories</Label>
      <p className="text-xs text-muted-foreground">
        Choose categories to display. If none selected, all active categories will be shown.
      </p>
      {loading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading categories...</span>
        </div>
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No categories found</p>
      ) : (
        <ScrollArea className="h-48 border rounded-md p-2">
          <div className="space-y-1">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted cursor-pointer text-sm"
              >
                <Checkbox
                  checked={selectedIds.includes(cat.id)}
                  onCheckedChange={() => toggle(cat.id)}
                />
                <span className="flex-1">{cat.name}</span>
                <span className="text-xs text-muted-foreground">
                  {cat.productCount} product{cat.productCount !== 1 ? "s" : ""}
                </span>
              </label>
            ))}
          </div>
        </ScrollArea>
      )}
      {selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} category{selectedIds.length !== 1 ? "ies" : "y"} selected
        </p>
      )}
    </div>
  );
}
