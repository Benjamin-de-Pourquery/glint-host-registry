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
  AMSTERDAM_15_NIGHT_WIJKEN,
  AMSTERDAM_WIJK_LABELS,
  isAmsterdamCity,
} from "@/lib/netherlands/regions";
import { getNationalRegistrationPortalUrl } from "@/lib/netherlands/official-links";
import { toast } from "sonner";

export const NL_REGISTRATION_STATUSES = [
  "not_started",
  "pending",
  "active",
  "expired",
] as const;

export const NL_PERMIT_STATUSES = [
  "not_started",
  "pending",
  "active",
  "expired",
  "not_required",
] as const;

type NlComplianceData = {
  nlRegistrationNumber?: string | null;
  nlRegistrationStatus?: string | null;
  nlRegistrationDisplayedOnListings?: boolean;
  nlHolidayPermitStatus?: string | null;
  nlHolidayPermitExpiry?: string | Date | null;
  nlPermitNumber?: string | null;
  nlNeighborhood?: string | null;
  nlNightCapSource?: string | null;
};

type Props = {
  propertyId: string;
  city: string;
  registration: NlComplianceData | null;
};

export function NlComplianceCard({ propertyId, city, registration }: Props) {
  const t = useTranslations("nl.compliance");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (d: string | Date | null | undefined) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  const [form, setForm] = useState({
    nlRegistrationNumber: registration?.nlRegistrationNumber ?? "",
    nlRegistrationStatus: registration?.nlRegistrationStatus ?? "not_started",
    nlRegistrationDisplayedOnListings:
      registration?.nlRegistrationDisplayedOnListings ?? false,
    nlHolidayPermitStatus: registration?.nlHolidayPermitStatus ?? "not_started",
    nlHolidayPermitExpiry: formatDate(registration?.nlHolidayPermitExpiry),
    nlPermitNumber: registration?.nlPermitNumber ?? "",
    nlNeighborhood: registration?.nlNeighborhood ?? "",
  });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          nlHolidayPermitExpiry: form.nlHolidayPermitExpiry || null,
          nlNeighborhood: form.nlNeighborhood || null,
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
    if (form.nlRegistrationNumber) {
      navigator.clipboard.writeText(form.nlRegistrationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const regStatusVariant =
    form.nlRegistrationStatus === "active"
      ? "secondary"
      : form.nlRegistrationStatus === "expired"
        ? "destructive"
        : "outline";

  const permitStatusVariant =
    form.nlHolidayPermitStatus === "active"
      ? "secondary"
      : form.nlHolidayPermitStatus === "expired"
        ? "destructive"
        : "outline";

  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-orange-600" />
          {t("title")}
          <Badge variant={regStatusVariant} className="text-xs">
            {t(`registrationStatus.${form.nlRegistrationStatus}` as "registrationStatus.not_started")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm text-orange-900">
        <p className="text-xs text-orange-800">{t("description")}</p>

        <div className="space-y-3 rounded-lg border border-orange-200 bg-white/60 p-4">
          <h4 className="font-medium">{t("registrationSection")}</h4>
          <div className="space-y-2">
            <Label htmlFor="nlRegistrationNumber">{t("registrationNumber")}</Label>
            <div className="flex gap-2">
              <Input
                id="nlRegistrationNumber"
                value={form.nlRegistrationNumber}
                onChange={(e) =>
                  setForm({ ...form, nlRegistrationNumber: e.target.value })
                }
                placeholder={t("registrationNumberPlaceholder")}
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyNumber}
                disabled={!form.nlRegistrationNumber}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("registrationStatusLabel")}</Label>
            <Select
              value={form.nlRegistrationStatus}
              onValueChange={(v) => setForm({ ...form, nlRegistrationStatus: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NL_REGISTRATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`registrationStatus.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="nlDisplayed"
              checked={form.nlRegistrationDisplayedOnListings}
              onCheckedChange={(checked) =>
                setForm({
                  ...form,
                  nlRegistrationDisplayedOnListings: checked === true,
                })
              }
            />
            <Label htmlFor="nlDisplayed" className="text-xs font-normal">
              {t("displayedOnListings")}
            </Label>
          </div>

          <a
            href={getNationalRegistrationPortalUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-orange-700 underline"
          >
            <ExternalLink className="h-3 w-3" />
            {t("nationalPortal")}
          </a>
        </div>

        <div className="space-y-3 rounded-lg border border-orange-200 bg-white/60 p-4">
          <h4 className="flex flex-wrap items-center gap-2 font-medium">
            {t("permitSection")}
            <Badge variant={permitStatusVariant} className="text-xs">
              {t(`permitStatus.${form.nlHolidayPermitStatus}` as "permitStatus.not_started")}
            </Badge>
          </h4>

          <div className="space-y-2">
            <Label htmlFor="nlPermitNumber">{t("permitNumber")}</Label>
            <Input
              id="nlPermitNumber"
              value={form.nlPermitNumber}
              onChange={(e) => setForm({ ...form, nlPermitNumber: e.target.value })}
              placeholder={t("permitNumberPlaceholder")}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("permitStatusLabel")}</Label>
            <Select
              value={form.nlHolidayPermitStatus}
              onValueChange={(v) => setForm({ ...form, nlHolidayPermitStatus: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NL_PERMIT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`permitStatus.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nlHolidayPermitExpiry">{t("permitExpiry")}</Label>
            <Input
              id="nlHolidayPermitExpiry"
              type="date"
              value={form.nlHolidayPermitExpiry}
              onChange={(e) =>
                setForm({ ...form, nlHolidayPermitExpiry: e.target.value })
              }
            />
          </div>
        </div>

        {isAmsterdamCity(city) && (
          <div className="space-y-2">
            <Label>{t("wijkLabel")}</Label>
            <Select
              value={form.nlNeighborhood || "none"}
              onValueChange={(v) =>
                setForm({ ...form, nlNeighborhood: v === "none" ? "" : v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("wijkPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("wijkOutside15")}</SelectItem>
                {AMSTERDAM_15_NIGHT_WIJKEN.map((key) => (
                  <SelectItem key={key} value={key}>
                    {AMSTERDAM_WIJK_LABELS[key].en} (15 nights)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-orange-700">{t("wijkHint")}</p>
          </div>
        )}

        <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
          {saving ? t("saving") : t("save")}
        </Button>
      </CardContent>
    </Card>
  );
}
