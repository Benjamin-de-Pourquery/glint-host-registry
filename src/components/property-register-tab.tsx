"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ComplianceBadge } from "@/components/compliance-badge";
import { GuestRegisterPanel } from "@/components/guest-register-panel";
import { SesCredentialsPanel } from "@/components/ses-credentials-panel";
import { AlloggiatiReportingPanel } from "@/components/alloggiati-reporting-panel";
import { AlloggiatiCredentialsPanel } from "@/components/alloggiati-credentials-panel";
import { CinComplianceCard } from "@/components/cin-compliance-card";
import { RnalComplianceCard } from "@/components/rnal-compliance-card";
import { AmaComplianceCard } from "@/components/ama-compliance-card";
import { SibaReportingPanel } from "@/components/siba-reporting-panel";
import { AadeReportingPanel } from "@/components/aade-reporting-panel";
import { isSpainCountry } from "@/lib/spain/regions";
import { isItalyCountry } from "@/lib/italy/regions";
import { isPortugalCountry } from "@/lib/portugal/regions";
import { isGreeceCountry } from "@/lib/greece/regions";
import { NationalTransitionCard } from "@/components/national-transition-card";
import { getComplianceStatus } from "@/lib/compliance";
import { Copy, Check, FileText, Printer } from "lucide-react";
import { toast } from "sonner";

type ChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
  notes?: string | null;
};

type Registration = {
  registrationNumber?: string | null;
  issuingAuthority?: string | null;
  status?: string | null;
  issueDate?: string | Date | null;
  expiryDate?: string | Date | null;
  notes?: string | null;
  nationalRegistrationNumber?: string | null;
  nationalTransitionStatus?: string | null;
  nationalRenewalDeadline?: string | Date | null;
  cinNumber?: string | null;
  cinBdsrStatus?: string | null;
  cinDisplayedOnListings?: boolean;
  rnalNumber?: string | null;
  rnalStatus?: string | null;
  rnalDisplayedOnListings?: boolean;
  amaNumber?: string | null;
  amaStatus?: string | null;
  amaDisplayedOnListings?: boolean;
  greeceRegistrationKind?: string | null;
  greeceAlternateLicenseNumber?: string | null;
  atak?: string | null;
};

type Props = {
  propertyId: string;
  locale: string;
  country: string;
  city: string;
  registration: Registration | null;
  checklistItems: ChecklistItem[];
};

