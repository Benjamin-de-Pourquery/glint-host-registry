import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLanguageAlternates,
  buildCanonicalUrl,
  buildPageMetadata,
  formatBrandedPageTitle,
  getPublicSitemapEntries,
} from "@/lib/seo/metadata";
import {
  getGuideLocalePairs,
  resolveGuidePathForLocale,
  resolveGuideSlugRedirect,
  switchLocaleInPathname,
} from "@/lib/seo/guide-routing";
import { countGuideIndexLinks } from "@/lib/guides/visible-in-locale";
import { GUIDE_INDEX_GROUPS } from "@/lib/guides/catalog";
import { PAGE_PATHS } from "@/lib/seo/page-paths";
import { SITE_NAME } from "@/lib/seo/site";

const PAIRED_GUIDE_IDS = [
  "belgium",
  "brusselsAirbnb",
  "viennaStr",
  "viennaAirbnb",
  "berlinStr",
  "berlinAirbnb",
  "munichStr",
  "munichAirbnb",
  "barcelonaStr",
  "barcelonaAirbnb",
  "madridStr",
  "madridAirbnb",
  "valenciaStr",
  "valenciaAirbnb",
  "malagaStr",
  "malagaAirbnb",
  "sevilleStr",
  "sevilleAirbnb",
  "amsterdamStr",
  "amsterdamAirbnb",
  "irelandStr",
  "dublinAirbnb",
  "parisStr",
  "parisAirbnb",
  "lyonStr",
  "lyonAirbnb",
  "marseilleStr",
  "marseilleAirbnb",
  "bordeauxStr",
  "bordeauxAirbnb",
] as const;

const PAIR_KEYS: Record<(typeof PAIRED_GUIDE_IDS)[number], [string, string]> = {
  belgium: ["guideBelgiumStrRegistration", "guideBelgiumStrRegistrationFr"],
  brusselsAirbnb: ["guideBrusselsAirbnbRegistration", "guideBrusselsAirbnbRegistrationFr"],
  viennaStr: ["guideViennaStrRegistration", "guideViennaStrRegistrationFr"],
  viennaAirbnb: ["guideViennaAirbnbRegistration", "guideViennaAirbnbRegistrationFr"],
  berlinStr: ["guideBerlinStrRegistration", "guideBerlinStrRegistrationFr"],
  berlinAirbnb: ["guideBerlinAirbnbRegistration", "guideBerlinAirbnbRegistrationFr"],
  munichStr: ["guideMunichStrRegistration", "guideMunichStrRegistrationFr"],
  munichAirbnb: ["guideMunichAirbnbRegistration", "guideMunichAirbnbRegistrationFr"],
  barcelonaStr: ["guideBarcelonaStrRegistration", "guideBarcelonaStrRegistrationFr"],
  barcelonaAirbnb: ["guideBarcelonaAirbnbRegistration", "guideBarcelonaAirbnbRegistrationFr"],
  madridStr: ["guideMadridStrRegistration", "guideMadridStrRegistrationFr"],
  madridAirbnb: ["guideMadridAirbnbRegistration", "guideMadridAirbnbRegistrationFr"],
  valenciaStr: ["guideValenciaStrRegistration", "guideValenciaStrRegistrationFr"],
  valenciaAirbnb: ["guideValenciaAirbnbRegistration", "guideValenciaAirbnbRegistrationFr"],
  malagaStr: ["guideMalagaStrRegistration", "guideMalagaStrRegistrationFr"],
  malagaAirbnb: ["guideMalagaAirbnbRegistration", "guideMalagaAirbnbRegistrationFr"],
  sevilleStr: ["guideSevilleStrRegistration", "guideSevilleStrRegistrationFr"],
  sevilleAirbnb: ["guideSevilleAirbnbRegistration", "guideSevilleAirbnbRegistrationFr"],
  amsterdamStr: ["guideAmsterdamStrRegistration", "guideAmsterdamStrRegistrationFr"],
  amsterdamAirbnb: ["guideAmsterdamAirbnbRegistration", "guideAmsterdamAirbnbRegistrationFr"],
  irelandStr: ["guideIrelandStrRegistration", "guideIrelandStrRegistrationFr"],
  dublinAirbnb: ["guideDublinAirbnbRegistration", "guideDublinAirbnbRegistrationFr"],
  parisStr: ["guideParisStrRegistration", "guideParisStrRegistrationFr"],
  parisAirbnb: ["guideParisAirbnbRegistration", "guideParisAirbnbRegistrationFr"],
  lyonStr: ["guideLyonStrRegistration", "guideLyonStrRegistrationFr"],
  lyonAirbnb: ["guideLyonAirbnbRegistration", "guideLyonAirbnbRegistrationFr"],
  marseilleStr: ["guideMarseilleStrRegistration", "guideMarseilleStrRegistrationFr"],
  marseilleAirbnb: [
    "guideMarseilleAirbnbRegistration",
    "guideMarseilleAirbnbRegistrationFr",
  ],
  bordeauxStr: ["guideBordeauxStrRegistration", "guideBordeauxStrRegistrationFr"],
  bordeauxAirbnb: [
    "guideBordeauxAirbnbRegistration",
    "guideBordeauxAirbnbRegistrationFr",
  ],
};

