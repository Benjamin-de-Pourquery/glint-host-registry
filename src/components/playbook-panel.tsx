"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Loader2,
  SkipForward,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

type Props = {
  propertyId: string;
  property: PropertyFieldValues;
  locale: string;
  onResidencyChange?: (status: ResidencyStatus | null) => void;
  compact?: boolean;
};

type PlaybookResponse = {
  playbook: Playbook | null;
  progress: PlaybookStepProgress[];
  nextStepKey: string | null;
  summary: { completed: number; total: number; skipped: number };
  priorityAction?: {
    level: string;
    title: { en: string; fr: string };
    message: { en: string; fr: string };
  } | null;
};

export function PlaybookPanel({
  propertyId,
  property,
  locale,
  onResidencyChange,
  compact = false,
}: Props) {
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
      <div className="border-t border-slate-100 px-4 pb-4 pt-3">
        <p className="text-sm text-slate-600">{step.instruction[uiLocale]}</p>

        {preparedFields.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
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
          <div className="mt-3 flex flex-wrap gap-2">
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
          <div className="mt-4 flex flex-wrap gap-2">
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
            className="mt-3"
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
      <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        {t("loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50/50 py-12 text-center">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-slate-600">{t("loadError")}</p>
        <Button variant="outline" size="sm" onClick={loadPlaybook}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (!data?.playbook) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
        <p className="text-sm text-slate-500">{t("noPlaybook")}</p>
      </div>
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
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">{t("subtitle")}</p>
            <h2 className="mt-0.5 text-xl font-semibold text-slate-900">
              {playbook.title[uiLocale]}
            </h2>
            {!compact && (
              <p className="mt-1 text-sm text-slate-600">{playbook.description[uiLocale]}</p>
            )}
            {playbook.sourceReviewedAt && (
              <p className="mt-1 text-xs text-slate-400">
                {t("sourceReviewed", { date: playbook.sourceReviewedAt })}
              </p>
            )}
          </div>
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">
              {t("progress", { done: summary.completed, total: summary.total })}
            </span>
            {summary.skipped > 0 && (
              <span className="ml-2 text-xs text-slate-500">
                ({t("skippedCount", { count: summary.skipped })})
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <Label className="text-xs font-medium text-slate-500">{t("residencyStatus")}</Label>
            <Select
              value={residencyStatus ?? ""}
              onValueChange={(v) =>
                saveResidencyStatus(v === "" ? null : (v as ResidencyStatus))
              }
              disabled={savingResidency}
            >
              <SelectTrigger className="mt-1 h-9">
                <SelectValue placeholder={t("residencyPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">{t("residency.primary")}</SelectItem>
                <SelectItem value="secondary">{t("residency.secondary")}</SelectItem>
                <SelectItem value="other">{t("residency.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="pb-1 text-xs text-slate-500">{t("residencyHint")}</p>
        </div>
      </div>

      {allDone ? (
        <EmptyState
          icon={CheckCircle2}
          variant="success"
          title={t("allDone.title")}
          description={t("allDone.description")}
          className="border-0 py-8"
        />
      ) : nextStep ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-6 py-8">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                {t("nextAction")}
              </p>
              <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                {t("statusCurrent")}
              </Badge>
            </div>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{nextStep.title[uiLocale]}</h3>
            <p className="mt-3 text-base text-slate-600">
              {getStepWhyNow(nextStep, uiLocale)}
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {nextCta && (
                <a href={nextCta.url} target="_blank" rel="noopener noreferrer">
                  <Button size="lg">
                    {t(nextCtaLabelKey)}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              )}
              <Button
                variant="secondary"
                size="lg"
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
                size="lg"
                onClick={() => updateStep(nextStep.key, "skipped")}
                disabled={updating === nextStep.key}
              >
                <SkipForward className="h-4 w-4" />
                {t("skip")}
              </Button>
            </div>

            {nextPreparedFields.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
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

          {((nextStep.documentsDetailed?.length ?? 0) > 0 ||
            nextStep.documents[uiLocale].length > 0) && (
            <div className="rounded-xl border border-slate-200 px-5 py-4">
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

          {nextStep.pitfalls && (
            <details className="group rounded-xl border border-amber-100 bg-amber-50/50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-3 text-sm font-medium text-amber-900 [&::-webkit-details-marker]:hidden">
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
              <p className="px-5 pb-4 text-sm text-amber-800">{nextStep.pitfalls[uiLocale]}</p>
            </details>
          )}
        </div>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("stepsTitle")}
        </h3>
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {visibleSteps.map((step, index) => {
            const status = progressMap.get(step.key) ?? "pending";
            const isNext = step.key === nextStepKey;
            const isExpanded = expandedStepKey === step.key;

            return (
              <div
                key={step.key}
                className={cn(
                  isNext && status === "pending" && "bg-emerald-50/40",
                  status === "skipped" && "opacity-70"
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/80"
                  onClick={() => setExpandedStepKey(isExpanded ? null : step.key)}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      status === "done"
                        ? "bg-emerald-600 text-white"
                        : status === "skipped"
                          ? "bg-slate-300 text-slate-600"
                          : isNext
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {status === "done" ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          "font-medium text-slate-900",
                          status === "done" && "line-through text-slate-500"
                        )}
                      >
                        {step.title[uiLocale]}
                      </p>
                      {isNext && status === "pending" && (
                        <ArrowRight className="h-3 w-3 text-emerald-600" />
                      )}
                    </div>
                    {!isExpanded && (
                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {step.instruction[uiLocale]}
                      </p>
                    )}
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
        </div>
      </div>
    </div>
  );
}

/** Lightweight summary for the Overview tab */
export function PlaybookNextActionTeaser({
  propertyId,
  locale,
  onGoToCompliance,
}: {
  propertyId: string;
  locale: string;
  onGoToCompliance: () => void;
}) {
  const t = useTranslations("playbook");
  const uiLocale = (locale === "fr" ? "fr" : "en") as "en" | "fr";
  const [data, setData] = useState<PlaybookResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/properties/${propertyId}/playbook`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("loading")}
      </div>
    );
  }

  if (data?.priorityAction) {
    const urgent =
      data.priorityAction.level === "exceeded" || data.priorityAction.level === "critical";
    if (urgent) {
      return (
        <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
            {t("nextAction")}
          </p>
          <p className="mt-1 font-semibold text-slate-900">
            {data.priorityAction.title[uiLocale]}
          </p>
          <p className="mt-1 text-sm text-slate-600">{data.priorityAction.message[uiLocale]}</p>
          <Button className="mt-3" size="sm" onClick={onGoToCompliance}>
            {t("viewCompliance")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  }

  if (!data?.playbook || !data.nextStepKey) {
    if (data?.playbook && data.summary.completed + data.summary.skipped >= data.summary.total) {
      return (
        <EmptyState
          icon={CheckCircle2}
          variant="success"
          title={t("allDone.title")}
          description={t("allDone.description")}
          className="py-6"
        />
      );
    }
    return null;
  }

  const nextStep = data.playbook.steps.find((s) => s.key === data.nextStepKey);
  if (!nextStep) return null;

  return (
    <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        {t("nextAction")}
      </p>
      <p className="mt-1 font-semibold text-slate-900">{nextStep.title[uiLocale]}</p>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">
        {getStepWhyNow(nextStep, uiLocale)}
      </p>
      <p className="mt-2 text-xs text-slate-500">
        {t("progress", { done: data.summary.completed, total: data.summary.total })}
      </p>
      <Button className="mt-3" size="sm" onClick={onGoToCompliance}>
        {t("viewCompliance")}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
