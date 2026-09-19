"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  CGCT_TAXE_DE_SEJOUR_URL,
  SERVICE_PUBLIC_TAXE_DE_SEJOUR_URL,
  formatPeriodLabel,
  type CollectionMode,
  type DeclarationCadence,
  type MeubleClassification,
  type TouristTaxSummary,
} from "@/lib/france/tourist-tax";
import { isFranceCountry } from "@/lib/national-transition";
import { ExternalLink, Loader2, Receipt, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TouristTaxSettings = {
  enabled: boolean;
  collectionMode: CollectionMode;
  declarationCadence: DeclarationCadence;
  portalUrl: string | null;
  classification: MeubleClassification;
  attestationOnFile: boolean;
  notes: string | null;
};

type TouristTaxResponse = {
  applies: boolean;
  settings: TouristTaxSettings | null;
  summary: TouristTaxSummary | null;
  priorityAction: {
    level: string;
    title: { en: string; fr: string };
    message: { en: string; fr: string };
  } | null;
};

type Props = {
  propertyId: string;
  country: string;
  locale: string;
};

const STATUS_TONE: Record<string, { badge: string; card: string }> = {
  upcoming: {
    badge: "bg-slate-100 text-slate-700",
    card: "border-slate-200 bg-gradient-to-br from-slate-50/80 to-white",
  },
  due: {
    badge: "bg-amber-100 text-amber-800",
    card: "border-amber-200 bg-gradient-to-br from-amber-50/80 to-white",
  },
  overdue: {
    badge: "bg-red-100 text-red-800",
    card: "border-red-200 bg-gradient-to-br from-red-50/80 to-white",
  },
  declared: {
    badge: "bg-emerald-100 text-emerald-800",
    card: "border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white",
  },
  waived: {
    badge: "bg-slate-100 text-slate-600",
    card: "border-slate-200 bg-slate-50/80",
  },
};

export function TouristTaxCard({ propertyId, country, locale }: Props) {
  const t = useTranslations("touristTax");
  const uiLocale = locale === "fr" ? "fr" : "en";

  const [data, setData] = useState<TouristTaxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<TouristTaxSettings | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/tourist-tax`);
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as TouristTaxResponse;
      setData(json);
      if (json.settings) {
        setForm(json.settings);
      }
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [propertyId, t]);

  useEffect(() => {
    load();
  }, [load]);

  if (!isFranceCountry(country)) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-6 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("loading")}
      </div>
    );
  }

  if (!data?.applies || !data.summary || !form) {
    return null;
  }

  const { summary } = data;
  const headlineStatus = summary.nextDuePeriod?.status ?? "upcoming";
  const tone = STATUS_TONE[headlineStatus] ?? STATUS_TONE.upcoming;

  const save = async (patch: Partial<TouristTaxSettings>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/tourist-tax`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Save failed");
      const json = (await res.json()) as TouristTaxResponse;
      setData(json);
      if (json.settings) setForm(json.settings);
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const markDeclared = async (periodId: string) => {
    setSaving(true);
    try {
      const channel =
        form.collectionMode === "platform_collects" ? "platform_tiers" : "host_portal";
      const res = await fetch(
        `/api/properties/${propertyId}/tourist-tax/periods/${periodId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "declared",
            declarationChannel: channel,
          }),
        }
      );
      if (!res.ok) throw new Error("Declare failed");
      const json = (await res.json()) as TouristTaxResponse;
      setData(json);
      if (json.settings) setForm(json.settings);
      toast.success(t("periodDeclared"));
    } catch {
      toast.error(t("declareError"));
    } finally {
      setSaving(false);
    }
  };

  const copyPortal = async () => {
    if (!form.portalUrl) return;
    try {
      await navigator.clipboard.writeText(form.portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyError"));
    }
  };

  return (
    <section
      className={cn("rounded-xl border p-5 shadow-sm", tone.card)}
      aria-labelledby="tourist-tax-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 text-slate-700 ring-1 ring-slate-200/80">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h3 id="tourist-tax-title" className="font-semibold text-slate-900">
              {t("title")}
            </h3>
            <p className="mt-0.5 text-sm text-slate-600">{t("subtitle")}</p>
          </div>
        </div>
        {summary.attentionCount > 0 && (
          <Badge className="shrink-0 bg-red-100 text-red-800">
            {t("attention", { count: summary.attentionCount })}
          </Badge>
        )}
      </div>

      {data.priorityAction && (
        <p className="mt-4 rounded-lg border border-white/60 bg-white/70 px-3 py-2 text-sm text-slate-800">
          {data.priorityAction.message[uiLocale]}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-2 sm:col-span-2">
          <Checkbox
            id="tourist-tax-enabled"
            checked={form.enabled}
            onCheckedChange={(checked) => {
              const enabled = checked === true;
              setForm({ ...form, enabled });
              save({ enabled });
            }}
            disabled={saving}
          />
          <Label htmlFor="tourist-tax-enabled" className="text-sm font-normal">
            {t("enabled")}
          </Label>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tourist-tax-collection">{t("collectionModeLabel")}</Label>
          <Select
            value={form.collectionMode}
            onValueChange={(v) => {
              const mode = v as CollectionMode;
              setForm({ ...form, collectionMode: mode });
              save({ collectionMode: mode });
            }}
            disabled={saving}
          >
            <SelectTrigger id="tourist-tax-collection">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["platform_collects", "host_collects", "mixed", "unknown"] as const).map(
                (mode) => (
                  <SelectItem key={mode} value={mode}>
                    {t(`collectionMode.${mode}`)}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tourist-tax-cadence">{t("cadenceLabel")}</Label>
          <Select
            value={form.declarationCadence}
            onValueChange={(v) => {
              const cadence = v as DeclarationCadence;
              setForm({ ...form, declarationCadence: cadence });
              save({ declarationCadence: cadence });
            }}
            disabled={saving}
          >
            <SelectTrigger id="tourist-tax-cadence">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["monthly", "bimonthly", "quarterly", "annual", "unknown"] as const).map(
                (cadence) => (
                  <SelectItem key={cadence} value={cadence}>
                    {t(`cadence.${cadence}`)}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="tourist-tax-portal">{t("portalLabel")}</Label>
          <div className="flex gap-2">
            <Input
              id="tourist-tax-portal"
              type="url"
              value={form.portalUrl ?? ""}
              placeholder={t("portalPlaceholder")}
              onChange={(e) => setForm({ ...form, portalUrl: e.target.value })}
              onBlur={() => save({ portalUrl: form.portalUrl || null })}
              disabled={saving}
            />
            {form.portalUrl && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyPortal}
                  aria-label={t("copyPortal")}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <a
                  href={form.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button type="button" variant="outline" size="icon" aria-label={t("openPortal")}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tourist-tax-classification">{t("classificationLabel")}</Label>
          <Select
            value={form.classification}
            onValueChange={(v) => {
              const classification = v as MeubleClassification;
              setForm({ ...form, classification });
              save({ classification });
            }}
            disabled={saving}
          >
            <SelectTrigger id="tourist-tax-classification">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                ["unclassified", "1", "2", "3", "4", "5", "unknown"] as const
              ).map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`classification.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="tourist-tax-attestation"
            checked={form.attestationOnFile}
            onCheckedChange={(checked) => {
              const attestationOnFile = checked === true;
              setForm({ ...form, attestationOnFile });
              save({ attestationOnFile });
            }}
            disabled={saving}
          />
          <Label htmlFor="tourist-tax-attestation" className="text-sm font-normal">
            {t("attestationOnFile")}
          </Label>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="tourist-tax-notes">{t("notesLabel")}</Label>
          <Textarea
            id="tourist-tax-notes"
            rows={2}
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            onBlur={() => save({ notes: form.notes })}
            disabled={saving}
            placeholder={t("notesPlaceholder")}
          />
        </div>
      </div>

      {summary.periods.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-medium text-slate-900">{t("periodsTitle")}</h4>
          <ul className="mt-2 space-y-2">
            {summary.periods.slice(0, 4).map((period) => {
              const periodTone = STATUS_TONE[period.status] ?? STATUS_TONE.upcoming;
              return (
                <li
                  key={period.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/70 bg-white/60 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {formatPeriodLabel(period.periodStart, period.periodEnd, uiLocale)}
                    </p>
                    <p className="text-xs text-slate-600">
                      {t("nights", { count: period.nightsInPeriod ?? 0 })}
                      {period.status === "due" || period.status === "overdue"
                        ? ` · ${t("dueBy", {
                            date: period.declarationDueDate.toLocaleDateString(
                              uiLocale === "fr" ? "fr-FR" : "en-GB"
                            ),
                          })}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("shrink-0", periodTone.badge)}>
                      {t(`status.${period.status}`)}
                    </Badge>
                    {(period.status === "due" || period.status === "overdue") && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={saving}
                        onClick={() => markDeclared(period.id)}
                      >
                        {t("markDeclared")}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={SERVICE_PUBLIC_TAXE_DE_SEJOUR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-700"
        >
          Service-Public
          <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={CGCT_TAXE_DE_SEJOUR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-700"
        >
          CGCT L.2333-33
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}
