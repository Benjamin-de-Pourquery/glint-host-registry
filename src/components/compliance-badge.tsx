import { Badge } from "@/components/ui/badge";
import type { ComplianceStatus } from "@/lib/compliance";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const variantMap: Record<ComplianceStatus, "default" | "warning" | "destructive" | "secondary"> = {
  ready: "default",
  action_needed: "warning",
  expired: "destructive",
  not_started: "secondary",
};

export function ComplianceBadge({
  status,
  className,
}: {
  status: ComplianceStatus;
  className?: string;
}) {
  const t = useTranslations("compliance.status");
  return (
    <Badge variant={variantMap[status]} className={cn(className)}>
      {t(status)}
    </Badge>
  );
}
