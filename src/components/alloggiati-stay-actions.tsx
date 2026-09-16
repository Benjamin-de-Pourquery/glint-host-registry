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

type AlloggiatiStatus = {
  latestStatus: string | null;
  portalUrl: string | null;
  loginUrl: string | null;
};

export function AlloggiatiStayActions({ propertyId, stayId, locale, guestCount }: Props) {
  const t = useTranslations("alloggiati");
  const [loading, setLoading] = useState<"prepare" | "status" | null>(null);
  const [status, setStatus] = useState<AlloggiatiStatus | null>(null);

  const loadStatus = async () => {
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/guest-stays/${stayId}/alloggiati`
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
        `/api/properties/${propertyId}/guest-stays/${stayId}/alloggiati`,
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
        `/api/properties/${propertyId}/guest-stays/${stayId}/alloggiati`,
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

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {t("system.alloggiati")}
        </Badge>
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
          disabled={loading !== null || guestCount === 0}
        >
          {loading === "prepare" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileSearch className="h-3.5 w-3.5" />
          )}
          {t("stay.prepare")}
        </Button>

        <a href={`/api/properties/${propertyId}/guest-stays/${stayId}/alloggiati/export`}>
          <Button variant="outline" size="sm" disabled={guestCount === 0}>
            <Download className="h-3.5 w-3.5" />
            {t("stay.exportCsv")}
          </Button>
        </a>

        <Link
          href={`/${locale}/app/properties/${propertyId}/alloggiati-report/print/${stayId}`}
          target="_blank"
        >
          <Button variant="outline" size="sm" disabled={guestCount === 0}>
            {t("stay.printSchedina")}
          </Button>
        </Link>

        {status?.loginUrl && (
          <a href={status.loginUrl} target="_blank" rel="noopener noreferrer">
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
          disabled={loading !== null || guestCount === 0}
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
          disabled={loading !== null || guestCount === 0}
        >
          {t("stay.markAccepted")}
        </Button>
      </div>

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
