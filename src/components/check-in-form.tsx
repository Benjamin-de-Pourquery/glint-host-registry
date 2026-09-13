"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/signature-pad";
import { Loader2, CheckCircle, Info } from "lucide-react";
import {
  getSpainGuestReportingSystem,
  isSpainCountry,
  usesSesHospedajes,
} from "@/lib/spain/regions";

type Props = {
  token: string;
  propertyName: string;
  propertyCountry?: string;
  propertyCity?: string;
};

type ChildEntry = { firstNames: string; dateOfBirth: string; kinship: string };

export function CheckInForm({
  token,
  propertyName,
  propertyCountry = "",
  propertyCity = "",
}: Props) {
  const t = useTranslations("guestRegister.public");
  const tSes = useTranslations("ses.checkIn");
  const tRegional = useTranslations("ses.regionalSystem");
  const isSpain = isSpainCountry(propertyCountry);
  const sesApplies = isSpain && usesSesHospedajes(propertyCity);
  const regionalSystem = isSpain ? getSpainGuestReportingSystem(propertyCity) : null;
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
    kinship: "",
    postalCode: "",
    municipalityCode: "",
    municipalityName: "",
    addressCountryAlpha3: "",
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addChild = () => {
    setChildren((prev) => [...prev, { firstNames: "", dateOfBirth: "", kinship: "HI" }]);
  };

  const updateChild = (index: number, field: keyof ChildEntry, value: string) => {
    setChildren((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const removeChild = (index: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  const needsDocumentSupport =
    sesApplies && (form.documentType === "NIF" || form.documentType === "NIE");

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
        const validationMsg =
          data.validationErrors?.[0]?.message?.en || data.error;
        throw new Error(validationMsg || "Failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("submitError"));
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

      {isSpain && regionalSystem && regionalSystem !== "ses" && (
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">{tRegional("title")}</p>
            <p className="mt-1 text-xs text-amber-800">
              {regionalSystem === "catalonia"
                ? tRegional("catalonia", { city: propertyCity })
                : tRegional("basque", { city: propertyCity })}
            </p>
            <p className="mt-2 text-xs text-amber-700">{tRegional("hint")}</p>
          </div>
        </div>
      )}

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

      {sesApplies && (
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
                required
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
                maxLength={15}
                value={form.documentNumber}
                onChange={(e) => update("documentNumber", e.target.value)}
              />
            </div>
            {needsDocumentSupport && (
              <div className="space-y-2">
                <Label>{tSes("documentSupport")}</Label>
                <Input
                  required
                  maxLength={9}
                  value={form.documentSupport}
                  onChange={(e) => update("documentSupport", e.target.value)}
                  placeholder={tSes("documentSupportHint")}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>{tSes("sex")}</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                value={form.sex}
                onChange={(e) => update("sex", e.target.value)}
                required
              >
                <option value="">—</option>
                <option value="H">H</option>
                <option value="M">M</option>
                <option value="O">O</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>{tSes("addressCountry")}</Label>
              <Input
                required
                maxLength={3}
                value={form.addressCountryAlpha3}
                onChange={(e) => update("addressCountryAlpha3", e.target.value.toUpperCase())}
                placeholder={tSes("addressCountryHint")}
              />
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
            {sesApplies && (
              <div className="space-y-1">
                <Label className="text-xs">{tSes("kinship")}</Label>
                <select
                  className="flex h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm"
                  value={child.kinship}
                  onChange={(e) => updateChild(index, "kinship", e.target.value)}
                >
                  <option value="HI">HI</option>
                  <option value="CY">CY</option>
                  <option value="SG">SG</option>
                  <option value="OTR">OTR</option>
                </select>
              </div>
            )}
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
