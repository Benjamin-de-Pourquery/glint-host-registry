"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isFranceCountry } from "@/lib/national-transition";
import { nlNightCapApplies } from "@/lib/netherlands/night-cap";
import type { NightCapComputation } from "@/lib/france/night-cap";
import type { BudgetWindow, CapGuardMode } from "@/lib/cap-guard/types";
import { Copy, Loader2, RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CapGuardForecast = {
  nightsUsed: number;
  bookedAhead: number;
  remaining: number;
  projectedCapDate: string | null;
};

type CapGuardEvent = {
  id: string;
  eventType: string;
  createdAt: string;
};

type CapGuardResponse = {
  applies: boolean;
  policy: {
    enabled: boolean;
    mode: CapGuardMode;
    bufferNights: number;
    budgetWindows: BudgetWindow[];
    registrationGate: boolean;
    feedToken: string;
    feedTokenRotatedAt: string | null;
    propagationConfirmedAt: string | null;
    suggestedBufferNights: number;
  } | null;
  computation: NightCapComputation | null;
  forecast: CapGuardForecast | null;
  blocks: Array<{ start: string; end: string }>;
  triggerReason: string;
  feedUrl: string | null;
  registrationExpiry: string | null;
  events: CapGuardEvent[];
};

type Props = {
  propertyId: string;
  country: string;
  city?: string;
  residencyStatus?: string | null;
  locale: string;
};

const MODE_TONE: Record<string, string> = {
  HARD_STOP: "bg-red-100 text-red-800",
  BUFFER: "bg-amber-100 text-amber-800",
  BUDGET: "bg-blue-100 text-blue-800",
};

export function CapGuardCard({
  propertyId,
  country,
  city = "",
  residencyStatus,
  locale,
}: Props) {
  const t = useTranslations("capGuard");
  const [data, setData] = useState<CapGuardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wizardPlatform, setWizardPlatform] = useState("airbnb");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/cap-guard`);
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as CapGuardResponse;
      setData(json);
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [propertyId, t]);

  useEffect(() => {
    load();
  }, [load]);

  const isFrancePrimary =
    isFranceCountry(country) && residencyStatus === "primary";
  const isNlNightCap = nlNightCapApplies(country, residencyStatus, city);

  if (!isFrancePrimary && !isNlNightCap) {
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

  if (!data?.applies || !data.policy || !data.computation) {
    return null;
  }

  const { policy, computation, forecast } = data;

  const patch = async (body: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/cap-guard`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      const json = (await res.json()) as CapGuardResponse;
      setData(json);
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const rotateToken = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/cap-guard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rotate" }),
      });
      if (!res.ok) throw new Error("Rotate failed");
      const json = (await res.json()) as CapGuardResponse;
      setData(json);
      toast.success(t("tokenRotated"));
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const copyFeedUrl = async () => {
    if (!data.feedUrl) return;
    try {
      await navigator.clipboard.writeText(data.feedUrl);
      toast.success(t("feedCopied"));
    } catch {
      toast.error(t("copyError"));
    }
  };

  const updateBudgetWindow = (
    index: number,
    field: keyof BudgetWindow,
    value: string | number
  ) => {
    const next = [...policy.budgetWindows];
    next[index] = { ...next[index], [field]: value };
    patch({ budgetWindows: next });
  };

  const addBudgetWindow = () => {
    const year = computation.year;
    patch({
      budgetWindows: [
        ...policy.budgetWindows,
        {
          start: `${year}-07-01`,
          end: `${year}-08-31`,
          allocatedNights: Math.max(1, Math.floor(computation.remaining / 2)),
        },
      ],
    });
  };

  const removeBudgetWindow = (index: number) => {
    patch({
      budgetWindows: policy.budgetWindows.filter((_, i) => i !== index),
    });
  };

  return (
    <section
      className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-white p-5 shadow-sm"
      aria-labelledby="cap-guard-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 text-indigo-700 ring-1 ring-indigo-200/80">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 id="cap-guard-title" className="font-semibold text-slate-900">
              {t("title")}
            </h3>
            <p className="mt-0.5 text-sm text-slate-600">{t("subtitle")}</p>
          </div>
        </div>
        <Badge className={cn("shrink-0", MODE_TONE[policy.mode] ?? "bg-slate-100")}>
          {t(`mode.${policy.mode}`)}
        </Badge>
      </div>

      <p className="mt-4 rounded-lg border border-white/60 bg-white/70 px-3 py-2 text-sm text-slate-700">
        {t("disclaimer")}
      </p>

      {forecast && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/80 bg-white/80 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">{t("forecast.used")}</p>
            <p className="text-lg font-semibold text-slate-900">
              {forecast.nightsUsed} / {computation.limit}
            </p>
          </div>
          <div className="rounded-lg border border-white/80 bg-white/80 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">{t("forecast.bookedAhead")}</p>
            <p className="text-lg font-semibold text-slate-900">{forecast.bookedAhead}</p>
          </div>
          <div className="rounded-lg border border-white/80 bg-white/80 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">{t("forecast.remaining")}</p>
            <p className="text-lg font-semibold text-slate-900">{forecast.remaining}</p>
          </div>
          <div className="rounded-lg border border-white/80 bg-white/80 px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">{t("forecast.projectedCap")}</p>
            <p className="text-lg font-semibold text-slate-900">
              {forecast.projectedCapDate ?? t("forecast.notAvailable")}
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="cap-guard-enabled"
            checked={policy.enabled}
            onCheckedChange={(checked) => patch({ enabled: checked === true })}
            disabled={saving}
          />
          <Label htmlFor="cap-guard-enabled" className="text-sm font-normal">
            {t("enabled")}
          </Label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cap-guard-mode">{t("modeLabel")}</Label>
            <Select
              value={policy.mode}
              onValueChange={(value) => patch({ mode: value as CapGuardMode })}
              disabled={saving}
            >
              <SelectTrigger id="cap-guard-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HARD_STOP">{t("mode.HARD_STOP")}</SelectItem>
                <SelectItem value="BUFFER">{t("mode.BUFFER")}</SelectItem>
                <SelectItem value="BUDGET">{t("mode.BUDGET")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {policy.mode === "BUFFER" && (
            <div className="space-y-1.5">
              <Label htmlFor="cap-guard-buffer">{t("bufferLabel")}</Label>
              <Input
                id="cap-guard-buffer"
                type="number"
                min={1}
                max={120}
                value={policy.bufferNights}
                disabled={saving}
                onChange={(e) =>
                  setData((prev) =>
                    prev?.policy
                      ? {
                          ...prev,
                          policy: {
                            ...prev.policy,
                            bufferNights: Number(e.target.value),
                          },
                        }
                      : prev
                  )
                }
                onBlur={() => patch({ bufferNights: policy.bufferNights })}
              />
              <p className="text-xs text-slate-500">
                {t("bufferHint", { nights: policy.suggestedBufferNights })}
              </p>
            </div>
          )}
        </div>

        {policy.mode === "BUDGET" && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white/70 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">{t("budget.title")}</p>
              <Button type="button" variant="outline" size="sm" onClick={addBudgetWindow} disabled={saving}>
                {t("budget.addWindow")}
              </Button>
            </div>
            {policy.budgetWindows.length === 0 && (
              <p className="text-sm text-slate-600">{t("budget.empty")}</p>
            )}
            {policy.budgetWindows.map((window, index) => (
              <div key={`${window.start}-${index}`} className="grid gap-2 sm:grid-cols-4">
                <Input
                  type="date"
                  value={window.start}
                  disabled={saving}
                  onChange={(e) => updateBudgetWindow(index, "start", e.target.value)}
                />
                <Input
                  type="date"
                  value={window.end}
                  disabled={saving}
                  onChange={(e) => updateBudgetWindow(index, "end", e.target.value)}
                />
                <Input
                  type="number"
                  min={0}
                  value={window.allocatedNights}
                  disabled={saving}
                  onChange={(e) =>
                    updateBudgetWindow(index, "allocatedNights", Number(e.target.value))
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBudgetWindow(index)}
                  disabled={saving}
                >
                  {t("budget.remove")}
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Checkbox
            id="cap-guard-registration-gate"
            checked={policy.registrationGate}
            onCheckedChange={(checked) =>
              patch({ registrationGate: checked === true })
            }
            disabled={saving || !data.registrationExpiry}
          />
          <Label htmlFor="cap-guard-registration-gate" className="text-sm font-normal">
            {t("registrationGate")}
          </Label>
        </div>
        {!data.registrationExpiry && (
          <p className="text-xs text-slate-500">{t("registrationGateUnavailable")}</p>
        )}
      </div>

      <div className="mt-5 space-y-2 rounded-lg border border-slate-200 bg-white/80 p-3">
        <Label>{t("feedUrlLabel")}</Label>
        <div className="flex flex-wrap gap-2">
          <Input readOnly value={data.feedUrl ?? ""} className="font-mono text-xs" />
          <Button type="button" variant="outline" size="sm" onClick={copyFeedUrl}>
            <Copy className="mr-1 h-3.5 w-3.5" />
            {t("copyFeed")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={rotateToken} disabled={saving}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            {t("rotateToken")}
          </Button>
        </div>
        <p className="text-xs text-slate-500">{t("feedHint")}</p>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-900">{t("wizard.title")}</p>
        <Tabs value={wizardPlatform} onValueChange={setWizardPlatform} className="mt-2">
          <TabsList>
            <TabsTrigger value="airbnb">{t("wizard.airbnb.tab")}</TabsTrigger>
            <TabsTrigger value="booking">{t("wizard.booking.tab")}</TabsTrigger>
            <TabsTrigger value="vrbo">{t("wizard.vrbo.tab")}</TabsTrigger>
          </TabsList>
          <TabsContent value="airbnb" className="text-sm text-slate-700">
            {t("wizard.airbnb.steps")}
          </TabsContent>
          <TabsContent value="booking" className="text-sm text-slate-700">
            {t("wizard.booking.steps")}
          </TabsContent>
          <TabsContent value="vrbo" className="text-sm text-slate-700">
            {t("wizard.vrbo.steps")}
          </TabsContent>
        </Tabs>
        <p className="mt-2 text-xs text-slate-500">{t("wizard.channelManagerNote")}</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={policy.propagationConfirmedAt ? "secondary" : "outline"}
          size="sm"
          disabled={saving || Boolean(policy.propagationConfirmedAt)}
          onClick={() => patch({ propagationConfirmed: true })}
        >
          {policy.propagationConfirmedAt ? t("propagation.confirmed") : t("propagation.confirm")}
        </Button>
        <p className="text-xs text-slate-500">
          {t("blocksPublished", { count: data.blocks.length })}
        </p>
      </div>

      {data.events.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t("history.title")}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {data.events.slice(0, 4).map((event) => (
              <li key={event.id}>
                {t(`history.${event.eventType}`, {
                  date: new Date(event.createdAt).toLocaleDateString(locale),
                })}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
