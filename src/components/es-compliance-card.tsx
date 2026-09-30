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
import type { SpainRegistration } from "@/lib/spain/registration-compliance";
import {
  isLikelyEsRegistrationNumberForCommunity,
  resolveSpainAutonomousCommunityForProperty,
  supportsSpainStrRegistrationCompliance,
  type SpainAutonomousCommunity,
} from "@/lib/spain/regions";
import {
  BARCELONA_TOURISM_HOUSING_URL,
  CATALONIA_TOURISM_REGISTER_OPEN_DATA_URL,
  EU_1028_URL,
  MADRID_AYUNTAMIENTO_TURISMO_URL,
  MADRID_VUT_REGISTER_URL,
  RD_933_URL,
} from "@/lib/spain/official-links";
import { toast } from "sonner";

export const ES_REGISTRATION_STATUSES = [
  "not_started",
  "dossier_in_progress",
  "pending",
  "active",
  "expired",
  "unknown",
] as const;

/** Regional license kinds stored in `esLicenseKind`: hut (Catalonia), vut (Comunidad de Madrid), other. */
export const ES_LICENSE_KINDS = ["hut", "vut", "other"] as const;

type Props = {
  propertyId: string;
  country: string;
  city: string;
  registration: SpainRegistration | null;
};

function defaultLicenseKind(community: SpainAutonomousCommunity): string {
  if (community === "madrid") return "vut";
  if (community === "catalonia") return "hut";
  return "other";
}

export function EsComplianceCard({ propertyId, country, city, registration }: Props) {
  const t = useTranslations("es.compliance");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const inferredCommunity = resolveSpainAutonomousCommunityForProperty(
    city,
    registration?.esAutonomousCommunity
  );

  const showCard = supportsSpainStrRegistrationCompliance(
    country,
    city,
    registration?.esAutonomousCommunity
  );

  const formatDate = (d: string | Date | null | undefined) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  const initialCommunity =
    registration?.esAutonomousCommunity ??
    (inferredCommunity === "catalonia" || inferredCommunity === "madrid"
      ? inferredCommunity
      : "catalonia");

  const [form, setForm] = useState({
    esRegistrationNumber: registration?.esRegistrationNumber ?? "",
    esRegistrationStatus: registration?.esRegistrationStatus ?? "not_started",
    esRegistrationDisplayedOnListings:
      registration?.esRegistrationDisplayedOnListings ?? false,
    esAutonomousCommunity: initialCommunity,
    esLicenseKind:
      registration?.esLicenseKind ??
      defaultLicenseKind(initialCommunity as SpainAutonomousCommunity),
    esDossierPreparedAt: formatDate(registration?.esDossierPreparedAt),
  });

  const activeCommunity = (form.esAutonomousCommunity ||
    inferredCommunity) as SpainAutonomousCommunity;

  const numberFormatOk =
    !form.esRegistrationNumber.trim() ||
    isLikelyEsRegistrationNumberForCommunity(
      activeCommunity === "madrid" || activeCommunity === "catalonia"
        ? activeCommunity
        : "catalonia",
      form.esRegistrationNumber
    );

  const titleKey =
    activeCommunity === "madrid" ? "titleMadrid" : "titleCatalonia";

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          esAutonomousCommunity: form.esAutonomousCommunity || initialCommunity,
          esLicenseKind: form.esLicenseKind || null,
          esDossierPreparedAt: form.esDossierPreparedAt || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
      toast.success(
        activeCommunity === "madrid" ? t("savedMadrid") : t("savedCatalonia")
      );
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const copyNumber = () => {
    if (form.esRegistrationNumber) {
      navigator.clipboard.writeText(form.esRegistrationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const regStatusVariant =
    form.esRegistrationStatus === "active"
      ? "default"
      : form.esRegistrationStatus === "expired"
        ? "destructive"
        : "secondary";

  if (!showCard) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-emerald-600" />
              {t(titleKey)}
            </CardTitle>
            <p className="mt-1 text-sm text-slate-600">
              {activeCommunity === "madrid" ? t("descriptionMadrid") : t("description")}
            </p>
          </div>
          <Badge variant={regStatusVariant}>{t(`status.${form.esRegistrationStatus}`)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {activeCommunity === "madrid" ? t("nruaNoticeMadrid") : t("nruaNotice")}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("autonomousCommunity")}</Label>
            <Select
              value={form.esAutonomousCommunity || initialCommunity}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  esAutonomousCommunity: v,
                  esLicenseKind: defaultLicenseKind(v as SpainAutonomousCommunity),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="catalonia">{t("community.catalonia")}</SelectItem>
                <SelectItem value="madrid">{t("community.madrid")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("licenseKind")}</Label>
            <Select
              value={form.esLicenseKind || defaultLicenseKind(activeCommunity)}
              onValueChange={(v) => setForm({ ...form, esLicenseKind: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ES_LICENSE_KINDS.map((k) => (
                  <SelectItem key={k} value={k}>{t(`licenseKind.${k}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="esDossierPreparedAt">{t("dossierPreparedAt")}</Label>
          <Input
            id="esDossierPreparedAt"
            type="date"
            value={form.esDossierPreparedAt}
            onChange={(e) => setForm({ ...form, esDossierPreparedAt: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="esRegistrationNumber">
            {activeCommunity === "madrid"
              ? t("registrationNumberVut")
              : t("registrationNumber")}
          </Label>
          <div className="flex gap-2">
            <Input
              id="esRegistrationNumber"
              value={form.esRegistrationNumber}
              onChange={(e) => setForm({ ...form, esRegistrationNumber: e.target.value })}
              placeholder={
                activeCommunity === "madrid"
                  ? t("registrationNumberVutPlaceholder")
                  : t("registrationNumberPlaceholder")
              }
            />
            <Button type="button" variant="outline" size="icon" onClick={copyNumber}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {!numberFormatOk && (
            <p className="text-xs text-red-600">
              {activeCommunity === "madrid" ? t("vutFormatHint") : t("hutFormatHint")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t("registrationStatus")}</Label>
          <Select
            value={form.esRegistrationStatus}
            onValueChange={(v) => setForm({ ...form, esRegistrationStatus: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ES_REGISTRATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="esDisplayed"
            checked={form.esRegistrationDisplayedOnListings}
            onCheckedChange={(c) =>
              setForm({ ...form, esRegistrationDisplayedOnListings: c === true })
            }
          />
          <Label htmlFor="esDisplayed" className="font-normal">
            {activeCommunity === "madrid"
              ? t("displayedOnListingsVut")
              : t("displayedOnListings")}
          </Label>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          {activeCommunity === "madrid" ? (
            <>
              <a
                href={MADRID_VUT_REGISTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
              >
                {t("links.madridRegister")}
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={MADRID_AYUNTAMIENTO_TURISMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
              >
                {t("links.madridCity")}
                <ExternalLink className="h-3 w-3" />
              </a>
            </>
          ) : (
            <>
              <a
                href={CATALONIA_TOURISM_REGISTER_OPEN_DATA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
              >
                {t("links.cataloniaRegister")}
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={BARCELONA_TOURISM_HOUSING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
              >
                {t("links.barcelonaRules")}
                <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )}
          <a
            href={EU_1028_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
          >
            {t("links.eu1028")}
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={RD_933_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
          >
            {t("links.rd933")}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <p className="text-xs text-slate-500">
          {activeCommunity === "madrid" ? t("disclaimerMadrid") : t("disclaimer")}
        </p>

        <Button onClick={save} disabled={saving}>
          {saving ? t("saving") : t("save")}
        </Button>
      </CardContent>
    </Card>
  );
}
