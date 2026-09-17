"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
  LEGIFRANCE_L324_1_1_URL,
  SERVICE_PUBLIC_STR_URL,
  type NightCapComputation,
  type NightCapSource,
} from "@/lib/france/night-cap";
import { isFranceCountry } from "@/lib/national-transition";
import { ExternalLink, Loader2, Moon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type NightCapSettings = {
  nightCapEnabled: boolean;
  nightCapLimit: number;
  nightCapYear: number;
  nightCapSource: NightCapSource;
  notes: string | null;
};

type NightCapResponse = {
  applies: boolean;
  settings: NightCapSettings | null;
  computation: NightCapComputation | null;
  priorityAction: {
    level: string;
    title: { en: string; fr: string };
    message: { en: string; fr: string };
  } | null;
};

type Props = {
  propertyId: string;
  country: string;
  residencyStatus?: string | null;
  locale: string;
  registerTabHref?: string;
};

const STATUS_TONE: Record<
  string,
  { badge: string; bar: string; card: string }
> = {
  ok: {
    badge: "bg-emerald-100 text-emerald-800",
    bar: "bg-emerald-500",
    card: "border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white",
  },
  warning: {
    badge: "bg-amber-100 text-amber-800",
    bar: "bg-amber-500",
    card: "border-amber-200 bg-gradient-to-br from-amber-50/80 to-white",
  },
  critical: {
    badge: "bg-orange-100 text-orange-900",
    bar: "bg-orange-500",
    card: "border-orange-200 bg-gradient-to-br from-orange-50/80 to-white",
  },
  exceeded: {
    badge: "bg-red-100 text-red-800",
    bar: "bg-red-600",
    card: "border-red-200 bg-gradient-to-br from-red-50/80 to-white",
  },
  disabled: {
    badge: "bg-slate-100 text-slate-600",
    bar: "bg-slate-300",
    card: "border-slate-200 bg-slate-50/80",
  },
};

export function NightCapCard({
  propertyId,
  country,
  residencyStatus,
  locale,
  registerTabHref,
}: Props) {
  const t = useTranslations("nightCap");
  const uiLocale = locale === "fr" ? "fr" : "en";

  const [data, setData] = useState<NightCapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NightCapSettings | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/night-cap`);
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as NightCapResponse;
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

  if (!isFranceCountry(country) || residencyStatus !== "primary") {
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

  if (!data?.applies || !data.computation || !form) {
    return null;
  }

  const { computation } = data;
  const tone = STATUS_TONE[computation.status] ?? STATUS_TONE.ok;
  const progressPercent = Math.min(100, computation.percentUsed);

  const save = async (patch: Partial<NightCapSettings>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/night-cap`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Save failed");
      const json = (await res.json()) as NightCapResponse;
      setData(json);
      if (json.settings) setForm(json.settings);
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const handleSourceChange = (source: NightCapSource) => {
    const limit =
      source === "commune_90" ? 90 : source === "statutory_120" ? 120 : form.nightCapLimit;
    const next = { ...form, nightCapSource: source, nightCapLimit: limit };
    setForm(next);
    save({ nightCapSource: source, nightCapLimit: limit });
  };

  return (
    <section
      className={cn("rounded-xl border p-5 shadow-sm", tone.card)}
      aria-labelledby="night-cap-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 text-slate-700 ring-1 ring-slate-200/80">
            <Moon className="h-5 w-5" />
          </div>
          <div>
            <h3 id="night-cap-title" className="font-semibold text-slate-900">
              {t("title")}
            </h3>
            <p className="mt-0.5 text-sm text-slate-600">{t("subtitle")}</p>
          </div>
        </div>
        <Badge className={cn("shrink-0", tone.badge)}>
          {t(`status.${computation.status}`)}
        </Badge>
      </div>

      {data.priorityAction && (
        <p className="mt-4 rounded-lg border border-white/60 bg-white/70 px-3 py-2 text-sm text-slate-800">
          {data.priorityAction.message[uiLocale]}
        </p>
      )}

      <div className="mt-5">
        <div className="flex items-end justify-between gap-2 text-sm">
          <span className="font-medium text-slate-900">
            {t("used", {
              used: computation.nightsUsed,
              limit: computation.limit,
            })}
          </span>
          <span className="text-slate-600">
            {t("remaining", { count: computation.remaining })}
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-slate-200/60">
          <div
            className={cn("h-full rounded-full transition-all", tone.bar)}
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={computation.nightsUsed}
            aria-valuemin={0}
            aria-valuemax={computation.limit}
            aria-label={t("progressLabel")}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          {t("year", { year: computation.year })} · {t("countingMethod")}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-2 sm:col-span-2">
          <Checkbox
            id="night-cap-enabled"
            checked={form.nightCapEnabled}
            onCheckedChange={(checked) => {
              const enabled = checked === true;
              setForm({ ...form, nightCapEnabled: enabled });
              save({ nightCapEnabled: enabled });
            }}
            disabled={saving}
          />
          <Label htmlFor="night-cap-enabled" className="text-sm font-normal">
            {t("enabled")}
          </Label>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="night-cap-source">{t("sourceLabel")}</Label>
          <Select
            value={form.nightCapSource}
            onValueChange={(v) => handleSourceChange(v as NightCapSource)}
            disabled={saving}
          >
            <SelectTrigger id="night-cap-source">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="statutory_120">{t("source.statutory_120")}</SelectItem>
              <SelectItem value="commune_90">{t("source.commune_90")}</SelectItem>
              <SelectItem value="custom">{t("source.custom")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="night-cap-limit">{t("limitLabel")}</Label>
          <Input
            id="night-cap-limit"
            type="number"
            min={1}
            max={366}
            value={form.nightCapLimit}
            disabled={form.nightCapSource !== "custom" || saving}
            onChange={(e) =>
              setForm({ ...form, nightCapLimit: Number(e.target.value) })
            }
            onBlur={() => {
              if (form.nightCapSource === "custom") {
                save({ nightCapLimit: form.nightCapLimit });
              }
            }}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="night-cap-notes">{t("notesLabel")}</Label>
          <Textarea
            id="night-cap-notes"
            rows={2}
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            onBlur={() => save({ notes: form.notes })}
            disabled={saving}
            placeholder={t("notesPlaceholder")}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {registerTabHref && (
          <Link href={registerTabHref}>
            <Button variant="outline" size="sm">
              {t("viewStays")}
            </Button>
          </Link>
        )}
        <a
          href={LEGIFRANCE_L324_1_1_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-700"
        >
          L324-1-1
          <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={SERVICE_PUBLIC_STR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-700"
        >
          Service-Public
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}
