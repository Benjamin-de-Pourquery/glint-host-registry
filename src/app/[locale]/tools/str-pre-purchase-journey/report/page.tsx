import { redirect } from "next/navigation";
import { PrePurchaseReportPage } from "@/components/pre-purchase/pre-purchase-report-page";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StrPrePurchaseReportPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (locale === "fr") {
    const sp = await searchParams;
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(sp)) {
      if (typeof value === "string") qs.set(key, value);
      else if (Array.isArray(value) && value[0]) qs.set(key, value[0]);
    }
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    redirect(`/fr/outils/parcours-achat-location-courte-duree/rapport${suffix}`);
  }

  return <PrePurchaseReportPage locale={locale} searchParams={await searchParams} />;
}
