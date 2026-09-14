"use client";

import { useLocale, useTranslations } from "next-intl";
import { CopyFieldChip } from "@/components/copy-field-chip";
import { getPlatformBlockPlaybook } from "@/lib/listings/platform-block-playbook";
import { ExternalLink, ShieldAlert } from "lucide-react";

type Props = {
  channel: string;
  registrationNumber?: string | null;
  nationalRegistrationNumber?: string | null;
  city?: string;
  blockReason?: string | null;
};

export function PlatformBlockPlaybook({
  channel,
  registrationNumber,
  nationalRegistrationNumber,
  city,
  blockReason,
}: Props) {
  const t = useTranslations("properties.detail.listings.blockPlaybook");
  const locale = useLocale();
  const lang = (locale === "fr" ? "fr" : "en") as "en" | "fr";

  const steps = getPlatformBlockPlaybook({
    channel,
    registrationNumber,
    nationalRegistrationNumber,
    city,
  });

  return (
    <section className="rounded-xl border border-red-200 bg-red-50/60 p-5 space-y-5">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div>
          <h3 className="text-lg font-semibold text-red-900">{t("title")}</h3>
          <p className="mt-1 text-sm text-red-800">{t("subtitle")}</p>
          {blockReason && (
            <p className="mt-2 rounded-md bg-white/80 px-3 py-2 text-sm text-red-900">
              <span className="font-medium">{t("blockReason")}: </span>
              {blockReason}
            </p>
          )}
        </div>
      </div>

      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.key} className="rounded-lg border border-red-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
              {t("step", { number: index + 1 })}
            </p>
            <h4 className="mt-1 font-medium text-slate-900">{step.title[lang]}</h4>
            <p className="mt-2 text-sm text-slate-600">{step.instruction[lang]}</p>

            {step.copyChips && step.copyChips.length > 0 && (
              <div className="mt-3 space-y-2">
                {step.copyChips.map((chip) => (
                  <CopyFieldChip
                    key={chip.key}
                    label={chip.label[lang]}
                    value={chip.template[lang]}
                    copiedLabel={t("copied")}
                  />
                ))}
              </div>
            )}

            {step.officialUrls.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {step.officialUrls.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {link.label[lang]}
                      {!link.urlVerified && (
                        <span className="text-slate-400">({t("urlUnverified")})</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
