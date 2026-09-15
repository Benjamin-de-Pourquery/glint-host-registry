import { getSiteUrl, SITE_NAME } from "./site";

export type FaqItem = { question: string; answer: string };

export function buildLandingJsonLd({
  locale,
  description,
  faqItems,
}: {
  locale: string;
  description: string;
  faqItems: FaqItem[];
}) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}`;

  const organization = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: SITE_NAME,
    url: siteUrl,
    logo: `${siteUrl}/icon`,
    description,
  };

  const website = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: SITE_NAME,
    description,
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: [locale === "fr" ? "fr-FR" : "en-US"],
  };

  const software = {
    "@type": "SoftwareApplication",
    "@id": `${pageUrl}/#software`,
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: pageUrl,
    description,
    offers: {
      "@type": "Offer",
      price: "19",
      priceCurrency: "EUR",
      description: "14-day free trial on all plans",
    },
    publisher: { "@id": `${siteUrl}/#organization` },
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${pageUrl}/#faq`,
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website, software, faqPage],
  };
}