export function PropertyRegisterTab({
  propertyId,
  locale,
  country,
  city,
  registration,
  checklistItems: initialChecklist,
}: Props) {
  const t = useTranslations("compliance");
  const router = useRouter();

  const formatDate = (d: string | Date | null | undefined) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  const [reg, setReg] = useState<Registration>({
    registrationNumber: registration?.registrationNumber || "",
    issuingAuthority: registration?.issuingAuthority || "",
    status: registration?.status || "not_started",
    issueDate: formatDate(registration?.issueDate),
    expiryDate: formatDate(registration?.expiryDate),
    notes: registration?.notes || "",
  });

  const [checklist, setChecklist] = useState(initialChecklist);
  const [newItem, setNewItem] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const completed = checklist.filter((c) => c.completed).length;
  const complianceStatus = getComplianceStatus({
    registrationNumber: reg.registrationNumber,
    status: reg.status,
    expiryDate: reg.expiryDate ? new Date(reg.expiryDate) : null,
    checklistCompleted: completed,
    checklistTotal: checklist.length,
  });

  const saveRegistration = async () => {
    setSaving(true);
    await fetch(`/api/properties/${propertyId}/registration`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reg),
    });
    setSaving(false);
    router.refresh();
    toast.success(t("registration.save"));
  };

  const toggleChecklist = async (item: ChecklistItem) => {
    const updated = await fetch(`/api/properties/${propertyId}/checklist`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, completed: !item.completed }),
    });
    const data = await updated.json();
    setChecklist((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, completed: data.completed } : c))
    );
  };

  const addChecklistItem = async () => {
    if (!newItem.trim()) return;
    const res = await fetch(`/api/properties/${propertyId}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newItem }),
    });
    const item = await res.json();
    setChecklist((prev) => [...prev, item]);
    setNewItem("");
  };

  const copyNumber = () => {
    if (reg.registrationNumber) {
      navigator.clipboard.writeText(reg.registrationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statuses = ["not_started", "pending", "active", "expired"];

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      {isSpainCountry(country) && (
        <SesCredentialsPanel propertyId={propertyId} city={city} />
      )}
      {isItalyCountry(country) && (
        <>
          <CinComplianceCard propertyId={propertyId} registration={registration} />
          <AlloggiatiCredentialsPanel propertyId={propertyId} />
          <AlloggiatiReportingPanel city={city} />
        </>
      )}
      {isPortugalCountry(country) && (
        <>
          <RnalComplianceCard propertyId={propertyId} registration={registration} />
          <SibaReportingPanel city={city} />
        </>
      )}
      {isGreeceCountry(country) && (
        <>
          <AmaComplianceCard propertyId={propertyId} registration={registration} />
          <AadeReportingPanel city={city} />
        </>
      )}
      <GuestRegisterPanel
        propertyId={propertyId}
        locale={locale}
        country={country}
        city={city}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t("readiness.title")}</h2>
          <ComplianceBadge status={complianceStatus} />
        </div>
        {reg.registrationNumber && (
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm">
              {reg.registrationNumber}
            </code>
            <Button variant="outline" size="sm" onClick={copyNumber}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? t("readiness.copied") : t("readiness.copy")}
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <a href={`/${locale}/export/${propertyId}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4" />
              {t("readiness.export")}
            </Button>
          </a>
          <a
            href={`/${locale}/export/${propertyId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setTimeout(() => window.print(), 500)}
          >
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4" />
              {t("readiness.print")}
            </Button>
          </a>
        </div>
      </section>

      <NationalTransitionCard
        propertyId={propertyId}
        country={country}
        locale={locale}
        registration={registration}
        showForm
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">{t("registration.title")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("registration.number")}</Label>
            <Input
              value={reg.registrationNumber || ""}
              onChange={(e) => setReg({ ...reg, registrationNumber: e.target.value })}
              placeholder="e.g. 75112-STR-2024-00847"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("registration.authority")}</Label>
            <Input
              value={reg.issuingAuthority || ""}
              onChange={(e) => setReg({ ...reg, issuingAuthority: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("registration.status")}</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              value={reg.status || "not_started"}
              onChange={(e) => setReg({ ...reg, status: e.target.value })}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{t(`registration.statuses.${s}`)}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>{t("registration.issueDate")}</Label>
            <Input
              type="date"
              value={typeof reg.issueDate === "string" ? reg.issueDate : formatDate(reg.issueDate)}
              onChange={(e) => setReg({ ...reg, issueDate: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("registration.expiryDate")}</Label>
            <Input
              type="date"
              value={typeof reg.expiryDate === "string" ? reg.expiryDate : formatDate(reg.expiryDate)}
              onChange={(e) => setReg({ ...reg, expiryDate: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("registration.notes")}</Label>
          <Textarea
            value={reg.notes || ""}
            onChange={(e) => setReg({ ...reg, notes: e.target.value })}
          />
        </div>
        <Button onClick={saveRegistration} disabled={saving}>
          {t("registration.save")}
        </Button>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">{t("checklist.title")}</h2>
        {checklist.length === 0 ? (
          <p className="text-sm text-slate-500">{t("checklist.empty")}</p>
        ) : (
          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2.5"
              >
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleChecklist(item)}
                />
                <span
                  className={`text-sm ${item.completed ? "text-slate-500 line-through" : "text-slate-900"}`}
                >
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={t("checklist.placeholder")}
            onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
          />
          <Button variant="outline" onClick={addChecklistItem}>
            {t("checklist.add")}
          </Button>
        </div>
      </section>
    </div>
  );
}
