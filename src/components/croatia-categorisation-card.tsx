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
import { getMintTourismUrl } from "@/lib/croatia/official-links";
import { toast } from "sonner";

export const HR_CATEGORISATION_STATUSES = [
  "not_started",
  "pending",
  "active",
  "expired",
] as const;

type CroatiaCategorisationData = {
  hrCategorisationNumber?: string | null;
  hrObjectId?: string | null;
  hrCategorisationStatus?: string | null;
  hrCategorisationDisplayedOnListings?: boolean;
};

type Props = {
  propertyId: string;
  registration: CroatiaCategorisationData | null;
};

export function CroatiaCategorisationCard({ propertyId, registration }: Props) {
  const t = useTranslations("evisitor.categorisation");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    hrCategorisationNumber: registration?.hrCategorisationNumber ?? "",
    hrObjectId: registration?.hrObjectId ?? "",
    hrCategorisationStatus: registration?.hrCategorisationStatus ?? "not_started",
    hrCategorisationDisplayedOnListings:
      registration?.hrCategorisationDisplayedOnListings ?? false,
  });

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
    if (form.hrCategorisationNumber) {
      navigator.clipboard.writeText(form.hrCategorisationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusVariant =
    form.hrCategorisationStatus === "active"
      ? "secondary"
      : form.hrCategorisationStatus === "expired"
        ? "destructive"
        : "outline";

  return (
    <Card className="border-red-200 bg-red-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-red-600" />
          {t("title")}
          <Badge variant={statusVariant} className="ml-1 text-xs">
            {t(`status.${form.hrCategorisationStatus}` as "status.not_started")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-red-900">
        <p className="text-xs text-red-800">{t("description")}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("categorisationNumber")}</Label>
            <div className="flex gap-2">
              <Input
                value={form.hrCategorisationNumber}
                onChange={(e) =>
                  setForm({ ...form, hrCategorisationNumber: e.target.value })
                }
                placeholder={t("categorisationNumberPlaceholder")}
                className="font-mono"
              />
              {form.hrCategorisationNumber && (
                <Button variant="outline" size="icon" onClick={copyNumber}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("objectId")}</Label>
            <Input
              value={form.hrObjectId}
              onChange={(e) => setForm({ ...form, hrObjectId: e.target.value })}
              placeholder={t("objectIdPlaceholder")}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("categorisationStatus")}</Label>
            <Select
              value={form.hrCategorisationStatus}
              onValueChange={(v) => setForm({ ...form, hrCategorisationStatus: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HR_CATEGORISATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`status.${s}` as "status.not_started")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox
              id="hr-displayed"
              checked={form.hrCategorisationDisplayedOnListings}
              onCheckedChange={(checked) =>
                setForm({
                  ...form,
                  hrCategorisationDisplayedOnListings: Boolean(checked),
                })
              }
            />
            <Label htmlFor="hr-displayed" className="text-xs font-normal">
              {t("displayedOnListings")}
            </Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={saving} size="sm">
            {t("save")}
          </Button>
          <a href={getMintTourismUrl()} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              {t("openMint")}
            </Button>
          </a>
        </div>

        <p className="text-xs text-red-700">{t("disclaimer")}</p>
      </CardContent>
    </Card>
  );
}
