# CMS Blocks Look Empty While Frontend Shows Content - Fix Plan

## Overview
The important requirement is not just “frontend renders content.” The content author must be able to open the CMS block later, see the saved block/JSON data, and update it. Currently, special page payload blocks can appear empty in the admin builder even when the frontend still renders the saved data. The fix must preserve saved JSON, expose it clearly in admin, and prevent any admin save/preview path from overwriting it with defaults or an empty array.

## Required Behavior
- After a content author edits a block’s JSON/data and saves the page, the saved data must remain visible when reopening the page builder.
- The JSON tab must never silently clear valid JSON.
- The UI editor may show a summary/notice for complex page payload blocks, but it must not replace the block’s `data` with defaults or `{}`.
- The admin preview should render the block from local edited data where possible, not from stale/empty defaults.
- Frontend rendering must continue to use the same saved block data.

## Root Cause
- `useContentPage()` correctly fetches and parses `ContentPage.blocks` into `PageBlock[]` (`src/lib/use-page-content.ts:18-109`).
- Page components like `ManufacturingPage` consume a single special block via `getBlockData(blocks, 'mfg-page-content')` and fall back to `BLOCK_DEFAULTS` (`src/components/store/ManufacturingPage.tsx:56-60`).
- `PageBlockRenderer` has no switch cases for the special page-content block types, so they render as `null` in generic previews (`src/components/store/PageBlockRenderer.tsx:2698-2768`).
- `PageBuilder` only provides UI fields for generic blocks; special page-content blocks show only common style controls, so they can appear empty even though JSON data exists (`src/components/admin/PageBuilder.tsx:354-2575`).
- There is also a serialization risk: some readers defensively handle double-stringified JSON, while writes may store either canonical arrays or stringified strings. This should be normalized so the author-visible data does not become empty or corrupted after saves.

## Implementation Steps

### 1. Add a shared page-content data helper
Create or reuse a small helper that returns parsed page block data for a given slug/type.

Files:
- `src/lib/use-page-content.ts`

Actions:
- Keep existing `useContentPage()` behavior.
- Add a reusable helper, for example `getPageContentBlockData(blocks, type)`, or export a small parser to reduce duplicated parsing across `AboutPage`, `ManufacturingPage`, `ContactPage`, and `CataloguePage`.
- Ensure `null`/empty blocks safely fall back to `BLOCK_DEFAULTS`.

### 2. Let page-specific components accept direct CMS block data
Update page components so they can render from either API data or a passed block payload.

Files:
- `src/components/store/AboutPage.tsx`
- `src/components/store/ManufacturingPage.tsx`
- `src/components/store/ContactPage.tsx`
- `src/components/store/CataloguePage.tsx`

Actions:
- Add optional `data?: Record<string, unknown>` props.
- Use passed `data` when provided; otherwise continue fetching CMS data with `useContentPage()` and `getBlockData()`.
- Keep existing frontend behavior unchanged when no prop is passed.

Example shape:
```tsx
export function ManufacturingPage({
  onNavigate,
  data: externalData,
}: ManufacturingPageProps & { data?: Record<string, unknown> }) {
  const { blocks } = useContentPage('mfg-page-content');
  const cmsData = getBlockData(blocks, 'mfg-page-content');
  const data = externalData || cmsData || BLOCK_DEFAULTS['mfg-page-content'].defaultData;
  ...
}
```

### 3. Render special page-content blocks in `PageBlockRenderer`
Files:
- `src/components/store/PageBlockRenderer.tsx`

Actions:
- Import the page-specific components:
  - `AboutPage`
  - `ManufacturingPage`
  - `ContactPage`
  - `CataloguePage`
- Add switch cases:
  - `about-page-content` → `<AboutPage data={data} onNavigate={onNavigate} />`
  - `mfg-page-content` → `<ManufacturingPage data={data} onNavigate={onNavigate} />`
  - `contact-page-content` → `<ContactPage data={data} onNavigate={onNavigate} />`
  - `catalogue-page-content` → `<CataloguePage data={data} onNavigate={onNavigate} />`
- This makes admin builder preview use the block's local data instead of rendering `null`.

### 4. Make `PageBuilder` show that page-content blocks contain data
Files:
- `src/components/admin/PageBuilder.tsx`

Actions:
- In `SortableBlockCard`, safely handle missing defaults:
  - Use `defaults?.label || block.type` instead of `defaults.label`.
- In `BlockEditDialog`, add a visible notice for special page-content blocks when the UI editor has no dedicated fields:
  - Example: “This is a full page payload. Use the JSON Editor tab to edit nested fields.”
- Add a small summary under the JSON tab showing top-level field count and key names, so the block does not feel empty:
  - Example: “Top-level fields: hero, metrics, intro, productionLines…”
- Recommended next enhancement: add dedicated UI editor sections for common `mfg-page-content` fields (`hero`, `metrics`, `intro`, `productionLines`, `qualitySteps`, `privateLabel`, `certifications`, `cta`) so users can edit without raw JSON.

### 5. Add a persistence/visibility regression test for block JSON
Files:
- `src/components/admin/PageBuilder.tsx`
- `src/components/admin/AdminPages.tsx`
- `src/app/api/content-pages/[id]/route.ts`
- `src/lib/use-page-content.ts`

Actions:
- Add a small helper to normalize block payloads before save/read:
  - If the value is already an array, keep it.
  - If it is a JSON string, parse once.
  - If it is a double-stringified JSON string, parse until it becomes an array/object.
  - If parsing fails, keep the original value and show a validation error instead of saving `{}`.
- In `AdminPages.handleOpenBuilder`, use the same helper so the builder opens with the exact saved block data.
- In `BlockEditDialog.handleOpen`, use the same helper and only write to `localData`/`jsonText` after successful parsing.
- In `handleBuilderSave`, send the normalized `builderBlocks` array. If invalid, show an error and do not overwrite the saved page.
- In the API update route, validate `body.blocks` before writing so an invalid payload cannot replace saved CMS data with `[]` or a bad string.

### 6. Normalize block serialization to avoid double-stringified data
Files:
- `src/app/api/content-pages/route.ts`
- `src/app/api/content-pages/[id]/route.ts`
- `src/lib/validations.ts`

Actions:
- Prefer canonical JSON array strings in API writes: `[{"id":...}]`.
- Keep defensive parsing in readers so existing double-stringified records still work.
- Avoid changing the public API response shape.
- Do not let `ContentPageSchema` or the update route transform an already-valid array into an empty string.

### 7. Add regression checks
Actions:
- Open admin Content Pages.
- Open the builder for a page using `mfg-page-content`.
- Edit JSON data in the block.
- Confirm the builder preview shows the edited content before saving.
- Save the page.
- Refresh admin builder and confirm the block still shows data.
- Open frontend manufacturing/about/contact/catalogue pages and confirm content still renders.

## Validation
Run:
```bash
npx tsc --noEmit
npm run lint
```

Manual checks:
- Admin Page Builder opens an existing page-content block with the saved JSON visible.
- Editing JSON and saving does not clear or replace the block data.
- Reopening the same page after refresh still shows the saved JSON.
- Admin Page Builder preview for `mfg-page-content` is not empty.
- Frontend pages still render their CMS content.

## Open Question
If the goal is to avoid JSON editing, the next step is to build full UI editor controls for nested page payloads. This is larger than the rendering/persistence fix and should be scoped separately.
