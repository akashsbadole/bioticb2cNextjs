export const PLATFORM_PAGE_SLUGS = new Set([
  'homepage',
  'homepage-content',
  'about-us',
  'about-page-content',
  'manufacturing',
  'mfg-page-content',
  'contact',
  'contact-page-content',
  'products',
  'products-page-content',
]);

export function isPlatformPage(slug: string): boolean {
  return PLATFORM_PAGE_SLUGS.has(slug);
}
