"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { CopyFieldChip } from "@/components/copy-field-chip";
import { toast } from "sonner";

type Props = {
  propertyId: string;
  stayId: string;
  guestCount: number;
};

type StayNotifyStatus = {
  latestStatus: string | null;
  portalUrl: string | null;
  copyText: string | null;
  registrationNumber: string | null;
  permitNumber: string | null;
  guestCount?: number;
};

export function NlStayActions({ propertyId, stayId, guestCount }: Props) {
  const t = useTranslations("nl");
  const [loading, setLoading] = useState<"prepare" | "status" | null>(null);
  const [status, setStatus] = useState<StayNotifyStatus | null>(null);

  const loadStatus = async () => {
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/guest-stays/${stayId}/stay-notify`
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
        `/api/properties/${propertyId}/guest-stays/${stayId}/stay-notify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "prepare" }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      toast.success(t("stay.prepareReady"));
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
        `/api/properties/${propertyId}/guest-stays/${stayId}/stay-notify`,
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

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {t("system.stayNotify")}
        </Badge>
        {status?.latestStatus && (
          <Badge
            variant={status.latestStatus === "accepted" ? "secondary" : "outline"}
            className="text-xs"
          >
            {t(`stay.status.${status.latestStatus}` as "stay.status.prepared")}
          </Badge>
        )}
      </div>

      {status?.copyText && (
        <div className="flex flex-wrap gap-1">
          <CopyFieldChip
            label={t("stay.copyAll")}
            value={status.copyText}
            copiedLabel={t("stay.copied")}
          />
          {status.registrationNumber && (
            <CopyFieldChip
              label={t("stay.registration")}
              value={status.registrationNumber}
              copiedLabel={t("stay.copied")}
            />
          )}
          {status.permitNumber && (
            <CopyFieldChip
              label={t("stay.permit")}
              value={status.permitNumber}
              copiedLabel={t("stay.copied")}
            />
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={runPrepare}
          disabled={loading !== null}
        >
          {loading === "prepare" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {t("stay.prepare")}
        </Button>

        {status?.latestStatus === "prepared" && (
          <Button
            size="sm"
            onClick={() => updateStatus("submitted")}
            disabled={loading !== null}
          >
            {loading === "status" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {t("stay.markNotified")}
          </Button>
        )}

        {status?.portalUrl && (
          <a href={status.portalUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              <ExternalLink className="h-4 w-4" />
              {t("stay.openPortal")}
            </Button>
          </a>
        )}
      </div>

      <p className="text-xs text-slate-500">
        {t("stay.guestCount", { count })}
      </p>
    </div>
  );
}
