"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Heading1,
  Columns2,
  Grid3X3,
  MousePointerClick,
  GitMerge,
  Image,
  Images,
  Save,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MediaPickerField } from "./MediaPickerField";
import { ProductSelector } from "./ProductSelector";

export interface CategoryFieldValues {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  contentSplitImage: string;
  contentSplitHeading: string;
  contentSplitParagraph: string;
  contentSplitBullets: string;
  cardsTitle: string;
  cardsProductIds: string;
  cardsMaxCount: number;
  cardsColumns: number;
  ctaHeading: string;
  ctaDescription: string;
  ctaBulkText: string;
  ctaBulkLink: string;
  ctaPrivateLabelText: string;
  ctaPrivateLabelLink: string;
  ctaBackgroundColor: string;
  processTitle: string;
  processSubtitle: string;
  processSteps: string;
  infographicImage: string;
  infographicCaption: string;
  infographicAltText: string;
  galleryTitle: string;
  galleryImages: string;
  faqTitle: string;
  faqItems: string;
}

interface AdminCategoryFieldsProps {
  values: CategoryFieldValues;
  onChange: (values: CategoryFieldValues) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

const sectionIcons: Record<string, React.ReactNode> = {
  hero: <Heading1 className="h-4 w-4" />,
  "content-split": <Columns2 className="h-4 w-4" />,
  cards: <Grid3X3 className="h-4 w-4" />,
  cta: <MousePointerClick className="h-4 w-4" />,
  process: <GitMerge className="h-4 w-4" />,
  infographic: <Image className="h-4 w-4" />,
  gallery: <Images className="h-4 w-4" />,
  faq: <HelpCircle className="h-4 w-4" />,
};

export function AdminCategoryFields({
  values,
  onChange,
  onSave,
  saving,
}: AdminCategoryFieldsProps) {
  const [activeSection, setActiveSection] = useState("hero");

  const update = useCallback(
    (key: keyof CategoryFieldValues, val: unknown) => {
      onChange({ ...values, [key]: val });
    },
    [values, onChange],
  );

  const bullets: string[] = (() => {
    try {
      const parsed = JSON.parse(values.contentSplitBullets || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const setBullets = (newBullets: string[]) => {
    update("contentSplitBullets", JSON.stringify(newBullets));
  };

  const steps: { title: string; description: string }[] = (() => {
    try {
      const parsed = JSON.parse(values.processSteps || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const setSteps = (newSteps: { title: string; description: string }[]) => {
    update("processSteps", JSON.stringify(newSteps));
  };

  const galleryImageList: string[] = (() => {
    try {
      const parsed = JSON.parse(values.galleryImages || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const setGalleryImages = (newImages: string[]) => {
    update("galleryImages", JSON.stringify(newImages));
  };

  const faqItems: { question: string; answer: string }[] = (() => {
    try {
      const parsed = JSON.parse(values.faqItems || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const setFaqItems = (
    newItems: { question: string; answer: string }[],
  ) => {
    update("faqItems", JSON.stringify(newItems));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Category Page Sections</h3>
        <Button size="sm" onClick={onSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save All Sections"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Each section maps to a dedicated field on the category. Changes render
        live on the category page.
      </p>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="content-split">Content</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
          <TabsTrigger value="infographic">Info</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4 pt-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              {sectionIcons.hero}
              <Label className="text-base font-semibold">
                Hero / Heading Section
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-hero-title">Title (H1)</Label>
              <Input
                id="cat-hero-title"
                placeholder="Roasted Makhana Manufacturer & Bulk Supplier"
                value={values.heroTitle}
                onChange={(e) => update("heroTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-hero-subtitle">Subtitle / Badge</Label>
              <Input
                id="cat-hero-subtitle"
                placeholder="Bulk Makhana Manufacturer · Private Label Ready"
                value={values.heroSubtitle}
                onChange={(e) => update("heroSubtitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-hero-desc">Description</Label>
              <Textarea
                id="cat-hero-desc"
                placeholder="Premium fox nuts, graded and roasted in-house..."
                value={values.heroDescription}
                onChange={(e) => update("heroDescription", e.target.value)}
                rows={3}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="content-split" className="space-y-4 pt-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              {sectionIcons["content-split"]}
              <Label className="text-base font-semibold">
                Image + Content Split
              </Label>
            </div>
            <MediaPickerField
              label="Image"
              value={values.contentSplitImage}
              onChange={(url) => update("contentSplitImage", url)}
              placeholder="https://example.com/image.jpg"
            />
            <div className="space-y-2">
              <Label htmlFor="cat-cs-heading">Heading</Label>
              <Input
                id="cat-cs-heading"
                placeholder="Sourced direct. Roasted in-house. Built for bulk."
                value={values.contentSplitHeading}
                onChange={(e) => update("contentSplitHeading", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-cs-paragraph">Paragraph</Label>
              <Textarea
                id="cat-cs-paragraph"
                placeholder="Our makhana is sourced directly from growers..."
                value={values.contentSplitParagraph}
                onChange={(e) =>
                  update("contentSplitParagraph", e.target.value)
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Bullet Points</Label>
              {bullets.map((bullet, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={bullet}
                    onChange={(e) => {
                      const next = [...bullets];
                      next[i] = e.target.value;
                      setBullets(next);
                    }}
                    placeholder="Bullet text"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setBullets(bullets.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBullets([...bullets, ""])}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bullet
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4 pt-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              {sectionIcons.cards}
              <Label className="text-base font-semibold">
                Product Cards Grid
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-cards-title">Section Title</Label>
              <Input
                id="cat-cards-title"
                placeholder="Our makhana range"
                value={values.cardsTitle}
                onChange={(e) => update("cardsTitle", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-cards-max">Max Cards</Label>
                <Input
                  id="cat-cards-max"
                  type="number"
                  min={1}
                  max={20}
                  value={values.cardsMaxCount}
                  onChange={(e) =>
                    update("cardsMaxCount", parseInt(e.target.value) || 8)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-cards-cols">Columns</Label>
                <Select
                  value={String(values.cardsColumns)}
                  onValueChange={(v) => update("cardsColumns", parseInt(v))}
                >
                  <SelectTrigger id="cat-cards-cols">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 columns</SelectItem>
                    <SelectItem value="3">3 columns</SelectItem>
                    <SelectItem value="4">4 columns</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Select Products</Label>
              <ProductSelector
                value={values.cardsProductIds}
                onChange={(val) => update("cardsProductIds", val)}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cta" className="space-y-4 pt-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              {sectionIcons.cta}
              <Label className="text-base font-semibold">
                Call to Action
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-cta-heading">Heading</Label>
              <Input
                id="cat-cta-heading"
                placeholder="Looking for bulk supply or private label?"
                value={values.ctaHeading}
                onChange={(e) => update("ctaHeading", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-cta-desc">Description</Label>
              <Textarea
                id="cat-cta-desc"
                placeholder="Share your requirement and get pricing..."
                value={values.ctaDescription}
                onChange={(e) => update("ctaDescription", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-cta-bg">Background Color</Label>
              <Select
                value={values.ctaBackgroundColor || "dark"}
                onValueChange={(v) => update("ctaBackgroundColor", v)}
              >
                <SelectTrigger id="cat-cta-bg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light / Muted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-cta-bulk-text">Bulk Order Button Text</Label>
                <Input
                  id="cat-cta-bulk-text"
                  placeholder="Enquire for Bulk Order →"
                  value={values.ctaBulkText}
                  onChange={(e) => update("ctaBulkText", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-cta-bulk-link">Bulk Order Link</Label>
                <Input
                  id="cat-cta-bulk-link"
                  placeholder="/contact"
                  value={values.ctaBulkLink}
                  onChange={(e) => update("ctaBulkLink", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-cta-pl-text">
                  Private Label Button Text
                </Label>
                <Input
                  id="cat-cta-pl-text"
                  placeholder="Start Private Label →"
                  value={values.ctaPrivateLabelText}
                  onChange={(e) =>
                    update("ctaPrivateLabelText", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-cta-pl-link">Private Label Link</Label>
                <Input
                  id="cat-cta-pl-link"
                  placeholder="/contact"
                  value={values.ctaPrivateLabelLink}
                  onChange={(e) =>
                    update("ctaPrivateLabelLink", e.target.value)
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="space-y-4 pt-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              {sectionIcons.process}
              <Label className="text-base font-semibold">
                Process Flow
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-process-title">Title</Label>
              <Input
                id="cat-process-title"
                placeholder="From raw material to dispatch"
                value={values.processTitle}
                onChange={(e) => update("processTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-process-subtitle">Subtitle</Label>
              <Input
                id="cat-process-subtitle"
                placeholder="Every batch follows the same controlled process"
                value={values.processSubtitle}
                onChange={(e) => update("processSubtitle", e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label>Steps</Label>
              {steps.map((step, i) => (
                <Card key={i} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Step {i + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        setSteps(steps.filter((_, j) => j !== i))
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Step title"
                    value={step.title}
                    onChange={(e) => {
                      const next = [...steps];
                      next[i] = { ...next[i], title: e.target.value };
                      setSteps(next);
                    }}
                  />
                  <Input
                    placeholder="Step description"
                    value={step.description}
                    onChange={(e) => {
                      const next = [...steps];
                      next[i] = { ...next[i], description: e.target.value };
                      setSteps(next);
                    }}
                  />
                </Card>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSteps([...steps, { title: "", description: "" }])
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="infographic" className="space-y-4 pt-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              {sectionIcons.infographic}
              <Label className="text-base font-semibold">
                Infographic Image
              </Label>
            </div>
            <MediaPickerField
              label="Image"
              value={values.infographicImage}
              onChange={(url) => update("infographicImage", url)}
              placeholder="https://example.com/infographic.jpg"
            />
            <div className="space-y-2">
              <Label htmlFor="cat-info-caption">Caption (optional)</Label>
              <Input
                id="cat-info-caption"
                placeholder="e.g. nutrition breakdown, sourcing map"
                value={values.infographicCaption}
                onChange={(e) => update("infographicCaption", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-info-alt">Alt Text</Label>
              <Input
                id="cat-info-alt"
                placeholder="Descriptive alt text for the infographic"
                value={values.infographicAltText}
                onChange={(e) => update("infographicAltText", e.target.value)}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4 pt-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              {sectionIcons.gallery}
              <Label className="text-base font-semibold">
                Gallery Section
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-gallery-title">Section Title</Label>
              <Input
                id="cat-gallery-title"
                placeholder="Product Gallery"
                value={values.galleryTitle}
                onChange={(e) => update("galleryTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Gallery Images</Label>
              {galleryImageList.map((url, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <MediaPickerField
                    label={`Image ${i + 1}`}
                    value={url}
                    onChange={(newUrl) => {
                      const next = [...galleryImageList];
                      next[i] = newUrl;
                      setGalleryImages(next);
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setGalleryImages(galleryImageList.filter((_, j) => j !== i))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGalleryImages([...galleryImageList, ""])}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4 pt-4">
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              {sectionIcons.faq}
              <Label className="text-base font-semibold">
                FAQ Section
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-faq-title">Section Title</Label>
              <Input
                id="cat-faq-title"
                placeholder="Frequently Asked Questions"
                value={values.faqTitle}
                onChange={(e) => update("faqTitle", e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label>Questions & Answers</Label>
              {faqItems.map((item, i) => (
                <Card key={i} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Q&A {i + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        setFaqItems(faqItems.filter((_, j) => j !== i))
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Question"
                    value={item.question}
                    onChange={(e) => {
                      const next = [...faqItems];
                      next[i] = { ...next[i], question: e.target.value };
                      setFaqItems(next);
                    }}
                  />
                  <Textarea
                    placeholder="Answer"
                    value={item.answer}
                    onChange={(e) => {
                      const next = [...faqItems];
                      next[i] = { ...next[i], answer: e.target.value };
                      setFaqItems(next);
                    }}
                    rows={3}
                  />
                </Card>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFaqItems([...faqItems, { question: "", answer: "" }])
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
