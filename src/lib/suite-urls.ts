const SUITE_BASE_URLS = {
  host: "https://glint-host-registry.vercel.app",
  label: "https://glint-label-registry.vercel.app",
  product: "https://glint-product-registry.vercel.app",
} as const;

export type SuiteProductKey = keyof typeof SUITE_BASE_URLS;

/** Locale-aware public URL for a Glint suite product (same path on each site). */
export function suiteProductUrl(product: SuiteProductKey, locale: string, path = ""): string {
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${SUITE_BASE_URLS[product]}/${locale}${normalizedPath}`;
}
