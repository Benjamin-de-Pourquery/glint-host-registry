import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl, SITE_NAME } from "./site";

type Locale = (typeof routing.locales)[number];

export type SeoPageKey =
  | "home"
  | "login"
  | "signup"
  | "forgotPassword"
  | "resetPassword"
  | "privacy"
  | "terms"
  | "mentions"
  | "guideRegistration"
  | "guideSes"
  | "guideGuestRegister"
  | "guideAmsterdamNightCap"
  | "guideItalyCinAlloggiati"
  | "guidePortugalRnalSiba"
  | "guideGreeceAmaAade"
  | "guideCroatiaEvisitor"
  | "guideBelgiumStrRegistration"
  | "guideBelgiumStrRegistrationFr"
  | "guideBrusselsAirbnbRegistration"
  | "guideBrusselsAirbnbRegistrationFr"
  | "guideViennaStrRegistration"
  | "guideViennaStrRegistrationFr"
  | "guideViennaAirbnbRegistration"
  | "guideViennaAirbnbRegistrationFr"
  | "guideBerlinStrRegistration"
  | "guideBerlinStrRegistrationFr"
  | "guideBerlinAirbnbRegistration"
  | "guideBerlinAirbnbRegistrationFr"
  | "guideMunichStrRegistration"
  | "guideMunichStrRegistrationFr"
  | "guideMunichAirbnbRegistration"
  | "guideMunichAirbnbRegistrationFr"
  | "guideBarcelonaStrRegistration"
  | "guideBarcelonaStrRegistrationFr"
  | "guideBarcelonaAirbnbRegistration"
  | "guideBarcelonaAirbnbRegistrationFr"
  | "guideMadridStrRegistration"
  | "guideMadridStrRegistrationFr"
  | "guideMadridAirbnbRegistration"
  | "guideMadridAirbnbRegistrationFr"
  | "guideFrNerMigration";

const PAGE_PATHS: Record<SeoPageKey, string> = {
  home: "",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  privacy: "/legal/privacy",
  terms: "/legal/terms",
  mentions: "/legal/mentions",
  guideRegistration: "/guides/numero-enregistrement-meuble",
  guideSes: "/guides/ses-hospedajes-espagne",
  guideGuestRegister: "/guides/fiche-police-voyageurs",
  guideAmsterdamNightCap: "/guides/amsterdam-night-cap",
  guideItalyCinAlloggiati: "/guides/italy-cin-alloggiati",
  guidePortugalRnalSiba: "/guides/rnal-siba-portugal",
  guideGreeceAmaAade: "/guides/greece-ama-aade",
  guideCroatiaEvisitor: "/guides/croatia-evisitor",
  guideBelgiumStrRegistration: "/guides/belgium-short-term-rental-registration",
  guideBelgiumStrRegistrationFr: "/guides/enregistrement-location-courte-duree-belgique",
  guideBrusselsAirbnbRegistration: "/guides/brussels-airbnb-registration",
  guideBrusselsAirbnbRegistrationFr: "/guides/enregistrement-airbnb-bruxelles",
  guideViennaStrRegistration: "/guides/vienna-short-term-rental-registration",
  guideViennaStrRegistrationFr: "/guides/enregistrement-location-courte-duree-vienne",
  guideViennaAirbnbRegistration: "/guides/vienna-airbnb-registration",
  guideViennaAirbnbRegistrationFr: "/guides/enregistrement-airbnb-vienne",
  guideBerlinStrRegistration: "/guides/berlin-short-term-rental-registration",
  guideBerlinStrRegistrationFr: "/guides/enregistrement-location-courte-duree-berlin",
  guideBerlinAirbnbRegistration: "/guides/berlin-airbnb-registration",
  guideBerlinAirbnbRegistrationFr: "/guides/enregistrement-airbnb-berlin",
  guideMunichStrRegistration: "/guides/munich-short-term-rental-registration",
  guideMunichStrRegistrationFr:
    "/guides/enregistrement-location-courte-duree-munich",
  guideMunichAirbnbRegistration: "/guides/munich-airbnb-registration",
  guideMunichAirbnbRegistrationFr: "/guides/enregistrement-airbnb-munich",
  guideBarcelonaStrRegistration: "/guides/barcelona-short-term-rental-registration",
  guideBarcelonaStrRegistrationFr:
    "/guides/enregistrement-location-courte-duree-barcelone",
  guideBarcelonaAirbnbRegistration: "/guides/barcelona-airbnb-registration",
  guideBarcelonaAirbnbRegistrationFr: "/guides/enregistrement-airbnb-barcelone",
  guideMadridStrRegistration: "/guides/madrid-short-term-rental-registration",
  guideMadridStrRegistrationFr:
    "/guides/enregistrement-location-courte-duree-madrid",
  guideMadridAirbnbRegistration: "/guides/madrid-airbnb-registration",
  guideMadridAirbnbRegistrationFr: "/guides/enregistrement-airbnb-madrid",
  guideFrNerMigration: "/guides/migration-ner-2026",
};

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
];

