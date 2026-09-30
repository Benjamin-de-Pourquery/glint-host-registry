import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/seo/site";
import { getPublicSitemapPaths } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();
  const pages = getPublicSitemapPaths();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const { path } of pages) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : path.startsWith("/guides") ? 0.7 : 0.6,
      });
    }
  }

  entries.push({
    url: `${siteUrl}/en/tools/str-pre-purchase-journey`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.65,
  });
  entries.push({
    url: `${siteUrl}/fr/outils/parcours-achat-location-courte-duree`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.65,
  });

  return entries;
}
