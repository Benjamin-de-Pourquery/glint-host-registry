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
import type { GermanyRegistration } from "@/lib/germany/registration-compliance";
import {
  BERLIN_BEZIRKE,
  MUNICH_RENTAL_UNIT_TYPES,
  getGermanyFederalState,
  isMunichCity,
} from "@/lib/germany/regions";
import {
  getBerlinServiceZwvbUrl,
  getBerlinZwvbFormsUrl,
  getBerlinZwvbOverviewUrl,
  getMunichStrRegistrationInfoblattUrl,
  getMunichZesUrl,
  getMunichZweckentfremdungServiceUrl,
} from "@/lib/germany/official-links";
import { toast } from "sonner";

export const DE_REGISTRATION_STATUSES = [
  "not_started",
  "dossier_in_progress",
  "awaiting_registration_portal",
  "pending",
  "active",
  "expired",
  "unknown",
] as const;

export const DE_FEDERAL_STATES = ["berlin", "bayern", "other"] as const;

export const DE_OPERATOR_CATEGORIES = [
  "hauptwohnung",
  "nebenwohnung",
  "partial_main",
  "private_room",
  "whole_unit",
  "commercial",
  "other",
] as const;

export const DE_PERMIT_TYPES = [
  "genehmigung",
  "anzeige_49pct",
  "negativattest",
  "pending_eu_number",
  "zes_genehmigung_8w",
  "zes_5a_registration",
  "other",
] as const;

type Props = {
  propertyId: string;
  city: string;
  registration: GermanyRegistration | null;
};

