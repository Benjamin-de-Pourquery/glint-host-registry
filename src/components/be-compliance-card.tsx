"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Copy, Check, Shield } from "lucide-react";
import {
  getBelgiumDossierProgress,
  type BelgiumRegistration,
} from "@/lib/belgium/registration-compliance";
import {
  getBrusselsRulesUrl,
  getFlandersAanmeldingUrl,
  getWalloniaTourismUrl,
} from "@/lib/belgium/official-links";
import type { BelgiumRegion } from "@/lib/belgium/regions";
import { toast } from "sonner";

export const BE_REGISTRATION_STATUSES = [
  "not_started",
  "dossier_in_progress",
  "active",
  "expired",
  "unknown",
] as const;

export const BE_REGIONS = ["brussels", "flanders", "wallonia"] as const;

export const BE_OPERATOR_CATEGORIES = ["private", "professional"] as const;

export const BE_DOSSIER_STATUSES = ["not_started", "pending", "valid", "expired"] as const;

type Props = {
  propertyId: string;
  city: string;
  registration: BelgiumRegistration | null;
};

function regionalPortalUrl(region: string | null | undefined): string {
  switch (region) {
    case "brussels":
      return getBrusselsRulesUrl();
    case "flanders":
      return getFlandersAanmeldingUrl();
    case "wallonia":
      return getWalloniaTourismUrl();
    default:
      return getBrusselsRulesUrl();
  }
}

