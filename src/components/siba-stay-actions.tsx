"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileSearch, Download, ExternalLink, CheckCircle2 } from "lucide-react";
import { CopyFieldChip } from "@/components/copy-field-chip";
import { toast } from "sonner";

type Props = {
  propertyId: string;
  stayId: string;
  locale: string;
  guestCount: number;
};

type SibaStatus = {
  latestStatus: string | null;
  portalUrl: string | null;
  faqUrl: string | null;
  foreignGuestCount?: number;
};

export function SibaStayActions({ propertyId, stayId, locale, guestCount }: Props) {
  const t = useTranslations("siba");
  const [loading, setLoading] = useState<"prepare" | "status" | null>(null);
  const [phase, setPhase] = useState<"arrival" | "departure">("arrival");
  const [status, setStatus] = useState<SibaStatus | null>(null);

  const loadStatus = async (currentPhase: "arrival" | "departure") => {
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/guest-stays/${stayId}/siba?phase=${currentPhase}`
      );
      if (!res.ok) return;
      const json = await res.json();
      setStatus(json);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadStatus(phase);
  }, [propertyId, stayId, phase]);

  const runPrepare = async () => {
    setLoading("prepare");
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/guest-stays/${stayId}/siba`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "prepare", phase }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");

      if (json.ready) {
        toast.success(t("stay.prepareReady", { count: json.foreignGuestCount }));
      } else {
        toast.error(
          t("stay.validationFailed", { count: json.validationErrors?.length ?? 0 })
        );
      }
      await loadStatus(phase);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("stay.error"));
    } finally {
      setLoading(null);
    }
  };

  const updateStatus = async (newStatus: "prepared" | "submitted" | "accepted") => {
    setLoading("status");
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/guest-stays/${stayId}/siba`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_status", status: newStatus, phase }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      toast.success(t(`stay.statusUpdated.${newStatus}`));
      await loadStatus(phase);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("stay.error"));
    } finally {
      setLoading(null);
    }
  };

  const foreignCount = status?.foreignGuestCount ?? guestCount;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {t("system.siba")}
        </Badge>
        <select
          className="h-7 rounded border border-slate-200 bg-white px-2 text-xs"
          value={phase}
          onChange={(e) => setPhase(e.target.value as "arrival" | "departure")}
        >
          <option value="arrival">{t("stay.phaseArrival")}</option>
          <option value="departure">{t("stay.phaseDeparture")}</option>
        </select>
        {status?.latestStatus && (
          <Badge
            variant={status.latestStatus === "accepted" ? "secondary" : "outline"}
            className="text-xs"
          >
            {t(`submission.status.${status.latestStatus}` as "submission.status.prepared")}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={runPrepare}
          disabled={loading !== null || foreignCount === 0}
        >
          {loading === "prepare" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileSearch className="h-3.5 w-3.5" />
          )}
          {t("stay.prepare")}
        </Button>

        <a
          href={`/api/properties/${propertyId}/guest-stays/${stayId}/siba/export?phase=${phase}`}
        >
          <Button variant="outline" size="sm" disabled={foreignCount === 0}>
            <Download className="h-3.5 w-3.5" />
            {t("stay.exportCsv")}
          </Button>
        </a>

        <Link
          href={`/${locale}/app/properties/${propertyId}/siba-report/print/${stayId}?phase=${phase}`}
          target="_blank"
        >
          <Button variant="outline" size="sm" disabled={foreignCount === 0}>
            {t("stay.printBoletim")}
          </Button>
        </Link>

        {status?.portalUrl && (
          <a href={status.portalUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3.5 w-3.5" />
              {t("stay.openPortal")}
            </Button>
          </a>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => updateStatus("submitted")}
          disabled={loading !== null || foreignCount === 0}
        >
          {loading === "status" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3" />
          )}
          {t("stay.markSubmitted")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => updateStatus("accepted")}
          disabled={loading !== null || foreignCount === 0}
        >
          {t("stay.markAccepted")}
        </Button>
      </div>

      {foreignCount === 0 && guestCount > 0 && (
        <p className="text-xs text-slate-500">{t("stay.portugueseOnlyNote")}</p>
      )}

      <div className="flex flex-wrap gap-1">
        <CopyFieldChip
          label={t("copy.stayId")}
          value={stayId.slice(0, 12)}
          copiedLabel={t("copy.copied")}
        />
      </div>
    </div>
  );
}
