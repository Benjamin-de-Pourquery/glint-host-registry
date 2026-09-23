"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CopyFieldChip } from "@/components/copy-field-chip";
import { FrNerMigrationWizard } from "@/components/fr-ner-migration-wizard";
import { isFranceCountry } from "@/lib/national-transition";
import { NER_MIGRATION_TIMELINE } from "@/lib/fr-ner-migration/config";
import { API_MEUBLES_INFO_URL } from "@/lib/fr-ner-migration/official-links";
import type { FrNerMigrationRecord, FrNerMigrationStatus } from "@/lib/fr-ner-migration/types";
import { ExternalLink, Plane } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  propertyId: string;
  country: string;
  locale: string;
  complianceTabHref?: string;
  className?: string;
  showForm?: boolean;
  showWizard?: boolean;
};

const STATUS_TONE: Record<
  FrNerMigrationStatus,
  "slate" | "amber" | "blue" | "emerald" | "red" | "violet"
> = {
  NO_LOCAL: "amber",
  HAS_LOCAL: "blue",
  PREP_DONE: "violet",
  SUBMITTED: "blue",
  NER_ACTIVE: "emerald",
  STALE_LOCAL: "red",
};

const toneClasses = {
  slate: "border-slate-200 bg-slate-50",
  amber: "border-amber-200 bg-gradient-to-br from-amber-50 to-white",
  blue: "border-blue-200 bg-gradient-to-br from-blue-50 to-white",
  emerald: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
  red: "border-red-200 bg-gradient-to-br from-red-50 to-white",
  violet: "border-violet-200 bg-gradient-to-br from-violet-50 to-white",
};

type MigrationResponse = {
  applies: boolean;
  migration: FrNerMigrationRecord | null;
};

