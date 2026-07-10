# Storefront UI Overhaul - Comprehensive Plan

## Overview
Multiple page-level changes across the WCommerce storefront: Home, About, Manufacturing, Catalogue, Contact, and Blog pages. All changes are frontend-only unless explicitly noted. Theme removal is cosmetic; no new dark theme is added.

---

## 1. HOME PAGE Changes

### 1a. Announcement Bar + Top Nav Removal
- **File**: `src/components/store/StoreHeader.tsx` (lines 249-330)
- **File**: `src/components/store/StoreLayout.tsx` (lines 96-100)
- **Action**: 
  - Announcement bar already renders conditionally in `StoreLayout` (`announcement_text` setting). Make it **always-visible** (remove the `&&` condition) and styled as full-width, blue background, white text, centered.
  - Ensure it already uses `settings?.announcement_text`. The author will fill `announcement_text` from CMS/admin settings. Default to empty string when not set.
  - Remove the hidden top bar entirely. Delete lines 249-330 in `StoreHeader.tsx` (the `<div className="hidden ">` TOP BAR block). This removes the "Welcome / My Account / Wishlist / Cart" top strip.

### 1b. Light Theme Only (Remove Dark/Light Toggle)
- **File**: `src/components/ThemeProvider.tsx`, `src/components/ThemeToggle.tsx`, `src/components/SimpleThemeToggle.tsx`
- **Action**:
  - Remove theme toggle buttons from header (`StoreHeader.tsx`), footer (`StoreFooter.tsx`), and mobile nav (`MobileBottomNav.tsx`).
  - Remove `DarkModeToggle` / `ThemeToggle` from admin and any layout.
  - Hardcode `light` theme in `globals.css` and `tailwind.config.ts` by removing the `darkMode` class strategy.
  - Ensure all color variables in `:root` are always applied and no `.dark` overrides needed. Remove any `.dark:` variants from classNames across store components.

### 1c. Full-Width Banner
- **File**: `src/components/store/PageBlockRenderer.tsx` (HeroBlock, lines 185-253)
- **Action**: In `HeroBlock`, change the outer container from `mx-auto max-w-4xl` to `w-full` so the hero spans full width. Content inner container keeps `max-w-4xl mx-auto` for text alignment.

### 1d. 4-Item Card Section (Banner Below)  
- **File**: `src/components/store/PageBlockRenderer.tsx` (AudienceCards / `audience-cards` block)
- **Action**: Update the `audience-cards` renderer so all 4 cards (`B2B brands`, `Private label`, `Distributors`, `Institutional buyers`) are **centered** in their container. Use `text-center` and `mx-auto` approach. Ensure CTAs render as buttons with:
  - Blue background (`bg-primary`) and white text (`text-primary-foreground`) by default.
  - CMS fields `ctaButtonColor` and `ctaTextColor` already exist in `BLOCK_DEFAULTS["audience-cards"]` — use them for inline styles.

### 1e. Who We Serve - Sections Center + Buttons
- **Action**: Same as 1d. The `audience-cards` block data already has `ctaButtonColor: "#2639ED"` and `ctaTextColor: "#FFFFFF"` defaults. Render each card's CTA using these CMS-provided colors. Ensure cards are in a centered grid.

### 1f. Our Product Range - Center Aligned, 6 Categories, Blue Button
- **File**: `src/components/store/PageBlockRenderer.tsx` (`product-categories` block)
- **Action**: 
  - Add a 6th category entry to `BLOCK_DEFAULTS["product-categories"].defaultData.categories` (e.g., `Namkeen` with variants).
  - Ensure the section header and grid are centered (`text-center` on wrapper, each card `mx-auto`).
  - The CTA button already uses `ctaButtonColor` / `ctaTextColor` defaults (`#2639ED` / `#FFFFFF`) — keep and ensure styling is applied.

