import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/app/",
          "/*/app",
          "/*/check-in/",
          "/*/export/",
          "/*/app/*/guest-register/*/print",
          "/*/app/*/guest-register/print-all",
          "/*/app/*/regional-report/print/",
          "/*/app/guest-register/print-all",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
