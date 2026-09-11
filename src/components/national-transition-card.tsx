"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CopyFieldChip } from "@/components/copy-field-chip";
import {
  canEditNationalNumber,
  isFranceCountry,
  NATIONAL_PORTAL_PRIMARY_URL,
  NATIONAL_TRANSITION_STATUSES,
  type NationalTransitionStatus,
} from "@/lib/national-transition";
import { ExternalLink, Flag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type NationalTransitionRegistration = {
  registrationNumber?: string | null;
  nationalRegistrationNumber?: string | null;
  nationalTransitionStatus?: string | null;
  nationalRenewalDeadline?: string | Date | null;
};

type Props = {
  propertyId: string;
  country: string;
  locale: string;
  registration: NationalTransitionRegistration | null;
  complianceTabHref?: string;
  className?: string;
  showForm?: boolean;
};

const STATUS_TONE: Record<
  NationalTransitionStatus,
  "slate" | "amber" | "blue" | "emerald" | "red"
> = {
  not_applicable: "slate",
  awaiting_portal: "amber",
  ready_to_renew: "blue",
  renewed: "emerald",
  expired_local: "red",
};

const toneClasses = {
  slate: "border-slate-200 bg-slate-50",
  amber: "border-amber-200 bg-gradient-to-br from-amber-50 to-white",
  blue: "border-blue-200 bg-gradient-to-br from-blue-50 to-white",
  emerald: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
  red: "border-red-200 bg-gradient-to-br from-red-50 to-white",
};

function formatDateInput(d: string | Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

export function NationalTransitionCard({
  propertyId,
  country,
  locale,
  registration,
  complianceTabHref,
  className,
  showForm = true,
}: Props) {
  const t = useTranslations("nationalTransition");
  const router = useRouter();

  if (!isFranceCountry(country)) {
    return null;
  }

  const status = (registration?.nationalTransitionStatus ??
    "awaiting_portal") as NationalTransitionStatus;
  const tone = STATUS_TONE[status] ?? "amber";
  const municipalNumber = registration?.registrationNumber?.trim() ?? "";
  const nationalNumber = registration?.nationalRegistrationNumber ?? "";
  const editable = canEditNationalNumber(status);

  const [form, setForm] = useState({
    nationalRegistrationNumber: nationalNumber,
    nationalTransitionStatus: status,
    nationalRenewalDeadline: formatDateInput(registration?.nationalRenewalDeadline),
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/registration`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nationalRegistrationNumber: form.nationalRegistrationNumber || null,
          nationalTransitionStatus: form.nationalTransitionStatus,
          nationalRenewalDeadline: form.nationalRenewalDeadline || null,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      toast.success(t("saved"));
      router.refresh();
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  const playbookHref =
    complianceTabHref ?? `/${locale}/app/properties/${propertyId}?tab=compliance`;

  return (
    <section
      className={cn(
        "rounded-2xl border p-5 shadow-sm",
        toneClasses[tone],
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-slate-600" />
            <h3 className="text-base font-semibold text-slate-900">{t("title")}</h3>
          </div>
          <p className="text-sm text-slate-600">{t(`description.${status}`)}</p>
        </div>
        <Badge variant="outline" className="shrink-0 self-start border-slate-300 bg-white/80">
          {t(`status.${status}`)}
        </Badge>
      </div>

      <div className="mt-4 space-y-3">
        {municipalNumber ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t("municipalNumber")}
            </span>
            <CopyFieldChip
              label={t("municipalShort")}
              value={municipalNumber}
              copiedLabel={t("copied")}
            />
          </div>
        ) : (
          <p className="rounded-lg border border-amber-200/80 bg-white/70 px-3 py-2 text-sm text-amber-900">
            {t("noMunicipalYet")}
          </p>
        )}

        {form.nationalRegistrationNumber && !showForm && (
          <CopyFieldChip
            label={t("nationalShort")}
            value={form.nationalRegistrationNumber}
            copiedLabel={t("copied")}
          />
        )}

        {registration?.nationalRenewalDeadline && !showForm && (
          <p className="text-sm text-slate-600">
            {t("renewalDeadline", {
              date: new Date(registration.nationalRenewalDeadline).toLocaleDateString(
                locale === "fr" ? "fr-FR" : "en-GB"
              ),
            })}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={NATIONAL_PORTAL_PRIMARY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="bg-white/80">
            <ExternalLink className="h-4 w-4" />
            {status === "ready_to_renew" ? t("ctaRenew") : t("ctaOfficial")}
          </Button>
        </a>
        <Link href={playbookHref}>
          <Button variant="outline" size="sm" className="bg-white/80">
            {t("ctaPlaybook")}
          </Button>
        </Link>
      </div>

      {showForm && (
        <div className="mt-5 space-y-4 border-t border-slate-200/80 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`national-number-${propertyId}`}>{t("nationalNumber")}</Label>
              <Input
                id={`national-number-${propertyId}`}
                value={form.nationalRegistrationNumber}
                onChange={(e) =>
                  setForm({ ...form, nationalRegistrationNumber: e.target.value })
                }
                placeholder={t("nationalPlaceholder")}
                disabled={!editable}
              />
              {!editable && (
                <p className="text-xs text-slate-500">{t("nationalLocked")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`national-status-${propertyId}`}>{t("statusLabel")}</Label>
              <select
                id={`national-status-${propertyId}`}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                value={form.nationalTransitionStatus}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nationalTransitionStatus: e.target.value as NationalTransitionStatus,
                  })
                }
              >
                {NATIONAL_TRANSITION_STATUSES.filter((s) => s !== "not_applicable").map(
                  (s) => (
                    <option key={s} value={s}>{t(`status.${s}`)}</option>
                  )
                )}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`national-deadline-${propertyId}`}>{t("renewalDeadlineLabel")}</Label>
              <Input
                id={`national-deadline-${propertyId}`}
                type="date"
                value={form.nationalRenewalDeadline}
                onChange={(e) =>
                  setForm({ ...form, nationalRenewalDeadline: e.target.value })
                }
              />
            </div>
          </div>
          <Button size="sm" onClick={save} disabled={saving}>
            {t("save")}
          </Button>
        </div>
      )}
    </section>
  );
}
