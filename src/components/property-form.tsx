"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const EU_COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
  "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
  "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta",
  "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
  "Spain", "Sweden",
];

type PropertyData = {
  id?: string;
  name: string;
  address: string;
  city: string;
  country: string;
  propertyType: string;
  residencyStatus?: string | null;
  airbnbUrl?: string | null;
  bookingUrl?: string | null;
  vrboUrl?: string | null;
  notes?: string | null;
};

export function PropertyForm({
  initial,
  mode = "create",
}: {
  initial?: PropertyData;
  mode?: "create" | "edit";
}) {
  const t = useTranslations("properties.form");
  const locale = useLocale();
  const router = useRouter();

  const [form, setForm] = useState<PropertyData>({
    name: initial?.name || "",
    address: initial?.address || "",
    city: initial?.city || "",
    country: initial?.country || "France",
    propertyType: initial?.propertyType || "apartment",
    residencyStatus: initial?.residencyStatus || "",
    airbnbUrl: initial?.airbnbUrl || "",
    bookingUrl: initial?.bookingUrl || "",
    vrboUrl: initial?.vrboUrl || "",
    notes: initial?.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = mode === "create"
      ? "/api/properties"
      : `/api/properties/${initial?.id}`;

    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, locale }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error");
      setLoading(false);
      return;
    }

    const property = await res.json();
    router.push(`/${locale}/app/properties/${property.id}`);
  };

  const propertyTypes = ["apartment", "house", "studio", "room", "other"];

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t("city")}</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t("country")}</Label>
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
              <Label>{t("type")}</Label>
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
                      {t(`types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("residencyStatus")}</Label>
              <Select
                value={form.residencyStatus || ""}
                onValueChange={(v) =>
                  setForm({ ...form, residencyStatus: v || null })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("residencyPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">{t("residency.primary")}</SelectItem>
                  <SelectItem value="secondary">{t("residency.secondary")}</SelectItem>
                  <SelectItem value="other">{t("residency.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="airbnb">{t("airbnb")}</Label>
            <Input
              id="airbnb"
              type="url"
              value={form.airbnbUrl || ""}
              onChange={(e) => setForm({ ...form, airbnbUrl: e.target.value })}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking">{t("booking")}</Label>
            <Input
              id="booking"
              type="url"
              value={form.bookingUrl || ""}
              onChange={(e) => setForm({ ...form, bookingUrl: e.target.value })}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vrbo">{t("vrbo")}</Label>
            <Input
              id="vrbo"
              type="url"
              value={form.vrboUrl || ""}
              onChange={(e) => setForm({ ...form, vrboUrl: e.target.value })}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("notes")}</Label>
            <Textarea
              id="notes"
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {mode === "create" ? t("create") : t("save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
