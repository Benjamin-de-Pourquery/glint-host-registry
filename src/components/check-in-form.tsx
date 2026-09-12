"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/signature-pad";
import { Loader2, CheckCircle } from "lucide-react";
import { isSpainCountry } from "@/lib/spain/regions";

type Props = {
  token: string;
  propertyName: string;
  propertyCountry?: string;
};

type ChildEntry = { firstNames: string; dateOfBirth: string };

export function CheckInForm({ token, propertyName, propertyCountry = "" }: Props) {
  const t = useTranslations("guestRegister.public");
  const tSes = useTranslations("ses.checkIn");
  const isSpain = isSpainCountry(propertyCountry);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildEntry[]>([]);

  const [form, setForm] = useState({
    lastName: "",
    firstNames: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "",
    usualAddress: "",
    mobile: "",
    email: "",
    arrivalDate: "",
    departureDate: "",
    website: "",
    documentType: "PAS",
    documentNumber: "",
    documentSupport: "",
    sex: "",
    postalCode: "",
    municipalityCode: "",
    municipalityName: "",
    addressCountryAlpha3: "",
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addChild = () => {
    setChildren((prev) => [...prev, { firstNames: "", dateOfBirth: "" }]);
  };

  const updateChild = (index: number, field: keyof ChildEntry, value: string) => {
    setChildren((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const removeChild = (index: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature) {
      setError(t("signatureRequired"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/check-in/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          signatureDataUrl: signature,
          accompanyingChildren: children.filter((c) => c.firstNames && c.dateOfBirth),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed");
      }

      setSubmitted(true);
    } catch {
      setError(t("submitError"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle className="h-12 w-12 text-emerald-600" />
        <h2 className="text-xl font-semibold text-slate-900">{t("thankYouTitle")}</h2>
        <p className="text-slate-600">{t("thankYouMessage")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-900">
        <p>{t("legalNotice")}</p>
        <p className="mt-2 text-xs text-blue-700">{t("frenchNote")}</p>
      </div>

      <p className="text-sm text-slate-600">
        {t("propertyLabel")}: <span className="font-medium text-slate-900">{propertyName}</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("lastName")}</Label>
          <Input
            required
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("firstNames")}</Label>
          <Input
            required
            value={form.firstNames}
            onChange={(e) => update("firstNames", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("dateOfBirth")}</Label>
          <Input
            required
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("placeOfBirth")}</Label>
          <Input
            required
            value={form.placeOfBirth}
            onChange={(e) => update("placeOfBirth", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("nationality")}</Label>
          <Input
            required
            value={form.nationality}
            onChange={(e) => update("nationality", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("mobile")}</Label>
          <Input
            required
            type="tel"
            value={form.mobile}
            onChange={(e) => update("mobile", e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>{t("usualAddress")}</Label>
          <Input
            required
            value={form.usualAddress}
            onChange={(e) => update("usualAddress", e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>{t("email")}</Label>
          <Input
            required
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("arrivalDate")}</Label>
          <Input
            required
            type="date"
            value={form.arrivalDate}
            onChange={(e) => update("arrivalDate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("departureDate")}</Label>
          <Input
            required
            type="date"
            value={form.departureDate}
            onChange={(e) => update("departureDate", e.target.value)}
          />
        </div>
      </div>

      {isSpain && (
        <div className="space-y-4 rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
          <p className="text-sm font-medium text-emerald-900">{tSes("title")}</p>
          <p className="text-xs text-emerald-800">{tSes("hint")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{tSes("documentType")}</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                value={form.documentType}
                onChange={(e) => update("documentType", e.target.value)}
              >
                <option value="PAS">PAS</option>
                <option value="NIF">NIF</option>
                <option value="NIE">NIE</option>
                <option value="OTRO">OTRO</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>{tSes("documentNumber")}</Label>
              <Input
                required
                value={form.documentNumber}
                onChange={(e) => update("documentNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{tSes("sex")}</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                value={form.sex}
                onChange={(e) => update("sex", e.target.value)}
              >
                <option value="">—</option>
                <option value="H">H</option>
                <option value="M">M</option>
                <option value="O">O</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>{tSes("postalCode")}</Label>
              <Input
                required
                value={form.postalCode}
                onChange={(e) => update("postalCode", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{tSes("municipalityCode")}</Label>
              <Input
                value={form.municipalityCode}
                onChange={(e) => update("municipalityCode", e.target.value)}
                placeholder={tSes("municipalityCodeHint")}
              />
            </div>
            <div className="space-y-2">
              <Label>{tSes("municipalityName")}</Label>
              <Input
                value={form.municipalityName}
                onChange={(e) => update("municipalityName", e.target.value)}
                placeholder={tSes("municipalityNameHint")}
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t("childrenTitle")}</Label>
          <Button type="button" variant="outline" size="sm" onClick={addChild}>
            {t("addChild")}
          </Button>
        </div>
        <p className="text-xs text-slate-500">{t("childrenHint")}</p>
        {children.map((child, index) => (
          <div key={index} className="flex flex-wrap items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">{t("childFirstNames")}</Label>
              <Input
                value={child.firstNames}
                onChange={(e) => updateChild(index, "firstNames", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("childDateOfBirth")}</Label>
              <Input
                type="date"
                value={child.dateOfBirth}
                onChange={(e) => updateChild(index, "dateOfBirth", e.target.value)}
              />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => removeChild(index)}>
              {t("removeChild")}
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>{t("signature")}</Label>
        <SignaturePad onChange={setSignature} />
      </div>

      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => update("website", e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {t("submit")}
      </Button>

      <p className="text-xs text-slate-500">{t("disclaimer")}</p>
    </form>
  );
}
