import { getSiteUrl, SITE_NAME } from "@/lib/seo/site";

type Locale = "en" | "fr";

export function buildPrePurchaseJsonLd({
  locale,
  pageUrl,
  title,
  description,
}: {
  locale: Locale;
  pageUrl: string;
  title: string;
  description: string;
}) {
  const siteUrl = getSiteUrl();

  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: `${siteUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: title,
        item: pageUrl,
      },
    ],
  };

  const webApp = {
    "@type": "WebApplication",
    "@id": `${pageUrl}#app`,
    name: title,
    description,
    url: pageUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: locale === "fr" ? "fr-FR" : "en-US",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
  };

  const howTo = {
    "@type": "HowTo",
    "@id": `${pageUrl}#howto`,
    name: title,
    description,
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: locale === "fr" ? "Saisir la zone et le numéro" : "Enter zone and licence number",
        text:
          locale === "fr"
            ? "Indiquez l'Espagne, la Catalogne, la municipalité, l'adresse ou l'URL d'annonce et le numéro HUT."
            : "Select Spain, Catalonia, municipality, address or listing URL, and HUT number.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: locale === "fr" ? "Lire les règles sourcées" : "Review sourced rules",
        text:
          locale === "fr"
            ? "Consultez les points vérifiés avec URL officielle et date de relecture, et les éléments à confirmer."
            : "Review verified items with official URL and review date, plus to-confirm items.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: locale === "fr" ? "Recouper le registre open data" : "Cross-check open data register",
        text:
          locale === "fr"
            ? "Comparez le numéro au jeu de données du Registre de Turisme de Catalunya."
            : "Compare the number against the Catalan tourism register open dataset.",
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [breadcrumb, webApp, howTo],
  };
}
