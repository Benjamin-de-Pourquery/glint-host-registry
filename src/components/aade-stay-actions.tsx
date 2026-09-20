"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileSearch, Download, ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";
import { CopyFieldChip } from "@/components/copy-field-chip";
import { toast } from "sonner";

type Props = {
  propertyId: string;
  stayId: string;
  locale: string;
  guestCount: number;
  checkInDate: string;
  checkOutDate: string;
};

type AadeStatus = {
  latestStatus: string | null;
  portalUrl: string | null;
  hubUrl: string | null;
  guestCount?: number;
  isLongTerm?: boolean;
  nightCount?: number;
  declarationDeadline?: string | null;
};

export function AadeStayActions({
  propertyId,
  stayId,
  locale,
  guestCount,
  checkInDate,
  checkOutDate,
}: Props) {
  const t = useTranslations("aade");
  const [loading, setLoading] = useState<"prepare" | "status" | null>(null);
  const [status, setStatus] = useState<AadeStatus | null>(null);

  const loadStatus = async () => {
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/guest-stays/${stayId}/aade`
      );
      if (!res.ok) return;
      const json = await res.json();
      setStatus(json);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadStatus();
  }, [propertyId, stayId]);

  const runPrepare = async () => {
    setLoading("prepare");
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/guest-stays/${stayId}/aade`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "prepare" }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");

      if (json.ready) {
        toast.success(t("stay.prepareReady", { count: json.guestCount }));
      } else if (json.isLongTerm) {
        toast.error(t("stay.longTermNote"));
      } else {
        toast.error(
          t("stay.validationFailed", { count: json.validationErrors?.length ?? 0 })
        );
      }
      await loadStatus();
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
        `/api/properties/${propertyId}/guest-stays/${stayId}/aade`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_status", status: newStatus }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      toast.success(t(`stay.statusUpdated.${newStatus}`));
      await loadStatus();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("stay.error"));
    } finally {
      setLoading(null);
    }
  };

  const count = status?.guestCount ?? guestCount;
  const isLongTerm = status?.isLongTerm ?? false;

  if (isLongTerm) {
    return (
      <div className="flex w-full flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
        <div className="flex items-center gap-2 text-xs text-amber-900">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{t("stay.longTermNote")}</span>
        </div>
        {status?.nightCount != null && (
          <Badge variant="outline" className="w-fit text-xs">
            {t("stay.nightCount", { count: status.nightCount })}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {t("system.aade")}
        </Badge>
        {status?.latestStatus && (
          <Badge
            variant={status.latestStatus === "accepted" ? "secondary" : "outline"}
            className="text-xs"
          >
            {t(`submission.status.${status.latestStatus}` as "submission.status.prepared")}
          </Badge>
        )}
        {status?.declarationDeadline && (
          <Badge variant="outline" className="text-xs text-emerald-700">
            {t("stay.deadline", {
              date: new Date(status.declarationDeadline).toLocaleDateString(),
            })}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={runPrepare}
          disabled={loading !== null || count === 0}
        >
          {loading === "prepare" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileSearch className="h-3.5 w-3.5" />
          )}
          {t("stay.prepare")}
        </Button>

        <a href={`/api/properties/${propertyId}/guest-stays/${stayId}/aade/export`}>
          <Button variant="outline" size="sm" disabled={count === 0}>
            <Download className="h-3.5 w-3.5" />
            {t("stay.exportCsv")}
          </Button>
        </a>

        <Link
          href={`/${locale}/app/properties/${propertyId}/aade-report/print/${stayId}`}
          target="_blank"
        >
          <Button variant="outline" size="sm" disabled={count === 0}>
            {t("stay.printDeclaration")}
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
          disabled={loading !== null || count === 0}
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
          disabled={loading !== null || count === 0}
        >
          {t("stay.markAccepted")}
        </Button>
      </div>

      {count === 0 && (
        <p className="text-xs text-slate-500">{t("stay.noGuestsNote")}</p>
      )}

      <div className="flex flex-wrap gap-1">
        <CopyFieldChip
          label={t("copy.stayId")}
          value={stayId.slice(0, 12)}
          copiedLabel={t("copy.copied")}
        />
        <CopyFieldChip
          label={t("copy.checkIn")}
          value={checkInDate.slice(0, 10)}
          copiedLabel={t("copy.copied")}
        />
        <CopyFieldChip
          label={t("copy.checkOut")}
          value={checkOutDate.slice(0, 10)}
          copiedLabel={t("copy.copied")}
        />
      </div>
    </div>
  );
}
