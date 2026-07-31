import { StoreShell } from "@/components/store/StoreShell";
import { getHomeInitialData } from "@/lib/storefront-data";

// ISR: rebuild this page on-demand when admin writes invalidate the tags
// (CACHE_TAGS.products / categories), with this SWR fallback window.
export const revalidate = 300;

export default async function HomePage() {
  const data = await getHomeInitialData();

  return (
    <StoreShell
      initialPage="home"
      initialData={data ? { home: data } : undefined}
    />
  );
}