export function DeComplianceCard({ propertyId, city, registration }: Props) {
  const t = useTranslations("de.compliance");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (d: string | Date | null | undefined) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  const [form, setForm] = useState({
    deRegistrationNumber: registration?.deRegistrationNumber ?? "",
    deRegistrationStatus: registration?.deRegistrationStatus ?? "not_started",
    deRegistrationDisplayedOnListings:
      registration?.deRegistrationDisplayedOnListings ?? false,
    deFederalState: registration?.deFederalState ?? "",
    deCityOrDistrict: registration?.deCityOrDistrict ?? "",
    deOperatorCategory: registration?.deOperatorCategory ?? "",
    dePermitType: registration?.dePermitType ?? "",
    deDossierPreparedAt: formatDate(registration?.deDossierPreparedAt),
    deTransitionDeadline: formatDate(registration?.deTransitionDeadline),
  });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deFederalState: form.deFederalState || null,
          deCityOrDistrict: form.deCityOrDistrict || null,
          deOperatorCategory: form.deOperatorCategory || null,
          dePermitType: form.dePermitType || null,
          deDossierPreparedAt: form.deDossierPreparedAt || null,
          deTransitionDeadline: form.deTransitionDeadline || null,
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
    if (form.deRegistrationNumber) {
      navigator.clipboard.writeText(form.deRegistrationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const regStatusVariant =
    form.deRegistrationStatus === "active"
      ? "secondary"
      : form.deRegistrationStatus === "expired"
        ? "destructive"
        : "outline";

  const inferredState = getGermanyFederalState(city);
  const effectiveState = form.deFederalState || inferredState;
  const isBerlinFocus = effectiveState === "berlin";
  const isMunichFocus = effectiveState === "bayern" && isMunichCity(city);

  const showBezirk = isBerlinFocus;
  const showMunichUnit = isMunichFocus;

  const cardTitleKey = isMunichFocus
    ? "titleMunich"
    : isBerlinFocus
      ? "titleBerlin"
      : "title";
  const cardDescriptionKey = isMunichFocus
    ? "descriptionMunich"
    : isBerlinFocus
      ? "descriptionBerlin"
      : "description";
  const locationHintKey = isMunichFocus
    ? "locationHintMunich"
    : isBerlinFocus
      ? "locationHintBerlin"
      : "locationHint";

  return (
    <Card className="border-gray-300 bg-gray-50/40">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-gray-800" />
          {t(cardTitleKey)}
          <Badge variant={regStatusVariant} className="text-xs">
            {t(
              `registrationStatus.${form.deRegistrationStatus}` as "registrationStatus.not_started"
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm text-gray-900">
        <p className="text-xs text-gray-800">{t(cardDescriptionKey)}</p>

        <div className="space-y-3 rounded-lg border border-gray-200 bg-white/60 p-4">
          <h4 className="font-medium">{t("locationSection")}</h4>
          <div className="space-y-2">
            <Label>{t("federalStateLabel")}</Label>
            <Select
              value={form.deFederalState || "unknown"}
              onValueChange={(v) =>
                setForm({ ...form, deFederalState: v === "unknown" ? "" : v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("federalStatePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">{t("federalStateUnknown")}</SelectItem>
                {DE_FEDERAL_STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`federalStates.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-700">{t(locationHintKey, { city })}</p>
          </div>

          {showMunichUnit && (
            <div className="space-y-2">
              <Label>{t("munichUnitLabel")}</Label>
              <Select
                value={form.deCityOrDistrict || "unknown"}
                onValueChange={(v) =>
                  setForm({ ...form, deCityOrDistrict: v === "unknown" ? "" : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("munichUnitPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unknown">{t("munichUnitUnknown")}</SelectItem>
                  {MUNICH_RENTAL_UNIT_TYPES.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {t(`munichUnitTypes.${u.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-700">{t("munichUnitHint")}</p>
            </div>
          )}

          {showBezirk && (
            <div className="space-y-2">
              <Label>{t("bezirkLabel")}</Label>
              <Select
                value={form.deCityOrDistrict || "unknown"}
                onValueChange={(v) =>
                  setForm({ ...form, deCityOrDistrict: v === "unknown" ? "" : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("bezirkPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unknown">{t("bezirkUnknown")}</SelectItem>
                  {BERLIN_BEZIRKE.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-lg border border-gray-200 bg-white/60 p-4">
          <h4 className="font-medium">{t("operatorSection")}</h4>
          <div className="space-y-2">
            <Label>{t("operatorCategory")}</Label>
            <Select
              value={form.deOperatorCategory || "none"}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  deOperatorCategory: v === "none" ? "" : v,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("operatorCategoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("operatorCategoryUnset")}</SelectItem>
                {DE_OPERATOR_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`operatorCategories.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("permitType")}</Label>
            <Select
              value={form.dePermitType || "none"}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  dePermitType: v === "none" ? "" : v,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("permitTypePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("permitTypeUnset")}</SelectItem>
                {DE_PERMIT_TYPES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {t(`permitTypes.${p}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-700">{t("permitTypeHint")}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-gray-200 bg-white/60 p-4">
          <h4 className="font-medium">{t("dossierSection")}</h4>
          <div className="space-y-2">
            <Label htmlFor="deDossierPreparedAt">{t("dossierPreparedAt")}</Label>
            <Input
              id="deDossierPreparedAt"
              type="date"
              value={form.deDossierPreparedAt}
              onChange={(e) =>
                setForm({ ...form, deDossierPreparedAt: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deTransitionDeadline">{t("transitionDeadline")}</Label>
            <Input
              id="deTransitionDeadline"
              type="date"
              value={form.deTransitionDeadline}
              onChange={(e) =>
                setForm({ ...form, deTransitionDeadline: e.target.value })
              }
            />
            <p className="text-xs text-gray-700">{t("transitionHint")}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-gray-200 bg-white/60 p-4">
          <h4 className="font-medium">{t("registrationSection")}</h4>
          <div className="space-y-2">
            <Label htmlFor="deRegistrationNumber">{t("registrationNumber")}</Label>
            <div className="flex gap-2">
              <Input
                id="deRegistrationNumber"
                value={form.deRegistrationNumber}
                onChange={(e) =>
                  setForm({ ...form, deRegistrationNumber: e.target.value })
                }
                placeholder={
                  isMunichFocus
                    ? t("registrationNumberPlaceholderMunich")
                    : t("registrationNumberPlaceholder")
                }
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyNumber}
                disabled={!form.deRegistrationNumber}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("registrationStatusLabel")}</Label>
            <Select
              value={form.deRegistrationStatus}
              onValueChange={(v) => setForm({ ...form, deRegistrationStatus: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DE_REGISTRATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`registrationStatus.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="deDisplayedOnListings"
              checked={form.deRegistrationDisplayedOnListings}
              onCheckedChange={(checked) =>
                setForm({
                  ...form,
                  deRegistrationDisplayedOnListings: checked === true,
                })
              }
            />
            <Label htmlFor="deDisplayedOnListings" className="font-normal">
              {t("displayedOnListings")}
            </Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isBerlinFocus && (
            <>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={getBerlinZwvbOverviewUrl()} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {t("zwvbOverviewLink")}
                </a>
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={getBerlinZwvbFormsUrl()} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {t("zwvbFormsLink")}
                </a>
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={getBerlinServiceZwvbUrl()} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {t("serviceBerlinLink")}
                </a>
              </Button>
            </>
          )}
          {isMunichFocus && (
            <>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={getMunichZesUrl()} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  {t("zesLink")}
                </a>
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <a
                  href={getMunichZweckentfremdungServiceUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("munichServiceLink")}
                </a>
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <a
                  href={getMunichStrRegistrationInfoblattUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t("munichInfoblattLink")}
                </a>
              </Button>
            </>
          )}
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? t("saving") : t("save")}
          </Button>
        </div>

        <p className="text-xs text-gray-800">
          {isMunichFocus ? t("disclaimerMunich") : t("disclaimer")}
        </p>
      </CardContent>
    </Card>
  );
}