### 1g. Hide "Ready to Manufacture at Scale" Section
- **File**: `src/components/store/StickyCtaBar.tsx`
- **Action**: Remove `StickyCtaBar` from `StoreLayout.tsx` rendering (delete lines 122-124 in `StoreLayout.tsx`). Alternatively, keep component file but never render it. This removes the floating bottom "Ready to manufacture at scale?" bar.

### 1h. Hide WhatsApp Link from Footer
- **File**: `src/components/store/StoreFooter.tsx`
- **Action**: Remove all WhatsApp reference lines from footer output. No WhatsApp contact display. Phone number stays as `tel:` link.

### 1i. Hide Newsletter from Footer
- **File**: `src/components/store/StoreFooter.tsx` (lines 52-80, and the newsletter subscribe section in the 4th grid column)
- **Action**: Remove the entire newsletter subscription form block from the footer's 4th column. Replace with static contact info or remove the 4th column.

---

## 2. ABOUT PAGE Changes

### 2a. Banner Background Images
- **File**: `src/components/store/AboutPage.tsx` (section A1 Hero, lines 109-126)
- **Action**: The hero already uses `bg-gradient-to-br`. Replace with a CMS-driven `backgroundImage` field in `BLOCK_DEFAULTS["about-page-content"].defaultData`. In the About page, read `hero.backgroundImage` and render as `<img>` absolute inset-0 when present, falling back to the gradient.

### 2b. Author Image/Content in About Page
- **File**: `src/components/store/AboutPage.tsx` (A4 section, lines 229-307)
- **Action**: Directors array already supports `imageUrl` — this is correct. The author from CMS (`quoteData.author`) currently renders as plain text. Add an optional `authorImage` field to `directors` and display it as avatar next to quotes. Ensure the quote section can accept an image for the quote author.

### 2c. Remove WhatsApp and Tagging from "People Behind Purva Bites"
- **File**: `src/components/store/AboutPage.tsx` (A4 section, line 269-274)
- **Action**: Remove the LinkedIn button and any social tagging from director cards. Keep only the image, name, role, bio. Optionally allow a `socialUrl` field per director, but remove hardcoded LinkedIn icon.

### 2d. "Ready to Work With Us" — Color Combination Fix + Contact Form
- **File**: `src/components/store/AboutPage.tsx` (A8 section, lines 417-447)
- **Action**: 
  - Change the second and third card CTAs to use a **contact form** instead of navigation buttons. Replace `onClick={() => onNavigate(item.page)}` with an inline contact form (reuse `SharedContactForm` with `variant="compact"`), scrolled/anchor to the contact form at top of page.
  - Restyle the section background so text is readable: use blue (`bg-primary`) with white text, not the current white card on blue which has poor contrast for the card text. Cards should be `bg-white text-gray-900` on a blue section.
  - Default CTAs: card 1 → `View manufacturing →` (stays as nav), card 2 → inline mini form, card 3 → inline mini form.

---

## 3. MANUFACTURING PAGE Changes

### 3a. Production Line Tab — CMS-Configurable Link
- **File**: `src/components/store/ManufacturingPage.tsx` (M2 section, lines 191-277)
- **File**: `src/lib/page-blocks.ts` (`mfg-page-content` defaults)
- **Action**:
  - In `productionLines` data, add a `ctaText` and `ctaLink` field (optional, with defaults).
  - The existing "View Products →" button already calls `onNavigate("category", activeLineData?.id)`. Add a CMS checkbox `showProductionLineCta` (default `true`) in `BLOCK_DEFAULTS["mfg-page-content"]` so admin can show/hide the button per production line.
  - Button labels/links should be CMS-editable per production line item.

### 3b. "Your Brand Our Factory" — Color Fix + Text Visibility
- **File**: `src/components/store/ManufacturingPage.tsx` (M5 section, lines 330-390)
- **Action**: The section currently uses `bg-muted/40` with white cards. Ensure text contrast: use `bg-background` cards with `border` on a `bg-muted/40` background. The heading, body text, and CTA should all use `text-foreground` / `text-muted-foreground` properly. No color combination issues if foreground is dark on light.

