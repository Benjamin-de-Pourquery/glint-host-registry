import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ListingHealthScore } from "@/lib/listing-health/types";

const variantMap: Record<
  ListingHealthScore,
  "default" | "warning" | "destructive" | "secondary"
> = {
  GREEN: "default",
  ORANGE: "warning",
  RED: "destructive",
};

const toneMap: Record<ListingHealthScore, string> = {
  GREEN: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  ORANGE: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  RED: "bg-red-100 text-red-800 hover:bg-red-100",
};

export function ListingHealthBadge({
  score,
  className,
}: {
  score: ListingHealthScore;
  className?: string;
}) {
  const t = useTranslations("listingHealth.score");

  return (
    <Badge
      variant={variantMap[score]}
      className={cn(toneMap[score], className)}
    >
      {t(score)}
    </Badge>
  );
}
