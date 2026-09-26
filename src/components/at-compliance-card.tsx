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
import type { AustriaRegistration } from "@/lib/austria/registration-compliance";
import { getViennaWkvgrAnnouncementUrl } from "@/lib/austria/official-links";
import { toast } from "sonner";

export const AT_REGISTRATION_STATUSES = [
  "not_started",
  "dossier_in_progress",
  "pending",
  "active",
  "expired",
  "unknown",
] as const;

export const AT_FEDERAL_STATES = ["vienna", "other"] as const;

export const AT_OPERATOR_CATEGORIES = ["natural", "legal"] as const;

type Props = {
  propertyId: string;
  city: string;
  registration: AustriaRegistration | null;
};

export function AtComplianceCard({ propertyId, city, registration }: Props) {
  const t = useTranslations("at.compliance");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (d: string | Date | null | undefined) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  const [form, setForm] = useState({
    atRegistrationNumber: registration?.atRegistrationNumber ?? "",
    atRegistrationStatus: registration?.atRegistrationStatus ?? "not_started",
    atRegistrationDisplayedOnListings:
      registration?.atRegistrationDisplayedOnListings ?? false,
    atFederalState: registration?.atFederalState ?? "",
    atOperatorCategory: registration?.atOperatorCategory ?? "",
    atDossierPreparedAt: formatDate(registration?.atDossierPreparedAt),
    atTransitionDeadline: formatDate(registration?.atTransitionDeadline),
  });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          atFederalState: form.atFederalState || null,
          atOperatorCategory: form.atOperatorCategory || null,
          atDossierPreparedAt: form.atDossierPreparedAt || null,
          atTransitionDeadline: form.atTransitionDeadline || null,
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
    if (form.atRegistrationNumber) {
      navigator.clipboard.writeText(form.atRegistrationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const regStatusVariant =
    form.atRegistrationStatus === "active"
      ? "secondary"
      : form.atRegistrationStatus === "expired"
        ? "destructive"
        : "outline";

  return (
    <Card className="border-red-200 bg-red-50/30">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-red-700" />
          {t("title")}
          <Badge variant={regStatusVariant} className="text-xs">
            {t(
              `registrationStatus.${form.atRegistrationStatus}` as "registrationStatus.not_started"
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm text-red-900">
        <p className="text-xs text-red-800">{t("description")}</p>

        <div className="space-y-3 rounded-lg border border-red-200 bg-white/60 p-4">
          <h4 className="font-medium">{t("locationSection")}</h4>
          <div className="space-y-2">
            <Label>{t("federalStateLabel")}</Label>
            <Select
              value={form.atFederalState || "unknown"}
              onValueChange={(v) =>
                setForm({ ...form, atFederalState: v === "unknown" ? "" : v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("federalStatePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">{t("federalStateUnknown")}</SelectItem>
                {AT_FEDERAL_STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`federalStates.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-red-700">{t("locationHint", { city })}</p>
          </div>

          <div className="space-y-2">
            <Label>{t("operatorCategory")}</Label>
            <Select
              value={form.atOperatorCategory || "none"}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  atOperatorCategory: v === "none" ? "" : v,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("operatorCategoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("operatorCategoryUnset")}</SelectItem>
                {AT_OPERATOR_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`operatorCategories.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-red-200 bg-white/60 p-4">
          <h4 className="font-medium">{t("dossierSection")}</h4>
          <div className="space-y-2">
            <Label htmlFor="atDossierPreparedAt">{t("dossierPreparedAt")}</Label>
            <Input
              id="atDossierPreparedAt"
              type="date"
              value={form.atDossierPreparedAt}
              onChange={(e) =>
                setForm({ ...form, atDossierPreparedAt: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="atTransitionDeadline">{t("transitionDeadline")}</Label>
            <Input
              id="atTransitionDeadline"
              type="date"
              value={form.atTransitionDeadline}
              onChange={(e) =>
                setForm({ ...form, atTransitionDeadline: e.target.value })
              }
            />
            <p className="text-xs text-red-700">{t("transitionHint")}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-red-200 bg-white/60 p-4">
          <h4 className="font-medium">{t("registrationSection")}</h4>
          <div className="space-y-2">
            <Label htmlFor="atRegistrationNumber">{t("registrationNumber")}</Label>
            <div className="flex gap-2">
              <Input
                id="atRegistrationNumber"
                value={form.atRegistrationNumber}
                onChange={(e) =>
                  setForm({ ...form, atRegistrationNumber: e.target.value })
                }
                placeholder={t("registrationNumberPlaceholder")}
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyNumber}
                disabled={!form.atRegistrationNumber}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("registrationStatusLabel")}</Label>
            <Select
              value={form.atRegistrationStatus}
              onValueChange={(v) => setForm({ ...form, atRegistrationStatus: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AT_REGISTRATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`registrationStatus.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="atDisplayedOnListings"
              checked={form.atRegistrationDisplayedOnListings}
              onCheckedChange={(checked) =>
                setForm({
                  ...form,
                  atRegistrationDisplayedOnListings: checked === true,
                })
              }
            />
            <Label htmlFor="atDisplayedOnListings" className="font-normal">
              {t("displayedOnListings")}
            </Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={getViennaWkvgrAnnouncementUrl()} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {t("officialAnnouncement")}
            </a>
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? t("saving") : t("save")}
          </Button>
        </div>

        <p className="text-xs text-red-800">{t("disclaimer")}</p>
      </CardContent>
    </Card>
  );
}
