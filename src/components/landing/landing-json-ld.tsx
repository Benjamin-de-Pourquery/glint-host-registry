import { getTranslations } from "next-intl/server";
import { buildLandingJsonLd } from "@/lib/seo/json-ld";

const FAQ_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"];

type Props = { locale: string };

export async function LandingJsonLd({ locale }: Props) {
  const tSeo = await getTranslations({ locale, namespace: "seo" });
  const tFaq = await getTranslations({ locale, namespace: "landing.faq" });

  const faqItems = FAQ_KEYS.map((key) => ({
    question: tFaq(`items.${key}.q`),
    answer: tFaq(`items.${key}.a`),
  }));

  const jsonLd = buildLandingJsonLd({
    locale,
    description: tSeo("home.description"),
    faqItems,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