### 3c. Homepage Contact Form + CMS Color
- **File**: `src/components/store/ManufacturingPage.tsx` (M7 section, lines 418-437)
- **Action**:
  - Reuse the **same** `SharedContactForm` component (already imported and used).
  - Add `bgColor` and `textColor` (or `formBgColor`, `formTextColor`) fields to `mfg-page-content` default data.
  - Pass these CMS values to `SharedContactForm`'s `bgColor` and `textColor` props so the form's blue color is overridable from CMS/admin.

### 3d. Certification Section — Hide Download PDF
- **File**: `src/components/store/ManufacturingPage.tsx` (M6 section, lines 392-416)
- **Action**: Remove the "View all certifications" CTA or any download PDF button from the certifications grid. Keep only the certification cards display.

---

## 4. CATALOGUE PAGE Changes

### 4a. Enable Category Tabs (Functional)
- **File**: `src/components/store/CataloguePage.tsx` (Category Tabs section, lines 320-356)
- **Action**: Tabs are already wired — clicking a non-"all" tab calls `onNavigate('category', cat.id)`. Already functional. Verify in `CatchAllPage` that `/catalogue/<slug>` correctly routes to `CategoryPage`.

### 4b. Hide Tagging from Products
- **File**: `src/components/store/CataloguePage.tsx` (Product Grid, lines 414-486)
- **Action**: In the product card, remove the `tags` rendering (lines 418-420: `if (product.Category) tags.push(product.Category.name); if (product.isFeatured) tags.push('Featured');`). Remove the `tags` display from the card. Remove the `tag` span elements. Step 4e also covers min order quantity removal.

### 4c. After Clicking Enquire Now → Inline Contact Form on Same Page
- **File**: `src/components/store/CataloguePage.tsx` (EnquiryModal usage, lines 563-573 and `handleEnquiryClick`)
- **Action**:
  - Remove the `EnquiryModal` modal popup. Instead, replace the click handler so that clicking "Enquire" on any product **scrolls to or reveals an inline contact form** on the same Catalogue page.
  - Add a `SharedContactForm` with `variant="inline"` or `variant="full"` at the bottom of the Catalogue page (after the product grid). Pass `productContext` from the clicked product.
  - Click "Enquire" → set selected product state → scroll to form section smoothly.

### 4d. Category Pages (Dedicated Page per Category)
- **File**: `src/components/store/CategoryPage.tsx` (already exists, lines 1-319)
- **Status**: **Already implemented**. `/catalogue/<slug>` routes to this page via `CatchAllPage.page.tsx` (line 52).

### 4e. Remove "We Do Not Sell Retail" Message
- **File**: Search `src/components/store/CataloguePage.tsx` and related files for "retail" / "B2B" disclaimer text.
- **Action**: Find and remove any "We do not sell retail. All orders are B2B bulk and trade only" text from the catalogue page.

### 4f. Remove "Download Full Catalogue"
- **File**: Search in `CataloguePage.tsx`, `HomePage`, `PageBlockRenderer.tsx`, and shared blocks for "Download full catalogue" buttons.
- **Action**: Remove any "Download full catalogue" button/link from the Catalogue page and homepage blocks (`certifications`, `quick-connect` blocks in `PageBlockRenderer.tsx`).

### 4g. Remove Min Order Quantity Display
- **File**: `src/components/store/CataloguePage.tsx` (product card)
- **Action**: Remove `minOrderQty` references in catalogue display. Products in catalogue cards should not show MOQ (B2B-only detail handled via enquiry form).

---

## 5. CONTACT PAGE Changes

