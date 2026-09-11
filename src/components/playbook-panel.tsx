"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CopyFieldChip } from "@/components/copy-field-chip";
import {
  getCtaLabelKey,
  getPreparedFieldsForStep,
  getPrimaryCtaUrl,
  getStepWhyNow,
  stepAppliesToResidency,
} from "@/lib/playbooks";
import type {
  Playbook,
  PlaybookStep,
  PlaybookStepProgress,
  PropertyFieldValues,
  ResidencyStatus,
} from "@/lib/playbooks/types";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Loader2,
  SkipForward,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  propertyId: string;
  property: PropertyFieldValues;
  locale: string;
  onResidencyChange?: (status: ResidencyStatus | null) => void;
};

type PlaybookResponse = {
  playbook: Playbook | null;
  progress: PlaybookStepProgress[];
  nextStepKey: string | null;
  summary: { completed: number; total: number; skipped: number };
};

export function PlaybookPanel({ propertyId, property, locale, onResidencyChange }: Props) {
  const t = useTranslations("playbook");
  const uiLocale = (locale === "fr" ? "fr" : "en") as "en" | "fr";

  const [data, setData] = useState<PlaybookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [residencyStatus, setResidencyStatus] = useState<ResidencyStatus | null>(
    property.residencyStatus ?? null
  );
  const [savingResidency, setSavingResidency] = useState(false);
  const [expandedStepKey, setExpandedStepKey] = useState<string | null>(null);

  const loadPlaybook = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/properties/${propertyId}/playbook`);
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as PlaybookResponse;
      setData(json);
      if (json.nextStepKey) {
        setExpandedStepKey(json.nextStepKey);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadPlaybook();
  }, [loadPlaybook]);

  const updateStep = async (stepKey: string, status: "done" | "skipped" | "pending") => {
    setUpdating(stepKey);
    try {
      const res = await fetch(`/api/properties/${propertyId}/playbook`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepKey, status }),
      });
      if (!res.ok) throw new Error("Update failed");
      await loadPlaybook();
      toast.success(status === "done" ? t("stepDone") : t("stepSkipped"));
    } catch {
      toast.error(t("updateError"));
    } finally {
      setUpdating(null);
    }
  };

  const saveResidencyStatus = async (status: ResidencyStatus | null) => {
    setSavingResidency(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ residencyStatus: status }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setResidencyStatus(status);
      onResidencyChange?.(status);
      await loadPlaybook();
      toast.success(t("residencySaved"));
    } catch {
      toast.error(t("residencySaveError"));
    } finally {
      setSavingResidency(false);
    }
  };

  const getStepStatus = (stepKey: string, progressMap: Map<string, string>) => {
    const status = progressMap.get(stepKey) ?? "pending";
    if (status === "done") return t("statusDone");
    if (status === "skipped") return t("statusSkipped");
    if (stepKey === data?.nextStepKey) return t("statusCurrent");
    return t("statusPending");
  };

  const renderStepExpanded = (step: PlaybookStep, status: string) => {
    const propertyWithResidency = { ...property, residencyStatus };
    const preparedFields = data?.playbook
      ? getPreparedFieldsForStep(step.key, data.playbook, propertyWithResidency, uiLocale)
      : [];
    const stepCta = getPrimaryCtaUrl(step);
    const stepCtaLabelKey = stepCta ? getCtaLabelKey(stepCta.role) : "openLink";

    return (
      <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
        <p className="text-sm text-slate-600">{step.instruction[uiLocale]}</p>

        {preparedFields.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {preparedFields.map((field) => (
              <CopyFieldChip
                key={field.key}
                label={field.label}
                value={field.value}
                copiedLabel={t("copied")}
              />
            ))}
          </div>
        )}

        {step.officialUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stepCta && (
              <a href={stepCta.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3" />
                  {t(stepCtaLabelKey)}
                </Button>
              </a>
            )}
            {step.officialUrls
              .filter((u) => u.url !== stepCta?.url)
              .map((url) => (
                <a key={url.url} href={url.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-3 w-3" />
                    {url.label[uiLocale]}
                  </Button>
                </a>
              ))}
          </div>
        )}

        {status === "pending" && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => updateStep(step.key, "done")}
              disabled={updating === step.key}
            >
              {updating === step.key ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              {t("markDone")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateStep(step.key, "skipped")}
              disabled={updating === step.key}
            >
              <SkipForward className="h-3 w-3" />
              {t("skip")}
            </Button>
          </div>
        )}

        {(status === "done" || status === "skipped") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateStep(step.key, "pending")}
            disabled={updating === step.key}
          >
            {t("undo")}
          </Button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-12 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t("loading")}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-slate-600">{t("loadError")}</p>
          <Button variant="outline" size="sm" onClick={loadPlaybook}>
            {t("retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data?.playbook) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center">
          <p className="text-sm text-slate-500">{t("noPlaybook")}</p>
        </CardContent>
      </Card>
    );
  }

  const { playbook, progress, nextStepKey, summary } = data;
  const progressMap = new Map(progress.map((p) => [p.stepKey, p.status]));
  const nextStep = playbook.steps.find((s) => s.key === nextStepKey) ?? null;
  const allDone = summary.completed + summary.skipped >= summary.total;
  const nextCta = nextStep ? getPrimaryCtaUrl(nextStep) : null;
  const nextCtaLabelKey = nextCta ? getCtaLabelKey(nextCta.role) : "openOfficial";

  const visibleSteps = playbook.steps.filter((step) =>
    stepAppliesToResidency(step, residencyStatus)
  );

  const propertyWithResidency = { ...property, residencyStatus };
  const nextPreparedFields = nextStep
    ? getPreparedFieldsForStep(nextStep.key, playbook, propertyWithResidency, uiLocale)
    : [];

  return (
    <div className="space-y-4">
      {/* Header + compact residency */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-700">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium">{t("guidedCompliance")}</span>
              </div>
              <CardTitle className="mt-1 text-lg">{playbook.title[uiLocale]}</CardTitle>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p className="font-semibold text-slate-900">
                {t("progress", { done: summary.completed, total: summary.total })}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Label className="shrink-0 text-xs text-slate-500">{t("residencyStatus")}</Label>
            <Select
              value={residencyStatus ?? ""}
              onValueChange={(v) =>
                saveResidencyStatus(v === "" ? null : (v as ResidencyStatus))
              }
              disabled={savingResidency}
            >
              <SelectTrigger className="h-8 w-auto min-w-[180px] text-sm">
                <SelectValue placeholder={t("residencyPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">{t("residency.primary")}</SelectItem>
                <SelectItem value="secondary">{t("residency.secondary")}</SelectItem>
                <SelectItem value="other">{t("residency.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {allDone ? (
            <div className="rounded-lg border border-emerald-200 bg-white p-4">
              <p className="font-medium text-emerald-800">{t("allDone.title")}</p>
              <p className="mt-1 text-sm text-slate-600">{t("allDone.description")}</p>
            </div>
          ) : nextStep ? (
            <>
              {/* Layer 1: Next action card */}
              <div className="rounded-lg border border-emerald-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {t("nextAction")}
                  </p>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                    {t("statusCurrent")}
                  </Badge>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  {nextStep.title[uiLocale]}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {getStepWhyNow(nextStep, uiLocale)}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {nextCta && (
                    <a href={nextCta.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm">
                        {t(nextCtaLabelKey)}
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateStep(nextStep.key, "done")}
                    disabled={updating === nextStep.key}
                  >
                    {updating === nextStep.key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {t("markDone")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateStep(nextStep.key, "skipped")}
                    disabled={updating === nextStep.key}
                  >
                    <SkipForward className="h-4 w-4" />
                    {t("skip")}
                  </Button>
                </div>

                {nextPreparedFields.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {nextPreparedFields.map((field) => (
                      <CopyFieldChip
                        key={field.key}
                        label={field.label}
                        value={field.value}
                        copiedLabel={t("copied")}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Layer 2: What you need */}
              {((nextStep.documentsDetailed?.length ?? 0) > 0 ||
                nextStep.documents[uiLocale].length > 0) && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t("whatYouNeed")}
                  </p>
                  {(nextStep.documentsDetailed?.length ?? 0) > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {nextStep.documentsDetailed!.map((doc) => (
                        <li key={doc.name.en} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 text-emerald-600">□</span>
                          <span className="text-slate-700">{doc.name[uiLocale]}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="mt-2 space-y-1">
                      {nextStep.documents[uiLocale].map((doc: string) => (
                        <li key={doc} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-emerald-600">□</span>
                          {doc}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Layer 3: Local pitfalls (collapsed) */}
              {nextStep.pitfalls && (
                <details className="group rounded-lg border border-amber-100 bg-amber-50/50">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-amber-900 [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-2">
                      {t("localPitfalls")}
                      {playbook.city && (
                        <Badge variant="outline" className="border-amber-200 text-amber-800">
                          {playbook.city}
                        </Badge>
                      )}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-4 pb-3 text-sm text-amber-800">{nextStep.pitfalls[uiLocale]}</p>
                </details>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Layer 4: All steps timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("stepsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {visibleSteps.map((step, index) => {
            const status = progressMap.get(step.key) ?? "pending";
            const isNext = step.key === nextStepKey;
            const isExpanded = expandedStepKey === step.key;

            return (
              <div
                key={step.key}
                className={cn(
                  "rounded-lg border transition-colors",
                  isNext && status === "pending" && "border-emerald-200",
                  status === "done" && "border-slate-100 bg-slate-50/50",
                  status === "skipped" && "border-slate-100 opacity-70"
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-3 p-3 text-left"
                  onClick={() => setExpandedStepKey(isExpanded ? null : step.key)}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      status === "done"
                        ? "bg-emerald-600 text-white"
                        : status === "skipped"
                          ? "bg-slate-300 text-slate-600"
                          : isNext
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {status === "done" ? <Check className="h-3 w-3" /> : index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium text-slate-900",
                          status === "done" && "line-through text-slate-500"
                        )}
                      >
                        {step.title[uiLocale]}
                      </p>
                      {isNext && status === "pending" && (
                        <ArrowRight className="h-3 w-3 text-emerald-600" />
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">
                    {getStepStatus(step.key, progressMap)}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-slate-400 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
                {isExpanded && renderStepExpanded(step, status)}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
