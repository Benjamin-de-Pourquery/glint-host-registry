import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl, SITE_NAME } from "./site";
import {
  buildLocalizedGuidePath,
  getGuideLocalePair,
  getPageLocales,
  getPublicSitemapEntries,
} from "./guide-routing";
import type { SeoPageKey } from "./page-paths";
import { PAGE_PATHS } from "./page-paths";

export type { SeoPageKey } from "./page-paths";
export {
  buildLocalizedGuidePath,
  getGuideLocalePairs,
  getGuideSlugToPageMap,
  getPageLocales,
  getPublicSitemapEntries,
  resolveGuidePathForLocale,
  resolveGuideSlugRedirect,
  switchLocaleInPathname,
} from "./guide-routing";

type Locale = (typeof routing.locales)[number];

function localeOpenGraphLocale(locale: Locale): string {
  return locale === "fr" ? "fr_FR" : "en_US";
}

function alternateOpenGraphLocales(locale: Locale): string[] {
  return routing.locales
    .filter((l) => l !== locale)
    .map((l) => (l === "fr" ? "fr_FR" : "en_US"));
}

export function buildLocalizedPath(locale: Locale, page: SeoPageKey): string {
  if (page.startsWith("guide")) {
    return buildLocalizedGuidePath(locale, page);
  }
  const suffix = PAGE_PATHS[page];
  return `/${locale}${suffix}`;
}

export function buildCanonicalUrl(locale: Locale, page: SeoPageKey): string {
  return `${getSiteUrl()}${buildLocalizedPath(locale, page)}`;
}

export function buildLanguageAlternates(page: SeoPageKey): Record<string, string> {
  const pair = getGuideLocalePair(page);
  if (pair) {
    return {
      en: buildCanonicalUrl("en", pair.en),
      fr: buildCanonicalUrl("fr", pair.fr),
      "x-default": buildCanonicalUrl(routing.defaultLocale, pair.en),
    };
  }
  const singleLocales = getPageLocales(page);
  if (singleLocales.length === 1) {
    const only = singleLocales[0];
    const url = buildCanonicalUrl(only, page);
    return {
      [only]: url,
      "x-default": url,
    };
  }
  const alternates: Record<string, string> = {};
  for (const locale of routing.locales) {
    alternates[locale] = buildCanonicalUrl(locale, page);
  }
  alternates["x-default"] = buildCanonicalUrl(routing.defaultLocale, page);
  return alternates;
}

/** Branded document title (root layout template also appends the site name). */
export function formatBrandedPageTitle(title: string): string {
  return `${title} | ${SITE_NAME}`;
}

type BuildMetadataOptions = {
  locale: Locale;
  page: SeoPageKey;
  title: string;
  description: string;
  noIndex?: boolean;
};

export function buildPageMetadata({
  locale,
  page,
  title,
  description,
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const canonical = buildCanonicalUrl(locale, page);
  const brandedTitle = formatBrandedPageTitle(title);

  return {
    title,
    description,
    metadataBase: new URL(getSiteUrl()),
    alternates: {
      canonical,
      languages: buildLanguageAlternates(page),
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      locale: localeOpenGraphLocale(locale),
      alternateLocale: alternateOpenGraphLocales(locale),
      title: brandedTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
  };
}

export const NOINDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export type PublicSitemapEntry = {
  locale: Locale;
  path: string;
  page: SeoPageKey;
};

/** @deprecated Use getPublicSitemapEntries for locale-aware sitemap rows. */
export function getPublicSitemapPaths(): Array<{ path: string; page: SeoPageKey }> {
  return getPublicSitemapEntries().map(({ path, page }) => ({ path, page }));
}
