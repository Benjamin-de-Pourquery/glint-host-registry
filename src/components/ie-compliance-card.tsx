"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ExternalLink, Copy, Check, Shield, AlertCircle } from "lucide-react";
import type { IrelandRegistration } from "@/lib/ireland/registration-compliance";
import { computeIrelandReadiness } from "@/lib/ireland/readiness";
import { daysUntilRegistrationDeadline } from "@/lib/ireland/planning-forms";
import {
  getFailteStlRegisterUrl,
  getCitizensInfoStlUrl,
  DETE_STL_EXPLAINER_URL,
  GOV_IE_STL_REGISTER_PRESS_URL,
} from "@/lib/ireland/official-links";
import { isValidEircode, normalizeEircode } from "@/lib/ireland/eircode";
import { toast } from "sonner";

export const IE_STL_STATUSES = [
  "not_started",
  "data_ready",
  "registered",
  "renewal_due",
  "expired",
] as const;

export const IE_PLANNING_STATUSES = [
  "permission",
  "exempt_home_sharing",
  "exempt_ppr_under_90",
  "not_required_15_plus_nights",
  "unknown",
] as const;

export const IE_RESIDENCE_TYPES = ["primary", "secondary", "other"] as const;

type ListingChannelRow = {
  displayStatus: string;
};

type Props = {
  propertyId: string;
  city: string;
  registration: IrelandRegistration | null;
  listingChannels?: ListingChannelRow[];
};

