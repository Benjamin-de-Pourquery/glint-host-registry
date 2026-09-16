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
import { BDSR_PORTAL_URL } from "@/lib/italy/official-links";
import { toast } from "sonner";

export const CIN_BDSR_STATUSES = [
  "not_started",
  "pending",
  "active",
  "rejected",
] as const;

type CinData = {
  cinNumber?: string | null;
  cinBdsrStatus?: string | null;
  cinDisplayedOnListings?: boolean;
};

type Props = {
  propertyId: string;
  registration: CinData | null;
};

export function CinComplianceCard({ propertyId, registration }: Props) {
  const t = useTranslations("alloggiati.cin");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    cinNumber: registration?.cinNumber ?? "",
    cinBdsrStatus: registration?.cinBdsrStatus ?? "not_started",
    cinDisplayedOnListings: registration?.cinDisplayedOnListings ?? false,
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

  const copyCin = () => {
    if (form.cinNumber) {
      navigator.clipboard.writeText(form.cinNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusVariant =
    form.cinBdsrStatus === "active"
      ? "secondary"
      : form.cinBdsrStatus === "rejected"
        ? "destructive"
        : "outline";

  return (
    <Card className="border-emerald-200 bg-emerald-50/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-emerald-600" />
          {t("title")}
          <Badge variant={statusVariant} className="ml-1 text-xs">
            {t(`status.${form.cinBdsrStatus}` as "status.active")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-slate-600">{t("description")}</p>

        <div className="space-y-2">
          <Label htmlFor="cinNumber">{t("cinNumber")}</Label>
          <div className="flex gap-2">
            <Input
              id="cinNumber"
              value={form.cinNumber}
              onChange={(e) => setForm((f) => ({ ...f, cinNumber: e.target.value }))}
              placeholder={t("cinNumberPlaceholder")}
              className="font-mono"
            />
            {form.cinNumber && (
              <Button type="button" variant="outline" size="icon" onClick={copyCin}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("bdsrStatus")}</Label>
          <Select
            value={form.cinBdsrStatus}
            onValueChange={(value) => setForm((f) => ({ ...f, cinBdsrStatus: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CIN_BDSR_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`status.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="cinDisplayedOnListings"
            checked={form.cinDisplayedOnListings}
            onCheckedChange={(checked) =>
              setForm((f) => ({ ...f, cinDisplayedOnListings: checked === true }))
            }
          />
          <Label htmlFor="cinDisplayedOnListings" className="text-sm font-normal">
            {t("displayedOnListings")}
          </Label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={save} disabled={saving}>
            {t("save")}
          </Button>
          <a href={BDSR_PORTAL_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              {t("openBdsr")}
            </Button>
          </a>
        </div>

        <p className="text-xs text-slate-500">{t("disclaimer")}</p>
      </CardContent>
    </Card>
  );
}
