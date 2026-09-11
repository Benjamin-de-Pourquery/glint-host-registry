import { Badge } from "@/components/ui/badge";
import type { ComplianceStatus } from "@/lib/compliance";
import { useTranslations } from "next-intl";

const variantMap: Record<ComplianceStatus, "default" | "warning" | "destructive" | "secondary"> = {
  ready: "default",
  action_needed: "warning",
  expired: "destructive",
  not_started: "secondary",
};

export function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  const t = useTranslations("compliance.status");
  return <Badge variant={variantMap[status]}>{t(status)}</Badge>;
}
