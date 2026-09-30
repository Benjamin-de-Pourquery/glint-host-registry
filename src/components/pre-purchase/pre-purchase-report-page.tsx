import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MarketingHeader } from "@/components/marketing-header";
import { LandingFooter } from "@/components/landing/landing-footer";
import { PrePurchaseDisclaimer } from "@/components/pre-purchase/pre-purchase-disclaimer";
import { PrePurchaseReportActions } from "@/components/pre-purchase/pre-purchase-report-actions";
import { evaluatePrePurchaseJourney } from "@/lib/pre-purchase/evaluate-journey";
import {
  journeyInputFromSearchParams,
  normalizeJourneyInput,
} from "@/lib/pre-purchase/query-state";
import { buildPrePurchaseReport } from "@/lib/pre-purchase/report";
import { pickLocale, type Locale } from "@/lib/pre-purchase/locale";
import {
  prePurchasePathForLocale,
  PRE_PURCHASE_REPORT_PATH,
} from "@/lib/pre-purchase/paths";
import "@/styles/pre-purchase-print.css";

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

export async function PrePurchaseReportPage({ locale: localeParam, searchParams }: Props) {
  const locale = pickLocale(localeParam);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "prePurchase.report" });

  const params = flatSearchParams(searchParams);
  const input = normalizeJourneyInput(journeyInputFromSearchParams(params));
  const evaluation = await evaluatePrePurchaseJourney(input);
  const report = buildPrePurchaseReport(input, evaluation);

  const backHref = `/${locale}${prePurchasePathForLocale(locale)}?${params.toString()}`;

  return (
    <div className="pre-purchase-print-page min-h-screen bg-slate-50">
      <div className="pre-purchase-no-print">
        <MarketingHeader />
      </div>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="pre-purchase-no-print flex flex-wrap items-center justify-between gap-3">
          <Link href={backHref} className="text-sm font-medium text-emerald-700 hover:underline">
            {t("backToJourney")}
          </Link>
          <PrePurchaseReportActions report={report} />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-slate-900">{t("title")}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {t("generated", { date: report.generatedAt })}
          {report.datasetUpdatedAt
            ? ` · ${t("datasetDate", { date: report.datasetUpdatedAt })}`
            : ""}
        </p>

        <div className="mt-6 pre-purchase-print-section">
          <PrePurchaseDisclaimer variant="compact" />
        </div>

        {report.sections.map((section) => (
          <section key={section.id} className="pre-purchase-print-section mt-10">
            <h2 className="text-xl font-bold text-slate-900">{section.title[locale as Locale]}</h2>
            <ul className="mt-4 space-y-4">
              {section.items.map((item, index) => (
                <li
                  key={`${section.id}-${index}`}
                  className="rounded-lg border border-slate-200 bg-white p-4 text-sm"
                >
                  <p className="font-semibold text-slate-900">{item.title[locale as Locale]}</p>
                  <p className="mt-2 whitespace-pre-wrap text-slate-700">
                    {item.detail[locale as Locale]}
                  </p>
                  {item.meta && (
                    <p className="mt-2 text-xs text-slate-500">{item.meta}</p>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">{report.disclaimer[locale as Locale]}</p>
          </section>
        ))}
      </main>
      <div className="pre-purchase-no-print">
        <LandingFooter locale={locale} />
      </div>
    </div>
  );
}

export function prePurchaseReportPath(locale: Locale): string {
  return PRE_PURCHASE_REPORT_PATH[locale];
}
