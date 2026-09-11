"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const EU_COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
  "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
  "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta",
  "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
  "Spain", "Sweden",
];

type FormData = {
  name: string;
  address: string;
  city: string;
  country: string;
  propertyType: string;
  residencyStatus?: string | null;
};

type Props = {
  propertyId: string;
  initial: FormData;
};

export function PropertyOverviewForm({ propertyId, initial }: Props) {
  const t = useTranslations("properties");
  const tForm = useTranslations("properties.form");
  const router = useRouter();

  const [form, setForm] = useState<FormData>(initial);
  const [loading, setLoading] = useState(false);

  const propertyTypes = ["apartment", "house", "studio", "room", "other"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/properties/${propertyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error(t("detail.saveError"));
      return;
    }
    router.refresh();
    toast.success(t("detail.saved"));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t border-slate-100 pt-6">
      <h3 className="text-sm font-semibold text-slate-900">{t("detail.editBasics")}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">{tForm("name")}</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">{tForm("address")}</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">{tForm("city")}</Label>
          <Input
            id="city"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{tForm("country")}</Label>
          <Select
            value={form.country}
            onValueChange={(v) => setForm({ ...form, country: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EU_COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{tForm("type")}</Label>
          <Select
            value={form.propertyType}
            onValueChange={(v) => setForm({ ...form, propertyType: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {tForm(`types.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{tForm("residencyStatus")}</Label>
          <Select
            value={form.residencyStatus || ""}
            onValueChange={(v) =>
              setForm({ ...form, residencyStatus: v || null })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={tForm("residencyPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">{tForm("residency.primary")}</SelectItem>
              <SelectItem value="secondary">{tForm("residency.secondary")}</SelectItem>
              <SelectItem value="other">{tForm("residency.other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {tForm("save")}
      </Button>
    </form>
  );
}
