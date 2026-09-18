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
import { TURISMO_PORTUGAL_URL } from "@/lib/portugal/official-links";
import { toast } from "sonner";

export const RNAL_STATUSES = [
  "not_started",
  "pending",
  "active",
  "expired",
] as const;

type RnalData = {
  rnalNumber?: string | null;
  rnalStatus?: string | null;
  rnalDisplayedOnListings?: boolean;
};

type Props = {
  propertyId: string;
  registration: RnalData | null;
};

export function RnalComplianceCard({ propertyId, registration }: Props) {
  const t = useTranslations("siba.rnal");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    rnalNumber: registration?.rnalNumber ?? "",
    rnalStatus: registration?.rnalStatus ?? "not_started",
    rnalDisplayedOnListings: registration?.rnalDisplayedOnListings ?? false,
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

  const copyRnal = () => {
    if (form.rnalNumber) {
      navigator.clipboard.writeText(form.rnalNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusVariant =
    form.rnalStatus === "active"
      ? "secondary"
      : form.rnalStatus === "expired"
        ? "destructive"
        : "outline";

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-blue-600" />
          {t("title")}
          <Badge variant={statusVariant} className="ml-1 text-xs">
            {t(`status.${form.rnalStatus}` as "status.not_started")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-blue-900">
        <p className="text-xs text-blue-800">{t("description")}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("rnalNumber")}</Label>
            <div className="flex gap-2">
              <Input
                value={form.rnalNumber}
                onChange={(e) => setForm({ ...form, rnalNumber: e.target.value })}
                placeholder={t("rnalNumberPlaceholder")}
                className="font-mono"
              />
              {form.rnalNumber && (
                <Button variant="outline" size="icon" onClick={copyRnal}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("rnalStatus")}</Label>
            <Select
              value={form.rnalStatus}
              onValueChange={(v) => setForm({ ...form, rnalStatus: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RNAL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`status.${s}` as "status.not_started")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox
              id="rnal-displayed"
              checked={form.rnalDisplayedOnListings}
              onCheckedChange={(checked) =>
                setForm({ ...form, rnalDisplayedOnListings: Boolean(checked) })
              }
            />
            <Label htmlFor="rnal-displayed" className="text-xs font-normal">
              {t("displayedOnListings")}
            </Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={saving} size="sm">
            {t("save")}
          </Button>
          <a href={TURISMO_PORTUGAL_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              {t("openTurismo")}
            </Button>
          </a>
        </div>

        <p className="text-xs text-blue-700">{t("disclaimer")}</p>
      </CardContent>
    </Card>
  );
}