### 5a. "Get in Touch" Color Fix
- **File**: `src/components/store/ContactPage.tsx` (Hero CT0, lines 54-81)
- **Action**: Change from `bg-primary text-primary-foreground` to a more readable combination. Proposed: white background with blue (`text-primary`) heading, or a blue-to-light-blue gradient. The current solid blue can look heavy — add a subtle overlay/gradient for better aesthetics. Update the hero background to `bg-gradient-to-br from-[#abd0ff] to-primary` so text remains white and is readable.

### 5b. Hide WhatsApp Number
- **File**: `src/components/store/ContactPage.tsx`
- **Action**: No WhatsApp number currently shown directly. Ensure no WhatsApp link/button is rendered. The `quick-connect` block in CMS handles WhatsApp — that is controlled by CMS (can be hidden).

### 5c. Hide "WhatsApp Instead" / Quick Connect
- **File**: `src/components/store/PageBlockRenderer.tsx` (`quick-connect` block, lines 2362+)
- **Action**: No explicit "WhatsApp instead" section found. The `quick-connect` block renders WhatsApp as a channel — admin can remove it via CMS. No code change needed unless explicitly rendered. Leave as is; CMS-controlled.

### 5d. "Schedule a Factory Visit" → Scroll to Contact Form (Same Page)
- **File**: `src/components/store/ContactPage.tsx` (Location Cards, lines 116-161, specifically line 150 `scrollTo`)
- **Action**: The "Schedule a factory visit" CTA already scrolls to top (line 150: `window.scrollTo({ top: 0 })`). Change it to scroll to the contact form section instead (add an `id` to the form section `<section>` and use `document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })`).

### 5e. Remove "Prefer a Quicker Channel?" Section
- **File**: `src/components/store/ContactPage.tsx` check if `quick-connect` block is rendered.
- **Action**: Remove the `quick-connect` CMS block from `contact-page-content` default data in `page-blocks.ts` if present. (It is not currently in `contact-page-content` defaults, but ensure no separate render.)

### 5f. Remove "What Happens After You Get in Touch" (CRM Flow)
- **File**: `src/components/store/ContactPage.tsx` check CRM flow section
- **Action**: If a CRM flow block is rendered on Contact page via CMS or hardcoded, remove it. Currently not visible in `ContactPage.tsx`. Verify in `PageBlockRenderer.tsx`.

---

## 6. BLOG PAGE Changes

### 6a. Blog Design — Category Page Instead of Product Detail
- **File**: `src/components/store/BlogPage.tsx` (lines 1-309)
- **Action**:
  - Clicking on a blog post card currently calls `onNavigate('blog-post', post.slug)` which opens a full post detail page (`BlogPostView`).
  - Add an **inline enquiry form** that appears on the Blog list page when a user clicks "Enquire" from a tag. This is already partially there (line 193: `onNavigate('contact')`). Replace this to scroll-to or reveal a `SharedContactForm` at the bottom of the blog page, pre-filled with the selected category/tag.
  - No need for the blog post detail page to be removed entirely, but the requirement says "no need to go specific product page" — the `blog-post` route can remain but the tag-based enquiry should work from the blog list without navigating away.

---

## 7. SHARED CONTACT FORM — CMS Color Customization
- **File**: `src/components/store/SharedContactForm.tsx`
- **Action**: 
  - The component already accepts `bgColor` and `textColor` props (lines 13-14). Ensure these are used correctly in the inline styles — currently used as style color, but the input class uses template literals which won't work with dynamic colors. Fix by applying colors via `style` prop on elements rather than CSS class strings (line 84: `text-[${textColor}]` is invalid Tailwind — use `style={{ color: textColor }}` instead).
  - The contact form background color can be set per page via CMS fields. Ensure all pages using `SharedContactForm` pass CMS-driven colors.

### CMS Contact Form Color Fields (Page Block Defaults)
Add `formBgColor` and `formTextColor` fields to:
- `mfg-page-content` (default: `#2639ED`, `#FFFFFF`)
- `contact-page-content` (default: `#2639ED`, `#FFFFFF`)
- `catalogue-page-content` (used for inline enquiry)
- `homepage` (if Lead Capture block used)

