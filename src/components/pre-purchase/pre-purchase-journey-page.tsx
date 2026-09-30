import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingHeader } from "@/components/marketing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { PrePurchaseDisclaimer } from "@/components/pre-purchase/pre-purchase-disclaimer";
import { PrePurchaseJourneyForm } from "@/components/pre-purchase/pre-purchase-journey-form";
import { PrePurchaseResults } from "@/components/pre-purchase/pre-purchase-results";
import { PrePurchaseJsonLd } from "@/components/pre-purchase/pre-purchase-json-ld";
import { PrePurchaseQuestions } from "@/components/pre-purchase/pre-purchase-questions";
import { PrePurchaseSignupCta } from "@/components/pre-purchase/pre-purchase-signup-cta";
import { evaluatePrePurchaseJourney } from "@/lib/pre-purchase/evaluate-journey";
import { generateQuestionTemplates } from "@/lib/pre-purchase/question-templates";
import { PRE_PURCHASE_REPORT_PATH } from "@/lib/pre-purchase/paths";
import {
  journeyInputFromSearchParams,
  normalizeJourneyInput,
} from "@/lib/pre-purchase/query-state";
import { pickLocale, type Locale } from "@/lib/pre-purchase/locale";
import { prePurchaseCanonicalUrl } from "@/lib/pre-purchase/paths";

type Props = {
  locale: string;
  searchParams: Record<string, string | string[] | undefined>;
};

function flatSearchParams(
  raw: Record<string, string | string[] | undefined>
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value[0]) params.set(key, value[0]);
  }
  return params;
}

function hasJourneyQuery(params: URLSearchParams): boolean {
  return (
    params.has("country") ||
    params.has("region") ||
    params.has("municipality") ||
    params.has("licence") ||
    params.has("license")
  );
}

export async function PrePurchaseJourneyPage({ locale: localeParam, searchParams }: Props) {
  const locale = pickLocale(localeParam);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "prePurchase" });

  const params = flatSearchParams(searchParams);
  const input = normalizeJourneyInput(journeyInputFromSearchParams(params));
  const evaluation = hasJourneyQuery(params)
    ? await evaluatePrePurchaseJourney(input)
    : null;

  const pageUrl = prePurchaseCanonicalUrl(locale);

  return (
    <div className="min-h-screen bg-slate-50">
      <PrePurchaseJsonLd
        locale={locale}
        pageUrl={pageUrl}
        title={t("pageTitle")}
        description={t("pageDescription")}
      />
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm font-medium text-emerald-700">{t("eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {t("pageTitle")}
        </h1>
        <p className="mt-3 text-slate-600">{t("pageLead")}</p>

        <div className="mt-8">
          <PrePurchaseDisclaimer />
        </div>

        <div className="mt-8">
          <PrePurchaseJourneyForm initialInput={input} />
        </div>

        {evaluation && (
          <>
            <PrePurchaseResults locale={locale as Locale} evaluation={evaluation} />
            <PrePurchaseQuestions
              templates={generateQuestionTemplates(input, evaluation)}
            />
            <p className="mt-6 text-sm">
              <Link
                href={`/${locale}${PRE_PURCHASE_REPORT_PATH[locale as Locale]}?${params.toString()}`}
                className="font-medium text-emerald-700 hover:underline"
              >
                {t("openPrintableReport")}
              </Link>
            </p>
            <PrePurchaseSignupCta locale={locale as Locale} input={input} />
          </>
        )}

        <div className="mt-10">
          <PrePurchaseDisclaimer variant="compact" />
        </div>

        <p className="mt-8 text-sm">
          <Link
            href={
              locale === "fr"
                ? `/${locale}/guides/enregistrement-location-courte-duree-barcelone`
                : `/${locale}/guides/barcelona-short-term-rental-registration`
            }
            className="font-medium text-emerald-700 hover:underline"
          >
            {t("barcelonaGuideLink")}
          </Link>
        </p>
      </main>
      <LandingFooter locale={locale} />
    </div>
  );
}
