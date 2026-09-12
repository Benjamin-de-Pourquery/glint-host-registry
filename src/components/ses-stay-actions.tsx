"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, FileSearch } from "lucide-react";
import { toast } from "sonner";

type Props = {
  propertyId: string;
  stayId: string;
  showSes: boolean;
};

export function SesStayActions({ propertyId, stayId, showSes }: Props) {
  const t = useTranslations("ses");
  const [loading, setLoading] = useState<"prepare" | "dry_run" | "live" | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  if (!showSes) return null;

  const runAction = async (action: "prepare" | "submit", mode?: "dry_run" | "live") => {
    setLoading(mode ? mode : "prepare");
    try {
      const res = await fetch(
        `/api/properties/${propertyId}/guest-stays/${stayId}/ses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, mode }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");

      if (action === "prepare") {
        if (json.ready) {
          toast.success(t("stay.prepareReady", { count: json.guestCount }));
        } else {
          toast.error(
            t("stay.validationFailed", {
              count: json.validationErrors?.length ?? 0,
            })
          );
        }
      } else {
        setLastStatus(json.status);
        if (json.status === "dry_run") {
          toast.success(t("stay.dryRunOk"));
        } else if (json.status === "accepted") {
          toast.success(t("stay.submittedOk"));
        } else if (json.status === "rejected") {
          toast.error(json.governmentMessage ?? t("stay.rejected"));
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("stay.error"));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => runAction("prepare")}
        disabled={loading !== null}
      >
        {loading === "prepare" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileSearch className="h-3.5 w-3.5" />
        )}
        {t("stay.prepare")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => runAction("submit", "dry_run")}
        disabled={loading !== null}
      >
        {loading === "dry_run" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
        {t("stay.dryRun")}
      </Button>
      <Button
        size="sm"
        onClick={() => runAction("submit", "live")}
        disabled={loading !== null}
      >
        {loading === "live" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
        {t("stay.submit")}
      </Button>
      {lastStatus && (
        <Badge variant={lastStatus === "accepted" ? "secondary" : "outline"} className="text-xs">
          {t(`submission.status.${lastStatus}`)}
        </Badge>
      )}
    </div>
  );
}