const PAGE_LOCALE_PAIR = new Map<SeoPageKey, { en: SeoPageKey; fr: SeoPageKey }>();
for (const [enKey, frKey] of GUIDE_LOCALE_PAIRS) {
  PAGE_LOCALE_PAIR.set(enKey, { en: enKey, fr: frKey });
  PAGE_LOCALE_PAIR.set(frKey, { en: enKey, fr: frKey });
}

const GUIDE_SLUG_TO_PAGE = new Map<string, SeoPageKey>();
for (const [page, path] of Object.entries(PAGE_PATHS) as Array<[SeoPageKey, string]>) {
  if (!path.startsWith("/guides/")) continue;
  GUIDE_SLUG_TO_PAGE.set(path.slice("/guides/".length), page);
}

export function getPageLocales(page: SeoPageKey): Locale[] {
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
  const targetPage = getLocalizedPageKey(page, locale);
  const targetPath = PAGE_PATHS[targetPage];
  return `/${locale}${targetPath}`;
}

/** Branded document title (root layout template also appends the site name). */
export function formatBrandedPageTitle(title: string): string {
  return `${title} | ${SITE_NAME}`;
}

function localeOpenGraphLocale(locale: Locale): string {
  return locale === "fr" ? "fr_FR" : "en_US";
}

function alternateOpenGraphLocales(locale: Locale): string[] {
  return routing.locales
    .filter((l) => l !== locale)
    .map((l) => (l === "fr" ? "fr_FR" : "en_US"));
}

export function buildLocalizedPath(locale: Locale, page: SeoPageKey): string {
  const localizedPage = getLocalizedPageKey(page, locale);
  const suffix = PAGE_PATHS[localizedPage];
  return `/${locale}${suffix}`;
}

export function buildCanonicalUrl(locale: Locale, page: SeoPageKey): string {
  return `${getSiteUrl()}${buildLocalizedPath(locale, page)}`;
}

export function buildLanguageAlternates(page: SeoPageKey): Record<string, string> {
  const pair = PAGE_LOCALE_PAIR.get(page);
  if (pair) {
    return {
      en: buildCanonicalUrl("en", pair.en),
      fr: buildCanonicalUrl("fr", pair.fr),
      "x-default": buildCanonicalUrl(routing.defaultLocale, pair.en),
    };
  }
  const alternates: Record<string, string> = {};
  for (const locale of routing.locales) {
    alternates[locale] = buildCanonicalUrl(locale, page);
  }
  alternates["x-default"] = buildCanonicalUrl(routing.defaultLocale, page);
  return alternates;
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

/** @deprecated Use getPublicSitemapEntries for locale-aware sitemap rows. */
export function getPublicSitemapPaths(): Array<{ path: string; page: SeoPageKey }> {
  return getPublicSitemapEntries().map(({ path, page }) => ({ path, page }));
}
