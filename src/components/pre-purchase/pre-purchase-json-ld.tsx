import { buildPrePurchaseJsonLd } from "@/lib/pre-purchase/json-ld";
import type { Locale } from "@/lib/pre-purchase/locale";

type Props = {
  locale: Locale;
  pageUrl: string;
  title: string;
  description: string;
};

export function PrePurchaseJsonLd({ locale, pageUrl, title, description }: Props) {
  const jsonLd = buildPrePurchaseJsonLd({ locale, pageUrl, title, description });
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
