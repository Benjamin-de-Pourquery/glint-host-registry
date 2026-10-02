"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { GermanyRegistration } from "@/lib/germany/registration-compliance";
import {
  mergeCompanyAgreementChecklist,
  mergeMonteurKitChecklist,
  monteurKitProgress,
  parseChecklistJson,
  stringifyChecklist,
  type DeCompanyAgreementItem,
  type DeKitChecklistItem,
} from "@/lib/germany/monteur-kit";
import { FACTS_REVIEWED_AT } from "@/lib/germany/monteur-kit-facts";
import {
  BERLIN_OVERNIGHT_TAX_FAQ_URL,
  BERLIN_OVERNIGHT_TAX_2026_PDF_URL,
  BERLIN_ZWVB_GVBL_2026_URL,
  BERLIN_ZWVB_FORMS_URL,
  BMG_SECTION_29_URL,
  BMG_SECTION_30_URL,
  BNETZA_STR_ARTICLE_URL,
  HESSIAN_VGH_MONTEUR_REPORT_URL,
  USTG_SECTION_12_URL,
  USTG_SECTION_19_URL,
} from "@/lib/germany/official-links";
import { toast } from "sonner";

type Props = {
  propertyId: string;
  registration: GermanyRegistration | null;
};

const ITEM_SOURCE_URLS: Record<string, string> = {
  zwvbg_fourth_act_2026: BERLIN_ZWVB_GVBL_2026_URL,
  zwvbg_existing_numbers: BERLIN_ZWVB_FORMS_URL,
  zwvbg_bundid_portal: BERLIN_ZWVB_FORMS_URL,
  zwvbg_unit_and_host: BERLIN_ZWVB_GVBL_2026_URL,
  guest_reg_foreign_meldeschein: BMG_SECTION_29_URL,
  guest_reg_record_fields: BMG_SECTION_30_URL,
};

export function DeMonteurKitPanel({ propertyId, registration }: Props) {
  const t = useTranslations("de.monteurKit");
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const monteurItems = useMemo(
    () =>
      mergeMonteurKitChecklist(
        parseChecklistJson<DeKitChecklistItem>(registration?.deMonteurKitChecklistJson)
      ),
    [registration?.deMonteurKitChecklistJson]
  );

  const companyItems = useMemo(
    () =>
      mergeCompanyAgreementChecklist(
        parseChecklistJson<DeCompanyAgreementItem>(
          registration?.deCompanyAgreementChecklistJson
        )
      ),
    [registration?.deCompanyAgreementChecklistJson]
  );

  const progress = monteurKitProgress(monteurItems);

  const saveChecklists = async (
    nextMonteur: DeKitChecklistItem[],
    nextCompany: DeCompanyAgreementItem[]
  ) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deMonteurKitChecklistJson: stringifyChecklist(nextMonteur),
          deCompanyAgreementChecklistJson: stringifyChecklist(nextCompany),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const toggleMonteur = (key: string, done: boolean) => {
    const next = monteurItems.map((item) =>
      item.key === key ? { ...item, done } : item
    );
    void saveChecklists(next, companyItems);
  };

  const toggleCompany = (key: string, done: boolean) => {
    const next = companyItems.map((item) =>
      item.key === key ? { ...item, done } : item
    );
    void saveChecklists(monteurItems, next);
  };

  const tracks = ["zwvbg", "building", "guest_reg", "invoicing"] as const;

  return (
    <Card className="border-indigo-200 bg-indigo-50/20">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {t("title")}
          <Badge variant="outline" className="text-xs">
            {t("progress", { done: progress.done, total: progress.total })}
          </Badge>
        </CardTitle>
        <p className="text-sm text-slate-600">{t("subtitle")}</p>
        <p className="text-xs text-slate-500">{t("reviewedAt", { date: FACTS_REVIEWED_AT })}</p>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        {tracks.map((track) => (
          <section key={track} className="space-y-2">
            <h3 className="font-semibold text-slate-900">{t(`tracks.${track}`)}</h3>
            <ul className="space-y-2">
              {monteurItems
                .filter((item) => item.track === track)
                .map((item) => (
                  <li
                    key={item.key}
                    className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white/70 p-2"
                  >
                    <Checkbox
                      checked={item.done}
                      onCheckedChange={(c) => toggleMonteur(item.key, c === true)}
                      disabled={saving}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-900">{t(`items.${item.key}.label`)}</p>
                      <p className="text-xs text-slate-600">
                        {t(`items.${item.key}.body`)}
                      </p>
                      {ITEM_SOURCE_URLS[item.key] && (
                        <a
                          href={ITEM_SOURCE_URLS[item.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-700 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t("sourceLink")}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}

        <section className="space-y-2">
          <h3 className="font-semibold text-slate-900">{t("companySection")}</h3>
          <ul className="space-y-2">
            {companyItems.map((item) => (
              <li
                key={item.key}
                className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white/70 p-2"
              >
                <Checkbox
                  checked={item.done}
                  onCheckedChange={(c) => toggleCompany(item.key, c === true)}
                  disabled={saving}
                />
                <p className="text-slate-900">{t(`companyItems.${item.key}`)}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="rounded-lg border border-slate-200 bg-white/60 p-3 text-xs text-slate-700">
          <p className="font-medium">{t("referenceTitle")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>
              <a href={BNETZA_STR_ARTICLE_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:underline">
                {t("refs.bnetza")}
              </a>
            </li>
            <li>
              <a href={USTG_SECTION_12_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:underline">
                {t("refs.ustg12")}
              </a>
            </li>
            <li>
              <a href={USTG_SECTION_19_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:underline">
                {t("refs.ustg19")}
              </a>
            </li>
            <li>
              <a href={BERLIN_OVERNIGHT_TAX_2026_PDF_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:underline">
                {t("refs.berlinTax")}
              </a>
            </li>
            <li>
              <a href={BERLIN_OVERNIGHT_TAX_FAQ_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:underline">
                {t("refs.berlinTaxFaq")}
              </a>
            </li>
            <li>
              <a href={HESSIAN_VGH_MONTEUR_REPORT_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-700 hover:underline">
                {t("refs.hessianVgh")}
              </a>
            </li>
          </ul>
        </div>

        <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => router.refresh()}>
          {t("refresh")}
        </Button>
      </CardContent>
    </Card>
  );
}