---

## 8. ADDITIONAL NOTES

### Removed Components
- `src/components/ThemeToggle.tsx`
- `src/components/SimpleThemeToggle.tsx` (if used)
- Dark theme classes in all component files

### CMS Settings References
- `SiteSetting.announcement_text` — announcement bar text
- `SiteSetting.whatsapp_number` — still used internally but hidden from UI (for backend links only)
- `BLOCK_DEFAULTS` in `src/lib/page-blocks.ts` — all color/link defaults for each block

### Files to Modify (Complete List)
1. `src/components/store/StoreHeader.tsx` — remove top bar, remove theme toggles
2. `src/components/store/StoreLayout.tsx` — announcement bar always-visible, remove StickyCtaBar
3. `src/components/store/StoreFooter.tsx` — remove newsletter, remove WhatsApp
4. `src/components/store/StoreFooter.tsx` or `MobileBottomNav.tsx` — remove theme toggle
5. `src/components/store/HomePage.tsx` — banner full-width, verify 4-cards and 6-cats
6. `src/components/ThemeProvider.tsx` — enforce light theme only
7. `src/components/ThemeToggle.tsx` / `SimpleThemeToggle.tsx` — remove or gut
8. `src/app/globals.css` + `tailwind.config.ts` — remove dark mode
9. `src/components/store/PageBlockRenderer.tsx` — hero full-width, audience-cards center, product-categories 6 + center, quick-connect WhatsApp conditionally render only if enabled, sticky-cta cleanup
10. `src/components/store/AboutPage.tsx` — hero bgImage, author image, remove LinkedIn, cta section color + contact form
11. `src/components/store/ManufacturingPage.tsx` — production line cta cms, private label color, cta form bg, hide certification cta
12. `src/components/store/ManufacturingPage.tsx` — hide "ready to manufacture at scale" section (already via StickyCtaBar removal)
13. `src/components/store/CataloguePage.tsx` — hide tags, hide MOQ, inline enquiry, hide retail disclaimer, hide download catalogue
14. `src/components/store/ContactPage.tsx` — hero color, scroll-to-form, hide crm flow
15. `src/components/store/BlogPage.tsx` — inline enquiry from tags
16. `src/components/store/SharedContactForm.tsx` — fix dynamic color Tailwind classes
17. `src/lib/page-blocks.ts` — update defaults (6 categories, new fields, colors)

### New Files (None Required)
All changes use existing components. No new files needed.

---

## Implementation Order

1. **Theme removal** (globals.css, ThemeProvider, toggle components) — foundation change
2. **StoreHeader/Footer** (top bar, announcement bar, newsletter, WhatsApp) — layout changes
3. **StoreLayout** (StickyCtaBar removal)
4. **PageBlockRenderer** (hero full-width, audience-cards center, product-categories 6, sticky-cta)
5. **AboutPage** (hero image, author image, cta color+form, LinkedIn removal)
6. **ManufacturingPage** (production line cta, private label colors, contact form colors, certification cta removal)
7. **CataloguePage** (hide tags, hide MOQ, hide retail, hide download, inline enquiry)
8. **ContactPage** (hero color, scroll-to-form for factory visit)
9. **BlogPage** (tag enquiry inline)
10. **SharedContactForm** (fix dynamic color classes)
11. **page-blocks.ts** (update all defaults)

### Open Questions for User
1. Replace theme toggles with what? (Just remove all toggle UI — permanently light?)
2. Announcement bar: default text when `announcement_text` is empty — keep the bar hidden or show placeholder? (Recommend: hidden if empty)
3. For manufacturing production line CTA: should each line link to its own category page, or to a configurable URL per line? (Current: links to category by line id)
4. For Contact page hero: preferred exact color (gradient from `#abd0ff` → primary, or all primary blue)?
5. Should the blog post detail page (`BlogPostView`) be removed entirely or just the navigation to it?
