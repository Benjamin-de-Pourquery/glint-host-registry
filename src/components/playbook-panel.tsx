"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPreparedFieldsText } from "@/lib/playbooks";
import type { Playbook, PlaybookStepProgress, PropertyFieldValues } from "@/lib/playbooks/types";
import {
  ArrowRight,
  Check,
  Copy,
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
};

type PlaybookResponse = {
  playbook: Playbook | null;
  progress: PlaybookStepProgress[];
  nextStepKey: string | null;
  summary: { completed: number; total: number; skipped: number };
};

export function PlaybookPanel({ propertyId, property, locale }: Props) {
  const t = useTranslations("playbook");
  const uiLocale = (locale === "fr" ? "fr" : "en") as "en" | "fr";

  const [data, setData] = useState<PlaybookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadPlaybook = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/properties/${propertyId}/playbook`);
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as PlaybookResponse;
      setData(json);
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

  const copyPreparedFields = (stepKey: string) => {
    if (!data?.playbook) return;
    const text = buildPreparedFieldsText(stepKey, data.playbook, property, uiLocale);
    if (!text) {
      toast.error(t("nothingToCopy"));
      return;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t("copied"));
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-700">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium">{t("guidedCompliance")}</span>
              </div>
              <CardTitle className="mt-1">{playbook.title[uiLocale]}</CardTitle>
              <p className="mt-1 text-sm text-slate-600">{playbook.description[uiLocale]}</p>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p className="font-semibold text-slate-900">
                {t("progress", { done: summary.completed, total: summary.total })}
              </p>
              {summary.skipped > 0 && (
                <p className="text-xs text-slate-500">
                  {t("skippedCount", { count: summary.skipped })}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {allDone ? (
            <div className="rounded-lg border border-emerald-200 bg-white p-4">
              <p className="font-medium text-emerald-800">{t("allDone.title")}</p>
              <p className="mt-1 text-sm text-slate-600">{t("allDone.description")}</p>
            </div>
          ) : nextStep ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {t("nextAction")}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {nextStep.title[uiLocale]}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{nextStep.instruction[uiLocale]}</p>
              </div>

              {nextStep.documents[uiLocale].length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500">{t("prepare")}</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
                    {nextStep.documents[uiLocale].map((doc: string) => (
                      <li key={doc}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {nextStep.timeline && (
                <p className="text-xs text-slate-500">
                  <span className="font-medium">{t("timeline")}: </span>
                  {nextStep.timeline[uiLocale]}
                </p>
              )}

              {nextStep.pitfalls && (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {nextStep.pitfalls[uiLocale]}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {nextStep.officialUrls[0] && (
                  <a
                    href={nextStep.officialUrls[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button>
                      {t("openOfficial")}
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                <Button variant="outline" onClick={() => copyPreparedFields(nextStep.key)}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? t("copied") : t("copyFields")}
                </Button>
                <Button
                  variant="secondary"
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
                  onClick={() => updateStep(nextStep.key, "skipped")}
                  disabled={updating === nextStep.key}
                >
                  <SkipForward className="h-4 w-4" />
                  {t("skip")}
                </Button>
              </div>

              {nextStep.officialUrls.some((u) => !u.urlVerified) && (
                <p className="text-xs text-amber-700">{t("verifyUrl")}</p>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("stepsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {playbook.steps.map((step, index) => {
            const status = progressMap.get(step.key) ?? "pending";
            const isNext = step.key === nextStepKey;

            return (
              <div
                key={step.key}
                className={cn(
                  "rounded-lg border p-4 transition-colors",
                  isNext && "border-emerald-200 bg-emerald-50/50",
                  status === "done" && "border-slate-100 bg-slate-50/50",
                  status === "skipped" && "border-slate-100 opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
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
                    {status === "done" ? <Check className="h-4 w-4" /> : index + 1}
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
                      {status === "skipped" && (
                        <span className="text-xs text-slate-400">{t("skipped")}</span>
                      )}
                      {isNext && status === "pending" && (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <ArrowRight className="h-3 w-3" />
                          {t("current")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{step.instruction[uiLocale]}</p>

                    {status === "pending" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {step.officialUrls[0] && (
                          <a
                            href={step.officialUrls[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3" />
                              {t("openLink")}
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStep(step.key, "done")}
                          disabled={updating === step.key}
                        >
                          <Check className="h-3 w-3" />
                          {t("markDone")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStep(step.key, "skipped")}
                          disabled={updating === step.key}
                        >
                          {t("skip")}
                        </Button>
                      </div>
                    )}

                    {(status === "done" || status === "skipped") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => updateStep(step.key, "pending")}
                        disabled={updating === step.key}
                      >
                        {t("undo")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