function enSlug(enKey: string): string {
  return PAGE_PATHS[enKey as keyof typeof PAGE_PATHS].replace("/guides/", "");
}

function frSlug(frKey: string): string {
  return PAGE_PATHS[frKey as keyof typeof PAGE_PATHS].replace("/guides/", "");
}

describe("paired city guide redirects", () => {
  for (const id of PAIRED_GUIDE_IDS) {
    const [enKey, frKey] = PAIR_KEYS[id];
    const en = enSlug(enKey);
    const fr = frSlug(frKey);

    it(`${id}: French slug on /en redirects to English slug`, () => {
      assert.equal(resolveGuideSlugRedirect("en", fr), `/en/guides/${en}`);
    });

    it(`${id}: English slug on /fr redirects to French slug`, () => {
      assert.equal(resolveGuideSlugRedirect("fr", en), `/fr/guides/${fr}`);
    });

    it(`${id}: canonical slug/locale pairs do not redirect`, () => {
      assert.equal(resolveGuideSlugRedirect("en", en), null);
      assert.equal(resolveGuideSlugRedirect("fr", fr), null);
    });
  }
});

describe("single-locale and shared guides", () => {
  it("NER migration on /en redirects to /fr", () => {
    assert.equal(
      resolveGuideSlugRedirect("en", "migration-ner-2026"),
      "/fr/guides/migration-ner-2026"
    );
  });

  it("numero-enregistrement is available on both locales", () => {
    assert.equal(resolveGuideSlugRedirect("en", "numero-enregistrement-meuble"), null);
    assert.equal(resolveGuideSlugRedirect("fr", "numero-enregistrement-meuble"), null);
  });

  it("SES hospedajes is available on both locales", () => {
    assert.equal(resolveGuideSlugRedirect("en", "ses-hospedajes-espagne"), null);
    assert.equal(resolveGuideSlugRedirect("fr", "ses-hospedajes-espagne"), null);
  });

  it("returns null for unknown slugs", () => {
    assert.equal(resolveGuideSlugRedirect("en", "not-a-real-guide-slug"), null);
  });

  it("Valencia STR French slug on /en redirects to English slug", () => {
    assert.equal(
      resolveGuideSlugRedirect("en", "enregistrement-location-courte-duree-valence"),
      "/en/guides/valencia-short-term-rental-registration"
    );
  });
});

describe("language switcher paths", () => {
  it("swaps Madrid STR slug when changing locale", () => {
    assert.equal(
      switchLocaleInPathname("/en/guides/madrid-short-term-rental-registration", "fr"),
      "/fr/guides/enregistrement-location-courte-duree-madrid"
    );
    assert.equal(
      switchLocaleInPathname("/fr/guides/enregistrement-location-courte-duree-madrid", "en"),
      "/en/guides/madrid-short-term-rental-registration"
    );
  });

  it("keeps NER migration on /fr when switching from /en path", () => {
    assert.equal(
      resolveGuidePathForLocale("migration-ner-2026", "en"),
      "/fr/guides/migration-ner-2026"
    );
  });
});

describe("hreflang alternates", () => {
  for (const id of PAIRED_GUIDE_IDS) {
    const [enKey, frKey] = PAIR_KEYS[id];
    const en = enSlug(enKey);
    const fr = frSlug(frKey);

    it(`${id}: alternates pair EN and FR slugs`, () => {
      const alternates = buildLanguageAlternates(enKey as keyof typeof PAGE_PATHS);
      assert.match(alternates.en, new RegExp(`/en/guides/${en}$`));
      assert.match(alternates.fr, new RegExp(`/fr/guides/${fr}$`));
      assert.match(alternates["x-default"], new RegExp(`/en/guides/${en}$`));
    });
  }

  it("shared SES guide uses the same slug in both locales", () => {
    const alternates = buildLanguageAlternates("guideSes");
    assert.match(alternates.en, /\/en\/guides\/ses-hospedajes-espagne$/);
    assert.match(alternates.fr, /\/fr\/guides\/ses-hospedajes-espagne$/);
  });

  it("NER migration alternate is French only", () => {
    const alternates = buildLanguageAlternates("guideFrNerMigration");
    assert.match(alternates.fr, /\/fr\/guides\/migration-ner-2026$/);
    assert.equal(alternates.en, undefined);
  });
});

describe("canonical URLs", () => {
  it("Madrid FR metadata canonical stays on /fr with French slug", () => {
    const url = buildCanonicalUrl("fr", "guideMadridStrRegistrationFr");
    assert.match(url, /\/fr\/guides\/enregistrement-location-courte-duree-madrid$/);
  });

  it("wrong-locale request metadata would canonicalize to correct locale path", () => {
    const url = buildCanonicalUrl("en", "guideMadridStrRegistrationFr");
    assert.match(url, /\/en\/guides\/madrid-short-term-rental-registration$/);
  });
});

