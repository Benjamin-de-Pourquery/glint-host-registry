"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Download, FileJson, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type PeriodPreset = "90d" | "calendar_year" | "custom";
type PackLocale = "en" | "fr";

type Warning = {
  key: string;
  linkTab?: "register" | "listings" | "compliance";
};

type Props = {
  propertyId: string;
  locale: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EvidencePackDialog({ propertyId, locale, open, onOpenChange }: Props) {
  const t = useTranslations("evidencePack");
  const [preset, setPreset] = useState<PeriodPreset>("90d");
  const [packLocale, setPackLocale] = useState<PackLocale>(
    locale === "fr" ? "fr" : "en"
  );
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loadingPrecheck, setLoadingPrecheck] = useState(false);
  const [generating, setGenerating] = useState(false);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams({
      action: "precheck",
      preset,
      locale: packLocale,
    });
    if (preset === "custom" && customStart && customEnd) {
      params.set("periodStart", customStart);
      params.set("periodEnd", customEnd);
    }
    return params.toString();
  }, [preset, packLocale, customStart, customEnd]);

  const fetchPrecheck = useCallback(async () => {
    if (preset === "custom" && (!customStart || !customEnd)) {
      setWarnings([]);
      return;
    }

    setLoadingPrecheck(true);
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/evidence-pack?${buildQuery()}`
      );
      if (!res.ok) {
        setWarnings([]);
        return;
      }
      const data = (await res.json()) as { warnings: Warning[] };
      setWarnings(data.warnings ?? []);
    } catch {
      setWarnings([]);
    } finally {
      setLoadingPrecheck(false);
    }
  }, [propertyId, buildQuery, preset, customStart, customEnd]);

  useEffect(() => {
    if (open) {
      fetchPrecheck();
    }
  }, [open, fetchPrecheck]);

  const buildGenerateBody = () => ({
    preset,
    locale: packLocale,
    ...(preset === "custom" ? { periodStart: customStart, periodEnd: customEnd } : {}),
  });

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleGeneratePdf = async () => {
    if (preset === "custom" && (!customStart || !customEnd)) {
      toast.error(t("errors.customPeriodRequired"));
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/evidence-pack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildGenerateBody(), format: "pdf" }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        toast.error(err?.error ?? t("errors.generateFailed"));
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] ?? "evidence-pack.pdf";
      downloadBlob(blob, filename);
      toast.success(t("success.pdfDownloaded"));
      onOpenChange(false);
    } catch {
      toast.error(t("errors.generateFailed"));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadManifest = async () => {
    if (preset === "custom" && (!customStart || !customEnd)) {
      toast.error(t("errors.customPeriodRequired"));
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/evidence-pack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildGenerateBody(), format: "manifest" }),
      });

      if (!res.ok) {
        toast.error(t("errors.generateFailed"));
        return;
      }

      const manifest = await res.json();
      const blob = new Blob([JSON.stringify(manifest, null, 2)], {
        type: "application/json",
      });
      downloadBlob(blob, `evidence-pack-manifest-${format(new Date(), "yyyy-MM-dd")}.json`);
      toast.success(t("success.manifestDownloaded"));
    } catch {
      toast.error(t("errors.generateFailed"));
    } finally {
      setGenerating(false);
    }
  };

  const warningHref = (warning: Warning) => {
    if (!warning.linkTab) return null;
    return `/${locale}/app/properties/${propertyId}?tab=${warning.linkTab}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("period.label")}</Label>
            <div className="flex flex-wrap gap-2">
              {(["90d", "calendar_year", "custom"] as PeriodPreset[]).map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={preset === value ? "default" : "outline"}
                  onClick={() => setPreset(value)}
                >
                  {t(`period.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          {preset === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="period-start">{t("period.start")}</Label>
                <input
                  id="period-start"
                  type="date"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="period-end">{t("period.end")}</Label>
                <input
                  id="period-end"
                  type="date"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("locale.label")}</Label>
            <div className="flex gap-2">
              {(["en", "fr"] as PackLocale[]).map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={packLocale === value ? "default" : "outline"}
                  onClick={() => setPackLocale(value)}
                >
                  {t(`locale.${value}`)}
                </Button>
              ))}
            </div>
          </div>

          {(loadingPrecheck || warnings.length > 0) && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">{t("warnings.title")}</p>
              {loadingPrecheck ? (
                <p className="mt-1 text-amber-800">{t("warnings.checking")}</p>
              ) : (
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {warnings.map((warning) => {
                    const href = warningHref(warning);
                    return (
                      <li key={warning.key}>
                        {href ? (
                          <a href={href} className="underline hover:text-amber-950">
                            {t(`warnings.${warning.key}`)}
                          </a>
                        ) : (
                          t(`warnings.${warning.key}`)
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-2 text-xs text-amber-800">{t("warnings.softNote")}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleGeneratePdf}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {t("actions.generatePdf")}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadManifest}
            disabled={generating}
            className="w-full"
          >
            <FileJson className="h-4 w-4" />
            {t("actions.downloadManifest")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type TriggerProps = {
  propertyId: string;
  locale: string;
};

export function EvidencePackButton({ propertyId, locale }: TriggerProps) {
  const t = useTranslations("evidencePack");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Download className="h-4 w-4" />
        {t("trigger")}
      </Button>
      <EvidencePackDialog
        propertyId={propertyId}
        locale={locale}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
