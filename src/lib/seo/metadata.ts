import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl, SITE_NAME } from "./site";

type Locale = (typeof routing.locales)[number];

export type SeoPageKey =
  | "home"
  | "login"
  | "signup"
  | "forgotPassword"
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
  | "guideFrNerMigration";

const PAGE_PATHS: Record<SeoPageKey, string> = {
  home: "",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
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
  guideFrNerMigration: "/guides/migration-ner-2026",
};

function localeOpenGraphLocale(locale: Locale): string {
  return locale === "fr" ? "fr_FR" : "en_US";
}

function alternateOpenGraphLocales(locale: Locale): string[] {
  return routing.locales
    .filter((l) => l !== locale)
    .map((l) => (l === "fr" ? "fr_FR" : "en_US"));
}

export function buildLocalizedPath(locale: Locale, page: SeoPageKey): string {
  const suffix = PAGE_PATHS[page];
  return `/${locale}${suffix}`;
}

export function buildCanonicalUrl(locale: Locale, page: SeoPageKey): string {
  return `${getSiteUrl()}${buildLocalizedPath(locale, page)}`;
}

export function buildLanguageAlternates(page: SeoPageKey): Record<string, string> {
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
  const fullTitle = page === "home" ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
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
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
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

export function getPublicSitemapPaths(): Array<{ path: string; page: SeoPageKey }> {
  return (Object.entries(PAGE_PATHS) as Array<[SeoPageKey, string]>).map(
    ([page, path]) => ({ path, page })
  );
}
