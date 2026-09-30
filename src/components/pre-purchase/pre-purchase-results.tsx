import { getTranslations } from "next-intl/server";
import type { PrePurchaseJourneyEvaluation } from "@/lib/pre-purchase/types";
import type { Locale } from "@/lib/pre-purchase/locale";

type Props = {
  locale: Locale;
  evaluation: PrePurchaseJourneyEvaluation;
};

function flagClasses(level: string): string {
  switch (level) {
    case "red":
      return "border-red-200 bg-red-50 text-red-950";
    case "orange":
      return "border-orange-200 bg-orange-50 text-orange-950";
    default:
      return "border-slate-200 bg-slate-50 text-slate-900";
  }
}

export async function PrePurchaseResults({ locale, evaluation }: Props) {
  const t = await getTranslations({ locale, namespace: "prePurchase.results" });

  return (
    <div className="mt-10 space-y-10">
      <section>
        <h2 className="text-xl font-bold text-slate-900">{t("flagsTitle")}</h2>
        <ul className="mt-4 space-y-3">
          {evaluation.flags.map((flag) => (
            <li
              key={flag.code}
              className={`rounded-xl border px-4 py-3 ${flagClasses(flag.level)}`}
            >
              <p className="font-semibold">{flag.title[locale]}</p>
              <p className="mt-1 text-sm">{flag.detail[locale]}</p>
            </li>
          ))}
        </ul>
      </section>

      {evaluation.lookup && (
        <section>
          <h2 className="text-xl font-bold text-slate-900">{t("lookupTitle")}</h2>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-sm">
            <p>
              <span className="font-medium">{t("lookupStatus")}: </span>
              {t(`lookupStatus_${evaluation.lookup.status}`)}
            </p>
            <p className="mt-2">
              <span className="font-medium">{t("lookupNumber")}: </span>
              {evaluation.lookup.normalizedNumber}
            </p>
            {evaluation.lookup.datasetUpdatedAt && (
              <p className="mt-2">
                <span className="font-medium">{t("datasetDate")}: </span>
                {evaluation.lookup.datasetUpdatedAt}
              </p>
            )}
            <p className="mt-2">{evaluation.lookup.message[locale]}</p>
            {evaluation.lookup.record && (
              <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">{t("recordType")}</dt>
                  <dd>{evaluation.lookup.record.establishmentType}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("recordStatus")}</dt>
                  <dd>{evaluation.lookup.record.status}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("recordMunicipality")}</dt>
                  <dd>{evaluation.lookup.record.municipality}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("recordPostal")}</dt>
                  <dd>{evaluation.lookup.record.postalCode}</dd>
                </div>
                {evaluation.lookup.record.street && (
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">{t("recordAddress")}</dt>
                    <dd>
                      {evaluation.lookup.record.street} {evaluation.lookup.record.streetNumber}
                      {evaluation.lookup.record.floor
                        ? `, ${evaluation.lookup.record.floor}`
                        : ""}
                      {evaluation.lookup.record.door
                        ? ` ${evaluation.lookup.record.door}`
                        : ""}
                    </dd>
                  </div>
                )}
              </dl>
            )}
            {evaluation.lookup.addressMatchNote && (
              <p className="mt-3 text-slate-700">
                {evaluation.lookup.addressMatchNote[locale]}
              </p>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold text-slate-900">{t("rulesTitle")}</h2>
        <ul className="mt-4 space-y-4">
          {evaluation.rules.map((rule) => (
            <li key={rule.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{rule.title[locale]}</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {rule.confidence === "to_confirm"
                    ? t("confidence_to_confirm")
                    : rule.confidence}
                </span>
              </div>
              {rule.summary && (
                <p className="mt-2 text-sm text-slate-700">{rule.summary[locale]}</p>
              )}
              {rule.toConfirmQuestion && (
                <p className="mt-2 text-sm text-slate-600">{rule.toConfirmQuestion[locale]}</p>
              )}
              {rule.sourceReviewedAt && (
                <p className="mt-2 text-xs text-slate-500">
                  {t("reviewedAt", { date: rule.sourceReviewedAt })}
                </p>
              )}
              {rule.officialUrls.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {rule.officialUrls.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        className="font-medium text-emerald-700 hover:underline"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {link.label[locale]}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900">{t("documentsTitle")}</h2>
        <ul className="mt-4 space-y-3">
          {evaluation.documents.map((doc) => (
            <li key={doc.id} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <p className="font-medium text-slate-900">{doc.title[locale]}</p>
              <p className="mt-1 text-slate-600">{doc.why[locale]}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