export function FrNerMigrationCard({
  propertyId,
  country,
  locale,
  complianceTabHref,
  className,
  showForm = true,
  showWizard = true,
}: Props) {
  const t = useTranslations("frNerMigration");
  const router = useRouter();
  const uiLocale = locale === "fr" ? "fr" : "en";

  const [data, setData] = useState<MigrationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/fr-ner-migration`);
      if (!res.ok) throw new Error("load failed");
      const json = (await res.json()) as MigrationResponse;
      setData(json);
    } catch {
      setData({ applies: false, migration: null });
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (isFranceCountry(country)) {
      load();
    }
  }, [country, load]);

  const migration = data?.migration;
  const [form, setForm] = useState({
    localRegistrationNumber: "",
    localIssuingCommune: "",
    notifyOnPortalOpen: false,
    documentsChecklist: [] as { key: string; done: boolean }[],
  });

  useEffect(() => {
    if (migration) {
      setForm({
        localRegistrationNumber: migration.localRegistrationNumber ?? "",
        localIssuingCommune: migration.localIssuingCommune ?? "",
        notifyOnPortalOpen: migration.notifyOnPortalOpen,
        documentsChecklist: migration.documentsChecklist,
      });
    }
  }, [migration]);

  if (!isFranceCountry(country)) {
    return null;
  }

  if (loading) {
    return (
      <section className={cn("rounded-2xl border border-slate-200 p-5", className)}>
        <p className="text-sm text-slate-500">{t("loading")}</p>
      </section>
    );
  }

  if (!data?.applies || !migration) {
    return null;
  }

  const status = migration.status;
  const tone = STATUS_TONE[status] ?? "amber";
  const portalLabel = NER_MIGRATION_TIMELINE.portalOpensLabel[uiLocale];
  const playbookHref =
    complianceTabHref ?? `/${locale}/app/properties/${propertyId}?tab=compliance`;

  const save = async (patch: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/fr-ner-migration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("save failed");
      const json = (await res.json()) as MigrationResponse;
      setData(json);
      if (json.migration) {
        setForm({
          localRegistrationNumber: json.migration.localRegistrationNumber ?? "",
          localIssuingCommune: json.migration.localIssuingCommune ?? "",
          notifyOnPortalOpen: json.migration.notifyOnPortalOpen,
          documentsChecklist: json.migration.documentsChecklist,
        });
      }
      toast.success(t("saved"));
      router.refresh();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const toggleDocument = (key: string, done: boolean) => {
    const next = form.documentsChecklist.map((item) =>
      item.key === key ? { ...item, done } : item
    );
    setForm({ ...form, documentsChecklist: next });
  };

  return (
    <section
      className={cn(
        "rounded-2xl border p-5 shadow-sm",
        toneClasses[tone],
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-slate-600" />
            <h3 className="text-base font-semibold text-slate-900">{t("title")}</h3>
          </div>
          <p className="text-sm text-slate-600">
            {t(`description.${status}`, { portalOpens: portalLabel })}
          </p>
          <p className="text-xs text-slate-500">{t("disclaimer")}</p>
        </div>
        <Badge variant="outline" className="shrink-0 self-start border-slate-300 bg-white/80">
          {t(`status.${status}`)}
        </Badge>
      </div>

      <div className="mt-4 space-y-3">
        {migration.nerNumber ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t("nerNumber")}
            </span>
            <CopyFieldChip
              label={t("nerShort")}
              value={migration.nerNumber}
              copiedLabel={t("copied")}
            />
            {migration.localRegistrationNumber && (
              <CopyFieldChip
                label={t("localShort")}
                value={migration.localRegistrationNumber}
                copiedLabel={t("copied")}
              />
            )}
          </div>
        ) : form.localRegistrationNumber ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t("localNumber")}
            </span>
            <CopyFieldChip
              label={t("localShort")}
              value={form.localRegistrationNumber}
              copiedLabel={t("copied")}
            />
          </div>
        ) : (
          <p className="rounded-lg border border-amber-200/80 bg-white/70 px-3 py-2 text-sm text-amber-900">
            {t("noLocalYet")}
          </p>
        )}
      </div>

      {showForm && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`local-number-${propertyId}`}>{t("localNumber")}</Label>
              <Input
                id={`local-number-${propertyId}`}
                value={form.localRegistrationNumber}
                onChange={(e) =>
                  setForm({ ...form, localRegistrationNumber: e.target.value })
                }
                placeholder={t("localPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`local-commune-${propertyId}`}>{t("localCommune")}</Label>
              <Input
                id={`local-commune-${propertyId}`}
                value={form.localIssuingCommune}
                onChange={(e) =>
                  setForm({ ...form, localIssuingCommune: e.target.value })
                }
                placeholder={t("localCommunePlaceholder")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">{t("documentsTitle")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {form.documentsChecklist.map((item) => (
                <div key={item.key} className="flex items-start gap-2">
                  <Checkbox
                    id={`doc-${item.key}-${propertyId}`}
                    checked={item.done}
                    onCheckedChange={(checked) =>
                      toggleDocument(item.key, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`doc-${item.key}-${propertyId}`}
                    className="text-sm font-normal leading-snug"
                  >
                    {t(`documents.${item.key}`)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-slate-200/80 bg-white/70 p-3">
            <Checkbox
              id={`notify-${propertyId}`}
              checked={form.notifyOnPortalOpen}
              onCheckedChange={(checked) =>
                setForm({ ...form, notifyOnPortalOpen: checked === true })
              }
            />
            <div className="space-y-0.5">
              <Label htmlFor={`notify-${propertyId}`} className="text-sm font-medium">
                {t("notifyLabel")}
              </Label>
              <p className="text-xs text-slate-500">{t("notifyHint")}</p>
            </div>
          </div>

          <Button
            size="sm"
            disabled={saving}
            onClick={() =>
              save({
                localRegistrationNumber: form.localRegistrationNumber || null,
                localIssuingCommune: form.localIssuingCommune || null,
                documentsChecklist: form.documentsChecklist,
                notifyOnPortalOpen: form.notifyOnPortalOpen,
              })
            }
          >
            {t("save")}
          </Button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <a href={API_MEUBLES_INFO_URL} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="bg-white/80">
            <ExternalLink className="h-4 w-4" />
            {t("ctaOfficial")}
          </Button>
        </a>
        <Link href={playbookHref}>
          <Button variant="outline" size="sm" className="bg-white/80">
            {t("ctaPlaybook")}
          </Button>
        </Link>
        <Link href={`/${locale}/guides/migration-ner-2026`}>
          <Button variant="outline" size="sm" className="bg-white/80">
            {t("ctaGuide")}
          </Button>
        </Link>
      </div>

      {showWizard && status !== "NO_LOCAL" && (
        <FrNerMigrationWizard
          propertyId={propertyId}
          migration={migration}
          locale={locale}
          onUpdated={(updated) => setData({ applies: true, migration: updated })}
        />
      )}
    </section>
  );
}
