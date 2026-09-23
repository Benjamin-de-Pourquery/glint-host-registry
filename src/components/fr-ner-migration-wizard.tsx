"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { ChecklistItem, FrNerMigrationRecord, FrNerWizardStep } from "@/lib/fr-ner-migration/types";
import { FR_NER_WIZARD_STEPS } from "@/lib/fr-ner-migration/types";
import { DEMARCHE_NUMERIQUE_URL } from "@/lib/fr-ner-migration/official-links";
import { ExternalLink, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  propertyId: string;
  migration: FrNerMigrationRecord;
  locale: string;
  onUpdated?: (migration: FrNerMigrationRecord) => void;
};

function stepIndex(step: FrNerWizardStep): number {
  return FR_NER_WIZARD_STEPS.indexOf(step);
}

export function FrNerMigrationWizard({ propertyId, migration, locale, onUpdated }: Props) {
  const t = useTranslations("frNerMigration.wizard");
  const router = useRouter();

  const initialStep =
    migration.wizardStep && FR_NER_WIZARD_STEPS.includes(migration.wizardStep)
      ? migration.wizardStep
      : FR_NER_WIZARD_STEPS[0];

  const [currentStep, setCurrentStep] = useState<FrNerWizardStep>(initialStep);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nerNumber: migration.nerNumber ?? "",
    nerIssuedAt: migration.nerIssuedAt
      ? new Date(migration.nerIssuedAt).toISOString().split("T")[0]
      : "",
    channelUpdatesChecklist: migration.channelUpdatesChecklist,
    accountReady: migration.wizardStep !== "account" || migration.status !== "PREP_DONE",
    dossierReady: migration.documentsChecklist.every((item) => item.done),
  });

  const currentIndex = stepIndex(currentStep);

  const save = async (patch: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/fr-ner-migration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("save failed");
      const json = await res.json();
      onUpdated?.(json.migration);
      router.refresh();
      return json.migration as FrNerMigrationRecord;
    } catch {
      toast.error(t("saveError"));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    const next = FR_NER_WIZARD_STEPS[currentIndex + 1];
    if (!next) return;

    const patch: Record<string, unknown> = { wizardStep: next };

    if (currentStep === "submit") {
      patch.status = "SUBMITTED";
    }

    if (currentStep === "ner_received") {
      patch.nerNumber = form.nerNumber || null;
      patch.nerIssuedAt = form.nerIssuedAt || null;
    }

    if (currentStep === "update_listings") {
      patch.channelUpdatesChecklist = form.channelUpdatesChecklist;
    }

    const updated = await save(patch);
    if (updated) {
      setCurrentStep(next);
      toast.success(t("stepSaved"));
    }
  };

  const goBack = () => {
    const prev = FR_NER_WIZARD_STEPS[currentIndex - 1];
    if (prev) setCurrentStep(prev);
  };

  const toggleChannel = (key: string, done: boolean) => {
    setForm((prev) => ({
      ...prev,
      channelUpdatesChecklist: prev.channelUpdatesChecklist.map((item) =>
        item.key === key ? { ...item, done } : item
      ),
    }));
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB");
  };

  return (
    <div className="mt-5 space-y-4 border-t border-slate-200/80 pt-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900">{t("title")}</h4>
        <Badge variant="outline" className="text-xs">
          {t("stepCounter", { current: currentIndex + 1, total: FR_NER_WIZARD_STEPS.length })}
        </Badge>
      </div>

      <ol className="flex flex-wrap gap-1">
        {FR_NER_WIZARD_STEPS.map((step, index) => (
          <li
            key={step}
            className={cn(
              "rounded-full px-2 py-0.5 text-xs",
              index === currentIndex
                ? "bg-blue-100 text-blue-800 font-medium"
                : index < currentIndex
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
            )}
          >
            {t(`steps.${step}`)}
          </li>
        ))}
      </ol>

      {currentStep === "account" && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white/80 p-4">
          <p className="text-sm text-slate-600">{t("account.body")}</p>
          <a href={DEMARCHE_NUMERIQUE_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="bg-white">
              <ExternalLink className="h-4 w-4" />
              {t("account.cta")}
            </Button>
          </a>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`account-ready-${propertyId}`}
              checked={form.accountReady}
              onCheckedChange={(checked) =>
                setForm({ ...form, accountReady: checked === true })
              }
            />
            <Label htmlFor={`account-ready-${propertyId}`} className="text-sm font-normal">
              {t("account.confirm")}
            </Label>
          </div>
        </div>
      )}

      {currentStep === "dossier" && (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white/80 p-4">
          <p className="text-sm text-slate-600">{t("dossier.body")}</p>
          <ul className="space-y-1 text-sm text-slate-700">
            {migration.documentsChecklist.map((item) => (
              <li key={item.key} className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    item.done ? "bg-emerald-500" : "bg-amber-400"
                  )}
                />
                {t(`documents.${item.key}`)}
              </li>
            ))}
          </ul>
          {!form.dossierReady && (
            <p className="text-xs text-amber-700">{t("dossier.incomplete")}</p>
          )}
        </div>
      )}

      {currentStep === "submit" && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white/80 p-4">
          <p className="text-sm text-slate-600">{t("submit.body")}</p>
          <p className="text-xs text-slate-500">{t("submit.disclaimer")}</p>
        </div>
      )}

      {currentStep === "ner_received" && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white/80 p-4">
          <p className="text-sm text-slate-600">{t("nerReceived.body")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`ner-number-${propertyId}`}>{t("nerReceived.number")}</Label>
              <Input
                id={`ner-number-${propertyId}`}
                value={form.nerNumber}
                onChange={(e) => setForm({ ...form, nerNumber: e.target.value })}
                placeholder={t("nerReceived.numberPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`ner-issued-${propertyId}`}>{t("nerReceived.issuedAt")}</Label>
              <Input
                id={`ner-issued-${propertyId}`}
                type="date"
                value={form.nerIssuedAt}
                onChange={(e) => setForm({ ...form, nerIssuedAt: e.target.value })}
              />
            </div>
          </div>
          {migration.localRegistrationNumber && (
            <p className="text-xs text-slate-500">
              {t("nerReceived.localKept", {
                number: migration.localRegistrationNumber,
                commune: migration.localIssuingCommune ?? t("nerReceived.unknownCommune"),
              })}
            </p>
          )}
        </div>
      )}

      {currentStep === "update_listings" && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white/80 p-4">
          <p className="text-sm text-slate-600">{t("updateListings.body")}</p>
          <div className="space-y-2">
            {form.channelUpdatesChecklist.map((item: ChecklistItem) => (
              <div key={item.key} className="flex items-center gap-2">
                <Checkbox
                  id={`channel-${item.key}-${propertyId}`}
                  checked={item.done}
                  onCheckedChange={(checked) =>
                    toggleChannel(item.key, checked === true)
                  }
                />
                <Label
                  htmlFor={`channel-${item.key}-${propertyId}`}
                  className="text-sm font-normal"
                >
                  {t(`channels.${item.key}`)}
                </Label>
              </div>
            ))}
          </div>
          {migration.nerNumber && (
            <p className="text-xs text-slate-500">
              {t("updateListings.nerReminder", { number: migration.nerNumber })}
            </p>
          )}
        </div>
      )}

      {migration.transitionEndsAt && migration.status === "NER_ACTIVE" && (
        <p className="text-xs text-slate-500">
          {t("dualNumber.countdown", { date: formatDate(migration.transitionEndsAt) })}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {currentIndex > 0 && (
          <Button variant="outline" size="sm" onClick={goBack} disabled={saving}>
            <ChevronLeft className="h-4 w-4" />
            {t("back")}
          </Button>
        )}
        {currentIndex < FR_NER_WIZARD_STEPS.length - 1 ? (
          <Button
            size="sm"
            onClick={goNext}
            disabled={
              saving ||
              (currentStep === "account" && !form.accountReady) ||
              (currentStep === "dossier" && !form.dossierReady) ||
              (currentStep === "ner_received" && !form.nerNumber.trim())
            }
          >
            {t("next")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={async () => {
              const updated = await save({
                channelUpdatesChecklist: form.channelUpdatesChecklist,
                wizardStep: "update_listings",
              });
              if (updated) toast.success(t("complete"));
            }}
            disabled={saving}
          >
            {t("finish")}
          </Button>
        )}
      </div>
    </div>
  );
}
