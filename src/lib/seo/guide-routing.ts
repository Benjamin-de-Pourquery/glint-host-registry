import { routing } from "@/i18n/routing";
import type { SeoPageKey } from "./page-paths";
import { PAGE_PATHS } from "./page-paths";

type Locale = (typeof routing.locales)[number];

/** City guides with distinct EN and FR URL slugs (same topic, locale-specific paths). */
const GUIDE_LOCALE_PAIRS: ReadonlyArray<readonly [SeoPageKey, SeoPageKey]> = [
  ["guideBelgiumStrRegistration", "guideBelgiumStrRegistrationFr"],
  ["guideBrusselsAirbnbRegistration", "guideBrusselsAirbnbRegistrationFr"],
  ["guideViennaStrRegistration", "guideViennaStrRegistrationFr"],
  ["guideViennaAirbnbRegistration", "guideViennaAirbnbRegistrationFr"],
  ["guideBerlinStrRegistration", "guideBerlinStrRegistrationFr"],
  ["guideBerlinAirbnbRegistration", "guideBerlinAirbnbRegistrationFr"],
  ["guideMunichStrRegistration", "guideMunichStrRegistrationFr"],
  ["guideMunichAirbnbRegistration", "guideMunichAirbnbRegistrationFr"],
  ["guideBarcelonaStrRegistration", "guideBarcelonaStrRegistrationFr"],
  ["guideBarcelonaAirbnbRegistration", "guideBarcelonaAirbnbRegistrationFr"],
  ["guideMadridStrRegistration", "guideMadridStrRegistrationFr"],
  ["guideMadridAirbnbRegistration", "guideMadridAirbnbRegistrationFr"],
  ["guideValenciaStrRegistration", "guideValenciaStrRegistrationFr"],
  ["guideValenciaAirbnbRegistration", "guideValenciaAirbnbRegistrationFr"],
  ["guideMalagaStrRegistration", "guideMalagaStrRegistrationFr"],
  ["guideMalagaAirbnbRegistration", "guideMalagaAirbnbRegistrationFr"],
  ["guideSevilleStrRegistration", "guideSevilleStrRegistrationFr"],
  ["guideSevilleAirbnbRegistration", "guideSevilleAirbnbRegistrationFr"],
  ["guideAmsterdamStrRegistration", "guideAmsterdamStrRegistrationFr"],
  ["guideAmsterdamAirbnbRegistration", "guideAmsterdamAirbnbRegistrationFr"],
  ["guideIrelandStrRegistration", "guideIrelandStrRegistrationFr"],
  ["guideDublinAirbnbRegistration", "guideDublinAirbnbRegistrationFr"],
  ["guideParisStrRegistration", "guideParisStrRegistrationFr"],
  ["guideParisAirbnbRegistration", "guideParisAirbnbRegistrationFr"],
  ["guideLyonStrRegistration", "guideLyonStrRegistrationFr"],
  ["guideLyonAirbnbRegistration", "guideLyonAirbnbRegistrationFr"],
];

/** Guides served only under one locale (no translated slug pair). */
const GUIDE_SINGLE_LOCALE: Partial<Record<SeoPageKey, Locale>> = {
  guideFrNerMigration: "fr",
};

const PAGE_LOCALE_PAIR = new Map<SeoPageKey, { en: SeoPageKey; fr: SeoPageKey }>();
for (const [enKey, frKey] of GUIDE_LOCALE_PAIRS) {
  PAGE_LOCALE_PAIR.set(enKey, { en: enKey, fr: frKey });
  PAGE_LOCALE_PAIR.set(frKey, { en: enKey, fr: frKey });
}

const GUIDE_SLUG_TO_PAGE = new Map<string, SeoPageKey>();
for (const [page, path] of Object.entries(PAGE_PATHS) as Array<[SeoPageKey, string]>) {
  if (!path.startsWith("/guides/")) {
    continue;
  }
  GUIDE_SLUG_TO_PAGE.set(path.slice("/guides/".length), page);
}

export function getGuideSlugToPageMap(): ReadonlyMap<string, SeoPageKey> {
  return GUIDE_SLUG_TO_PAGE;
}

export function getGuideLocalePairs(): ReadonlyArray<readonly [SeoPageKey, SeoPageKey]> {
  return GUIDE_LOCALE_PAIRS;
}

export function getPageLocales(page: SeoPageKey): Locale[] {
  const single = GUIDE_SINGLE_LOCALE[page];
  if (single) {
    return [single];
  }
  if (PAGE_LOCALE_PAIR.has(page)) {
    return page.endsWith("Fr") ? ["fr"] : ["en"];
  }
  return [...routing.locales];
}

export function getLocalizedPageKey(page: SeoPageKey, locale: Locale): SeoPageKey {
  const pair = PAGE_LOCALE_PAIR.get(page);
  if (pair) {
    return locale === "fr" ? pair.fr : pair.en;
  }
  return page;
}

function guidePathForLocale(page: SeoPageKey, locale: Locale): string {
  const targetPage = getLocalizedPageKey(page, locale);
  const allowedLocales = getPageLocales(targetPage);
  const effectiveLocale = allowedLocales.includes(locale) ? locale : allowedLocales[0];
  const effectivePage = getLocalizedPageKey(page, effectiveLocale);
  return `/${effectiveLocale}${PAGE_PATHS[effectivePage]}`;
}

export function getGuideLocalePair(
  page: SeoPageKey
): { en: SeoPageKey; fr: SeoPageKey } | undefined {
  return PAGE_LOCALE_PAIR.get(page);
}

/**
 * When a guide slug is valid but not for the requested locale, return the
 * locale-correct path (308 target). Unknown slugs return null (404).
 */
export function resolveGuideSlugRedirect(locale: Locale, slug: string): string | null {
  const page = GUIDE_SLUG_TO_PAGE.get(slug);
  if (!page) {
    return null;
  }
  if (getPageLocales(page).includes(locale)) {
    return null;
  }
  return guidePathForLocale(page, locale);
}

/** Target URL when switching site locale on a guide path (or null if not a guide). */
export function resolveGuidePathForLocale(slug: string, targetLocale: Locale): string | null {
  const page = GUIDE_SLUG_TO_PAGE.get(slug);
  if (!page) {
    return null;
  }
  return guidePathForLocale(page, targetLocale);
}

export function switchLocaleInPathname(pathname: string, targetLocale: Locale): string {
  const match = pathname.match(/^\/(en|fr)(\/.*)?$/);
  if (!match) {
    return `/${targetLocale}`;
  }
  const rest = match[2] ?? "";
  const guideMatch = rest.match(/^\/guides\/([^/]+)\/?$/);
  if (guideMatch) {
    const guideUrl = resolveGuidePathForLocale(guideMatch[1], targetLocale);
    if (guideUrl) {
      return guideUrl;
    }
  }
  return `/${targetLocale}${rest}`;
}

export type PublicSitemapEntry = {
  locale: Locale;
  path: string;
  page: SeoPageKey;
};

export function getPublicSitemapEntries(): PublicSitemapEntry[] {
  const entries: PublicSitemapEntry[] = [];
  for (const [page, path] of Object.entries(PAGE_PATHS) as Array<[SeoPageKey, string]>) {
    if (page === "forgotPassword" || page === "resetPassword") {
      continue;
    }
    for (const locale of getPageLocales(page)) {
      entries.push({ locale, path, page });
    }
  }
  return entries;
}

export function buildLocalizedGuidePath(locale: Locale, page: SeoPageKey): string {
  return guidePathForLocale(page, locale);
}