export function BeComplianceCard({ propertyId, city, registration }: Props) {
  const t = useTranslations("be.compliance");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (d: string | Date | null | undefined) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  const [form, setForm] = useState({
    beRegistrationNumber: registration?.beRegistrationNumber ?? "",
    beRegistrationStatus: registration?.beRegistrationStatus ?? "not_started",
    beRegistrationDisplayedOnListings:
      registration?.beRegistrationDisplayedOnListings ?? false,
    beRegion: registration?.beRegion ?? "",
    beOperatorCategory: registration?.beOperatorCategory ?? "",
    beFireSafetyStatus: registration?.beFireSafetyStatus ?? "not_started",
    beInsuranceStatus: registration?.beInsuranceStatus ?? "not_started",
    beUrbanPlanningStatus: registration?.beUrbanPlanningStatus ?? "not_started",
    beDossierSubmittedAt: formatDate(registration?.beDossierSubmittedAt),
  });

  const dossierProgress = getBelgiumDossierProgress(
    { ...registration, ...form },
    form.beRegion as BelgiumRegion
  );

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          beRegion: form.beRegion || null,
          beOperatorCategory: form.beOperatorCategory || null,
          beDossierSubmittedAt: form.beDossierSubmittedAt || null,
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

  const copyNumber = () => {
    if (form.beRegistrationNumber) {
      navigator.clipboard.writeText(form.beRegistrationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const regStatusVariant =
    form.beRegistrationStatus === "active"
      ? "secondary"
      : form.beRegistrationStatus === "expired"
        ? "destructive"
        : "outline";

  const dossierChip = (status: string, label: string) => {
    const variant =
      status === "valid"
        ? "secondary"
        : status === "expired"
          ? "destructive"
          : status === "pending"
            ? "outline"
            : "outline";
    return (
      <Badge key={label} variant={variant} className="text-xs">
        {label}: {t(`dossierStatus.${status}` as "dossierStatus.not_started")}
      </Badge>
    );
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50/30">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-yellow-700" />
          {t("title")}
          <Badge variant={regStatusVariant} className="text-xs">
            {t(`registrationStatus.${form.beRegistrationStatus}` as "registrationStatus.not_started")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm text-yellow-900">
        <p className="text-xs text-yellow-800">{t("description")}</p>

        <div className="space-y-3 rounded-lg border border-yellow-200 bg-white/60 p-4">
          <h4 className="font-medium">{t("regionSection")}</h4>
          <div className="space-y-2">
            <Label>{t("regionLabel")}</Label>
            <Select
              value={form.beRegion || "unknown"}
              onValueChange={(v) =>
                setForm({ ...form, beRegion: v === "unknown" ? "" : v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("regionPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">{t("regionUnknown")}</SelectItem>
                {BE_REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`regions.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-yellow-700">
              {t("regionHint", { city })}
            </p>
          </div>

          {form.beRegion === "brussels" && (
            <div className="space-y-2">
              <Label>{t("operatorCategory")}</Label>
              <Select
                value={form.beOperatorCategory || "none"}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    beOperatorCategory: v === "none" ? "" : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("operatorCategoryPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("operatorCategoryUnset")}</SelectItem>
                  {BE_OPERATOR_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`operatorCategories.${c}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-lg border border-yellow-200 bg-white/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-medium">{t("dossierSection")}</h4>
            <Badge variant="outline" className="text-xs">
              {t("dossierProgress", {
                completed: dossierProgress.completed,
                total: dossierProgress.total,
              })}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {dossierChip(form.beFireSafetyStatus, t("fireSafety"))}
            {dossierChip(form.beInsuranceStatus, t("insurance"))}
            {form.beRegion === "brussels" &&
              dossierChip(form.beUrbanPlanningStatus, t("urbanPlanning"))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("fireSafety")}</Label>
              <Select
                value={form.beFireSafetyStatus}
                onValueChange={(v) => setForm({ ...form, beFireSafetyStatus: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BE_DOSSIER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`dossierStatus.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("insurance")}</Label>
              <Select
                value={form.beInsuranceStatus}
                onValueChange={(v) => setForm({ ...form, beInsuranceStatus: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BE_DOSSIER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`dossierStatus.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.beRegion === "brussels" && (
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("urbanPlanning")}</Label>
                <Select
                  value={form.beUrbanPlanningStatus}
                  onValueChange={(v) =>
                    setForm({ ...form, beUrbanPlanningStatus: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BE_DOSSIER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`dossierStatus.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="beDossierSubmittedAt">{t("dossierSubmittedAt")}</Label>
            <Input
              id="beDossierSubmittedAt"
              type="date"
              value={form.beDossierSubmittedAt}
              onChange={(e) =>
                setForm({ ...form, beDossierSubmittedAt: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-yellow-200 bg-white/60 p-4">
          <h4 className="font-medium">{t("registrationSection")}</h4>
          <div className="space-y-2">
            <Label htmlFor="beRegistrationNumber">{t("registrationNumber")}</Label>
            <div className="flex gap-2">
              <Input
                id="beRegistrationNumber"
                value={form.beRegistrationNumber}
                onChange={(e) =>
                  setForm({ ...form, beRegistrationNumber: e.target.value })
                }
                placeholder={t("registrationNumberPlaceholder")}
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyNumber}
                disabled={!form.beRegistrationNumber}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("registrationStatusLabel")}</Label>
            <Select
              value={form.beRegistrationStatus}
              onValueChange={(v) => setForm({ ...form, beRegistrationStatus: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BE_REGISTRATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`registrationStatus.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="beDisplayed"
              checked={form.beRegistrationDisplayedOnListings}
              onCheckedChange={(checked) =>
                setForm({
                  ...form,
                  beRegistrationDisplayedOnListings: checked === true,
                })
              }
            />
            <Label htmlFor="beDisplayed" className="text-xs font-normal">
              {t("displayedOnListings")}
            </Label>
          </div>

          <a
            href={regionalPortalUrl(form.beRegion)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-yellow-800 underline"
          >
            <ExternalLink className="h-3 w-3" />
            {t("regionalPortal")}
          </a>
        </div>

        <p className="text-xs text-yellow-700">{t("disclaimer")}</p>

        <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
          {saving ? t("saving") : t("save")}
        </Button>
      </CardContent>
    </Card>
  );
}