export function IeComplianceCard({
  propertyId,
  city,
  registration,
  listingChannels = [],
}: Props) {
  const t = useTranslations("ie.compliance");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [eircodeError, setEircodeError] = useState(false);

  const formatDate = (d: string | Date | null | undefined) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  const [form, setForm] = useState({
    ieStlNumber: registration?.ieStlNumber ?? "",
    ieStlStatus: registration?.ieStlStatus ?? "not_started",
    ieRegisteredAt: formatDate(registration?.ieRegisteredAt),
    ieRenewalDueAt: formatDate(registration?.ieRenewalDueAt),
    iePlanningStatus: registration?.iePlanningStatus ?? "",
    ieEircode: registration?.ieEircode ?? "",
    ieMaxGuests: registration?.ieMaxGuests?.toString() ?? "",
    ieBedPlaces: registration?.ieBedPlaces?.toString() ?? "",
    ieResidenceType: registration?.ieResidenceType ?? "",
  });

  const readiness = useMemo(
    () =>
      computeIrelandReadiness(
        {
          ...registration,
          ieStlNumber: form.ieStlNumber,
          iePlanningStatus: form.iePlanningStatus || null,
          ieEircode: form.ieEircode,
          ieMaxGuests: form.ieMaxGuests ? parseInt(form.ieMaxGuests, 10) : null,
          ieBedPlaces: form.ieBedPlaces ? parseInt(form.ieBedPlaces, 10) : null,
          ieResidenceType: form.ieResidenceType || null,
        },
        listingChannels
      ),
    [form, registration, listingChannels]
  );

  const daysToDeadline = daysUntilRegistrationDeadline();

  const save = async () => {
    const eircode = form.ieEircode.trim();
    if (eircode && !isValidEircode(eircode)) {
      setEircodeError(true);
      toast.error(t("eircodeInvalid"));
      return;
    }
    setEircodeError(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ieStlNumber: form.ieStlNumber.trim() || null,
          ieStlStatus: form.ieStlStatus,
          ieRegisteredAt: form.ieRegisteredAt || null,
          ieRenewalDueAt: form.ieRenewalDueAt || null,
          iePlanningStatus: form.iePlanningStatus || null,
          ieEircode: eircode ? normalizeEircode(eircode) : null,
          ieMaxGuests: form.ieMaxGuests ? parseInt(form.ieMaxGuests, 10) : null,
          ieBedPlaces: form.ieBedPlaces ? parseInt(form.ieBedPlaces, 10) : null,
          ieResidenceType: form.ieResidenceType || null,
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
    if (form.ieStlNumber) {
      navigator.clipboard.writeText(form.ieStlNumber.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusVariant =
    form.ieStlStatus === "registered"
      ? "secondary"
      : form.ieStlStatus === "expired" || form.ieStlStatus === "renewal_due"
        ? "destructive"
        : "outline";

  return (
    <Card className="border-emerald-200 bg-emerald-50/30">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-emerald-700" />
          {t("title")}
          <Badge variant={statusVariant} className="text-xs">
            {t(`stlStatus.${form.ieStlStatus}` as "stlStatus.not_started")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm text-emerald-900">
        <p className="text-xs text-emerald-800">{t("description", { city })}</p>

        <div
          className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950"
          role="status"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div>
            <p className="font-medium">{t("portalStatusTitle")}</p>
            <p>{t("portalStatusBody")}</p>
          </div>
        </div>

        {!form.ieStlNumber.trim() && daysToDeadline >= 0 && (
          <p className="text-xs font-medium text-emerald-800">
            {t("registrationDeadlineCountdown", { days: daysToDeadline })}
          </p>
        )}

        <div className="space-y-2 rounded-lg border border-emerald-200 bg-white/60 p-4">
          <h4 className="font-medium">{t("readinessTitle")}</h4>
          <ul className="space-y-1.5 text-xs">
            {readiness.checks.map((check) => (
              <li key={check.key} className="flex items-center gap-2">
                <span
                  className={
                    check.complete ? "text-emerald-700" : "text-amber-800"
                  }
                >
                  {check.complete ? "✓" : "○"}
                </span>
                {t(`readinessItems.${check.key}` as "readinessItems.eircode")}
              </li>
            ))}
          </ul>
          <p className="text-xs text-emerald-700">
            {t("readinessProgress", {
              done: readiness.completeCount,
              total: readiness.total,
            })}
          </p>
        </div>

        <div className="space-y-3 rounded-lg border border-emerald-200 bg-white/60 p-4">
          <h4 className="font-medium">{t("planningSection")}</h4>
          <Label>{t("planningStatus")}</Label>
          <Select
            value={form.iePlanningStatus || "unknown"}
            onValueChange={(v) =>
              setForm({
                ...form,
                iePlanningStatus: v === "unknown" ? "" : v,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("planningStatusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unknown">{t("planningStatusUnknown")}</SelectItem>
              {IE_PLANNING_STATUSES.filter((s) => s !== "unknown").map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`planningStatuses.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-emerald-700">{t("planningHint")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ieEircode">{t("eircode")}</Label>
            <Input
              id="ieEircode"
              value={form.ieEircode}
              onChange={(e) => setForm({ ...form, ieEircode: e.target.value })}
              placeholder={t("eircodePlaceholder")}
              className={`font-mono uppercase ${eircodeError ? "border-red-500" : ""}`}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("residenceType")}</Label>
            <Select
              value={form.ieResidenceType || "none"}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  ieResidenceType: v === "none" ? "" : v,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("residenceTypePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("residenceTypeUnset")}</SelectItem>
                {IE_RESIDENCE_TYPES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`residenceTypes.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ieMaxGuests">{t("maxGuests")}</Label>
            <Input
              id="ieMaxGuests"
              type="number"
              min={1}
              value={form.ieMaxGuests}
              onChange={(e) => setForm({ ...form, ieMaxGuests: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ieBedPlaces">{t("bedPlaces")}</Label>
            <Input
              id="ieBedPlaces"
              type="number"
              min={1}
              value={form.ieBedPlaces}
              onChange={(e) => setForm({ ...form, ieBedPlaces: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-emerald-200 bg-white/60 p-4">
          <h4 className="font-medium">{t("registrationSection")}</h4>
          <div className="space-y-2">
            <Label htmlFor="ieStlNumber">{t("stlNumber")}</Label>
            <div className="flex gap-2">
              <Input
                id="ieStlNumber"
                value={form.ieStlNumber}
                onChange={(e) => setForm({ ...form, ieStlNumber: e.target.value })}
                placeholder={t("stlNumberPlaceholder")}
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyNumber}
                disabled={!form.ieStlNumber.trim()}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("stlStatusLabel")}</Label>
            <Select
              value={form.ieStlStatus}
              onValueChange={(v) => setForm({ ...form, ieStlStatus: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IE_STL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`stlStatus.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ieRegisteredAt">{t("registeredAt")}</Label>
              <Input
                id="ieRegisteredAt"
                type="date"
                value={form.ieRegisteredAt}
                onChange={(e) =>
                  setForm({ ...form, ieRegisteredAt: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ieRenewalDueAt">{t("renewalDueAt")}</Label>
              <Input
                id="ieRenewalDueAt"
                type="date"
                value={form.ieRenewalDueAt}
                onChange={(e) =>
                  setForm({ ...form, ieRenewalDueAt: e.target.value })
                }
              />
            </div>
          </div>
          <p className="text-xs text-emerald-700">{t("listingDisplayHint")}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a href={getFailteStlRegisterUrl()} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              {t("failtePortalLink")}
            </Button>
          </a>
          <a href={GOV_IE_STL_REGISTER_PRESS_URL} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              {t("govIeLink")}
            </Button>
          </a>
          <a href={DETE_STL_EXPLAINER_URL} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              {t("deteLink")}
            </Button>
          </a>
          <a href={getCitizensInfoStlUrl()} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              {t("citizensInfoLink")}
            </Button>
          </a>
        </div>

        <p className="text-xs text-emerald-700">{t("disclaimer")}</p>

        <Button onClick={save} disabled={saving}>
          {saving ? t("saving") : t("save")}
        </Button>
      </CardContent>
    </Card>
  );
}
