import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLanguageAlternates,
  buildPageMetadata,
  formatBrandedPageTitle,
  getPublicSitemapEntries,
  resolveGuideSlugRedirect,
} from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/seo/site";

describe("formatBrandedPageTitle", () => {
  it("appends the site name exactly once", () => {
    const title = "Madrid short-term rental registration: VUT host guide";
    assert.equal(formatBrandedPageTitle(title), `${title} | ${SITE_NAME}`);
    assert.equal(
      formatBrandedPageTitle(title).split(SITE_NAME).length - 1,
      1
    );
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
});

describe("resolveGuideSlugRedirect", () => {
  it("redirects English slugs on /fr to the French slug", () => {
    assert.equal(
      resolveGuideSlugRedirect("fr", "madrid-short-term-rental-registration"),
      "/fr/guides/enregistrement-location-courte-duree-madrid"
    );
  });

  it("redirects French slugs on /en to the English slug", () => {
    assert.equal(
      resolveGuideSlugRedirect("en", "enregistrement-airbnb-madrid"),
      "/en/guides/madrid-airbnb-registration"
    );
  });

  it("returns null for the correct slug/locale pair", () => {
    assert.equal(
      resolveGuideSlugRedirect("en", "madrid-airbnb-registration"),
      null
    );
    assert.equal(
      resolveGuideSlugRedirect("fr", "enregistrement-location-courte-duree-madrid"),
      null
    );
  });

  it("returns null for unknown slugs", () => {
    assert.equal(resolveGuideSlugRedirect("en", "not-a-real-guide"), null);
  });
});

describe("buildLanguageAlternates", () => {
  it("maps EN and FR city guides to locale-specific slugs", () => {
    const alternates = buildLanguageAlternates("guideMadridStrRegistration");
    assert.match(alternates.en, /\/en\/guides\/madrid-short-term-rental-registration$/);
    assert.match(
      alternates.fr,
      /\/fr\/guides\/enregistrement-location-courte-duree-madrid$/
    );
    assert.match(alternates["x-default"], /\/en\/guides\/madrid-short-term-rental-registration$/);
  });

  it("uses the same path for shared guides in both locales", () => {
    const alternates = buildLanguageAlternates("guideSes");
    assert.match(alternates.en, /\/en\/guides\/ses-hospedajes-espagne$/);
    assert.match(alternates.fr, /\/fr\/guides\/ses-hospedajes-espagne$/);
  });
});

describe("getPublicSitemapEntries", () => {
  it("lists each locale-specific guide slug only under its locale", () => {
    const urls = getPublicSitemapEntries().map(
      ({ locale, path }) => `/${locale}${path}`
    );

    assert.ok(urls.includes("/en/guides/madrid-short-term-rental-registration"));
    assert.ok(urls.includes("/fr/guides/enregistrement-location-courte-duree-madrid"));
    assert.ok(!urls.includes("/en/guides/enregistrement-location-courte-duree-madrid"));
    assert.ok(!urls.includes("/fr/guides/madrid-short-term-rental-registration"));
  });

  it("lists shared guides under both locales", () => {
    const urls = getPublicSitemapEntries().map(
      ({ locale, path }) => `/${locale}${path}`
    );
    assert.ok(urls.includes("/en/guides/ses-hospedajes-espagne"));
    assert.ok(urls.includes("/fr/guides/ses-hospedajes-espagne"));
  });
});
