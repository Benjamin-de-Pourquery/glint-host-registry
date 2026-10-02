import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";
import { buildLanguageAlternates, getPublicSitemapEntries } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();
  const pages = getPublicSitemapEntries();

  const entries: MetadataRoute.Sitemap = [];

  for (const { locale, path, page } of pages) {
    entries.push({
      url: `${siteUrl}/${locale}${path}`,
      lastModified,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : path.startsWith("/guides") ? 0.7 : 0.6,
      alternates: {
        languages: buildLanguageAlternates(page),
      },
    });
  }

  return entries;
}
