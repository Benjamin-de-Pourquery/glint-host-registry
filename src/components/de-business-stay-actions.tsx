"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Save } from "lucide-react";
import { parseInvoicePackJson, type DeInvoicePack } from "@/lib/germany/business-stay";
import { toast } from "sonner";

type Props = {
  propertyId: string;
  stayId: string;
  locale: string;
  initialInvoicePackJson: string | null;
};

export function DeBusinessStayActions({
  propertyId,
  stayId,
  locale,
  initialInvoicePackJson,
}: Props) {
  const t = useTranslations("de.businessStay");
  const [saving, setSaving] = useState(false);
  const [pack, setPack] = useState<DeInvoicePack>(
    parseInvoicePackJson(initialInvoicePackJson)
  );

  const savePack = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/guest-stays/${stayId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoicePackJson: JSON.stringify(pack) }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const netEuros = (cents: number) => (cents / 100).toFixed(2);

  const setNetFromEuros = (field: "accommodationNetCents" | "extrasNetCents", euros: string) => {
    const parsed = Math.round(parseFloat(euros || "0") * 100);
    setPack((p) => ({ ...p, [field]: Number.isFinite(parsed) ? parsed : 0 }));
  };

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs">
      <p className="font-medium text-slate-900">{t("invoicePackTitle")}</p>
      <p className="text-slate-600">{t("invoicePackHint")}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <Label>{t("accommodationNet")}</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={netEuros(pack.accommodationNetCents)}
            onChange={(e) => setNetFromEuros("accommodationNetCents", e.target.value)}
          />
        </div>
        <div>
          <Label>{t("accommodationVat")}</Label>
          <Input
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={pack.accommodationVatRatePercent}
            onChange={(e) =>
              setPack((p) => ({
                ...p,
                accommodationVatRatePercent: parseFloat(e.target.value) || 0,
              }))
            }
          />
        </div>
        <div>
          <Label>{t("extrasNet")}</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={netEuros(pack.extrasNetCents)}
            onChange={(e) => setNetFromEuros("extrasNetCents", e.target.value)}
          />
        </div>
        <div>
          <Label>{t("extrasVat")}</Label>
          <Input
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={pack.extrasVatRatePercent}
            onChange={(e) =>
              setPack((p) => ({
                ...p,
                extrasVatRatePercent: parseFloat(e.target.value) || 0,
              }))
            }
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <Checkbox
            checked={pack.smallBusiness}
            onCheckedChange={(c) =>
              setPack((p) => ({ ...p, smallBusiness: c === true }))
            }
          />
          {t("smallBusiness")}
        </label>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={pack.cityTaxEnabled}
            onCheckedChange={(c) =>
              setPack((p) => ({ ...p, cityTaxEnabled: c === true }))
            }
          />
          {t("berlinCityTax")}
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={savePack} disabled={saving}>
          <Save className="h-3.5 w-3.5" />
          {saving ? t("saving") : t("savePack")}
        </Button>
        <a
          href={`/api/properties/${propertyId}/guest-stays/${stayId}/de-invoice-pack/export`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button type="button" size="sm" variant="ghost">
            <Download className="h-3.5 w-3.5" />
            {t("exportCsv")}
          </Button>
        </a>
        <a
          href={`/api/properties/${propertyId}/guest-stays/${stayId}/de-stay-confirmation/export?locale=${locale}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button type="button" size="sm" variant="ghost">
            <Download className="h-3.5 w-3.5" />
            {t("exportConfirmation")}
          </Button>
        </a>
      </div>
    </div>
  );
}
