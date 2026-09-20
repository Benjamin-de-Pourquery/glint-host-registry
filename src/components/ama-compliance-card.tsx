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
import { AADE_SHORT_TERM_HUB_URL, MYAADE_URL } from "@/lib/greece/official-links";
import { getEffectiveGreeceRegistrationNumber } from "@/lib/greece/ama-compliance";
import { toast } from "sonner";

export const AMA_STATUSES = [
  "not_started",
  "in_progress",
  "obtained",
  "displayed",
  "not_required_esl",
] as const;

export const GREECE_REGISTRATION_KINDS = ["ama", "esl", "unique_notification"] as const;

type AmaData = {
  amaNumber?: string | null;
  amaStatus?: string | null;
  amaDisplayedOnListings?: boolean;
  greeceRegistrationKind?: string | null;
  greeceAlternateLicenseNumber?: string | null;
  atak?: string | null;
};

type Props = {
  propertyId: string;
  registration: AmaData | null;
};

export function AmaComplianceCard({ propertyId, registration }: Props) {
  const t = useTranslations("aade.ama");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    amaNumber: registration?.amaNumber ?? "",
    amaStatus: registration?.amaStatus ?? "not_started",
    amaDisplayedOnListings: registration?.amaDisplayedOnListings ?? false,
    greeceRegistrationKind: registration?.greeceRegistrationKind ?? "ama",
    greeceAlternateLicenseNumber: registration?.greeceAlternateLicenseNumber ?? "",
    atak: registration?.atak ?? "",
  });

  const effectiveNumber = getEffectiveGreeceRegistrationNumber(form);
  const usesAlternate =
    form.greeceRegistrationKind === "esl" ||
    form.greeceRegistrationKind === "unique_notification";

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
    if (effectiveNumber) {
      navigator.clipboard.writeText(effectiveNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusVariant =
    form.amaStatus === "obtained" || form.amaStatus === "displayed"
      ? "secondary"
      : form.amaStatus === "not_required_esl"
        ? "outline"
        : "outline";

  return (
    <Card className="border-emerald-200 bg-emerald-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-emerald-600" />
          {t("title")}
          <Badge variant={statusVariant} className="ml-1 text-xs">
            {t(`status.${form.amaStatus}` as "status.not_started")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-emerald-900">
        <p className="text-xs text-emerald-800">{t("description")}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("registrationKind")}</Label>
            <Select
              value={form.greeceRegistrationKind}
              onValueChange={(v) => setForm({ ...form, greeceRegistrationKind: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GREECE_REGISTRATION_KINDS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {t(`kind.${k}` as "kind.ama")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!usesAlternate ? (
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("amaNumber")}</Label>
              <div className="flex gap-2">
                <Input
                  value={form.amaNumber}
                  onChange={(e) => setForm({ ...form, amaNumber: e.target.value })}
                  placeholder={t("amaNumberPlaceholder")}
                  className="font-mono"
                />
                {form.amaNumber && (
                  <Button variant="outline" size="icon" onClick={copyNumber}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("alternateLicenseNumber")}</Label>
              <div className="flex gap-2">
                <Input
                  value={form.greeceAlternateLicenseNumber}
                  onChange={(e) =>
                    setForm({ ...form, greeceAlternateLicenseNumber: e.target.value })
                  }
                  placeholder={t("alternateLicensePlaceholder")}
                  className="font-mono"
                />
                {form.greeceAlternateLicenseNumber && (
                  <Button variant="outline" size="icon" onClick={copyNumber}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("amaStatus")}</Label>
            <Select
              value={form.amaStatus}
              onValueChange={(v) => setForm({ ...form, amaStatus: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AMA_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`status.${s}` as "status.not_started")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("atak")}</Label>
            <Input
              value={form.atak}
              onChange={(e) => setForm({ ...form, atak: e.target.value })}
              placeholder={t("atakPlaceholder")}
              className="font-mono"
            />
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox
              id="ama-displayed"
              checked={form.amaDisplayedOnListings}
              onCheckedChange={(checked) =>
                setForm({ ...form, amaDisplayedOnListings: Boolean(checked) })
              }
            />
            <Label htmlFor="ama-displayed" className="text-xs font-normal">
              {t("displayedOnListings")}
            </Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={saving} size="sm">
            {t("save")}
          </Button>
          <a href={MYAADE_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              {t("openMyAade")}
            </Button>
          </a>
          <a href={AADE_SHORT_TERM_HUB_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              {t("openAadeHub")}
            </Button>
          </a>
        </div>

        <p className="text-xs text-emerald-700">{t("disclaimer")}</p>
      </CardContent>
    </Card>
  );
}