describe("sitemap entries", () => {
  it("lists each locale-specific city slug only under its locale", () => {
    const urls = getPublicSitemapEntries().map(({ locale, path }) => `/${locale}${path}`);
    assert.ok(urls.includes("/en/guides/madrid-short-term-rental-registration"));
    assert.ok(urls.includes("/fr/guides/enregistrement-location-courte-duree-madrid"));
    assert.ok(!urls.includes("/en/guides/enregistrement-location-courte-duree-madrid"));
    assert.ok(!urls.includes("/fr/guides/madrid-short-term-rental-registration"));
    assert.ok(urls.includes("/en/guides/valencia-short-term-rental-registration"));
    assert.ok(urls.includes("/fr/guides/enregistrement-location-courte-duree-valence"));
    assert.ok(!urls.includes("/en/guides/enregistrement-location-courte-duree-valence"));
    assert.ok(!urls.includes("/fr/guides/valencia-short-term-rental-registration"));
    assert.ok(urls.includes("/en/guides/amsterdam-short-term-rental-registration"));
    assert.ok(urls.includes("/fr/guides/enregistrement-location-courte-duree-amsterdam"));
    assert.ok(!urls.includes("/en/guides/enregistrement-location-courte-duree-amsterdam"));
    assert.ok(!urls.includes("/fr/guides/amsterdam-short-term-rental-registration"));
    assert.ok(urls.includes("/en/guides/paris-short-term-rental-registration"));
    assert.ok(urls.includes("/fr/guides/enregistrement-location-courte-duree-paris"));
    assert.ok(!urls.includes("/en/guides/enregistrement-location-courte-duree-paris"));
    assert.ok(!urls.includes("/fr/guides/paris-short-term-rental-registration"));
  });

  it("lists NER migration only under /fr", () => {
    const urls = getPublicSitemapEntries().map(({ locale, path }) => `/${locale}${path}`);
    assert.ok(urls.includes("/fr/guides/migration-ner-2026"));
    assert.ok(!urls.includes("/en/guides/migration-ner-2026"));
  });

  it("lists numero-enregistrement under both locales", () => {
    const urls = getPublicSitemapEntries().map(({ locale, path }) => `/${locale}${path}`);
    assert.ok(urls.includes("/en/guides/numero-enregistrement-meuble"));
    assert.ok(urls.includes("/fr/guides/numero-enregistrement-meuble"));
  });

  it("covers every paired guide id in the registry", () => {
    assert.equal(getGuideLocalePairs().length, PAIRED_GUIDE_IDS.length);
  });
});

describe("formatBrandedPageTitle", () => {
  it("appends the site name exactly once", () => {
    const title = "Madrid short-term rental registration: VUT host guide";
    assert.equal(formatBrandedPageTitle(title), `${title} | ${SITE_NAME}`);
  });
});

describe("buildPageMetadata title", () => {
  it("uses the raw title so the root layout template adds the brand once", () => {
    const meta = buildPageMetadata({
      locale: "en",
      page: "guideMadridStrRegistration",
      title: "Madrid short-term rental registration: VUT host guide",
      description: "Test description",
    });
    assert.equal(meta.title, "Madrid short-term rental registration: VUT host guide");
    assert.equal(
      meta.openGraph?.title,
      `Madrid short-term rental registration: VUT host guide | ${SITE_NAME}`
    );
  });

  it("includes openGraph and twitter preview images", () => {
    const meta = buildPageMetadata({
      locale: "en",
      page: "home",
      title: "Home",
      description: "Test",
    });
    const ogImages = meta.openGraph?.images;
    assert.ok(ogImages);
    const first = Array.isArray(ogImages) ? ogImages[0] : ogImages;
    const ogUrl =
      typeof first === "string"
        ? first
        : first instanceof URL
          ? first.toString()
          : String((first as { url: string }).url);
    assert.match(ogUrl, /opengraph-image$/);
    const twitterImages = meta.twitter?.images;
    const twitterList = Array.isArray(twitterImages)
      ? twitterImages
      : twitterImages
        ? [twitterImages]
        : [];
    assert.ok(twitterList.length > 0);
  });
});

describe("guides index sitemap", () => {
  it("lists /en/guides and /fr/guides hub paths", () => {
    const urls = getPublicSitemapEntries().map(({ locale, path }) => `/${locale}${path}`);
    assert.ok(urls.includes("/en/guides"));
    assert.ok(urls.includes("/fr/guides"));
  });

  it("indexes every locale guide URL listed in the sitemap", () => {
    const guidePathsInSitemap = (locale: "en" | "fr") =>
      getPublicSitemapEntries().filter(
        ({ locale: loc, path }) => loc === locale && path.startsWith("/guides/"),
      ).length;

    assert.equal(countGuideIndexLinks("en"), 38);
    assert.equal(countGuideIndexLinks("fr"), 39);
    assert.equal(countGuideIndexLinks("en"), guidePathsInSitemap("en"));
    assert.equal(countGuideIndexLinks("fr"), guidePathsInSitemap("fr"));
    assert.equal(GUIDE_INDEX_GROUPS.length, 11);
  });
});
