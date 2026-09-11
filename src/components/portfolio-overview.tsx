import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Users,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PortfolioStats = {
  total: number;
  ready: number;
  actionNeeded: number;
  expired: number;
  notStarted: number;
  guestsThisMonth: number;
};

type Props = {
  locale: string;
  stats: PortfolioStats;
};

export async function PortfolioOverview({ locale, stats }: Props) {
  const t = await getTranslations("dashboard");

  const hasAttention = stats.actionNeeded > 0 || stats.expired > 0;

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{t("overview")}</h2>

      {hasAttention && (
        <div className="space-y-2">
          {stats.actionNeeded > 0 && (
            <Link
              href={`/${locale}/app/properties`}
              className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-900 transition-colors hover:bg-amber-100"
            >
              <div className="flex min-w-0 items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm font-medium leading-snug">
                  {t("attention.action", { count: stats.actionNeeded })}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-amber-600" />
            </Link>
          )}
          {stats.expired > 0 && (
            <Link
              href={`/${locale}/app/properties`}
              className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-red-900 transition-colors hover:bg-red-100"
            >
              <div className="flex min-w-0 items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                <p className="text-sm font-medium leading-snug">
                  {t("attention.expired", { count: stats.expired })}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-red-600" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 md:gap-3">
        <StatusCell
          icon={AlertTriangle}
          label={t("stats.action")}
          value={stats.actionNeeded}
          emphasized={stats.actionNeeded > 0}
          tone="amber"
        />
        <StatusCell
          icon={XCircle}
          label={t("stats.expired")}
          value={stats.expired}
          emphasized={stats.expired > 0}
          tone="red"
        />
        <StatusCell
          icon={CheckCircle2}
          label={t("stats.ready")}
          value={stats.ready}
          tone="emerald"
        />
        <StatusCell
          icon={Clock}
          label={t("stats.notStarted")}
          value={stats.notStarted}
          tone="slate"
        />
        <StatusCell
          icon={Building2}
          label={t("stats.total")}
          value={stats.total}
          secondary
          tone="slate"
        />
        <StatusCell
          icon={Users}
          label={t("stats.guestsThisMonth")}
          value={stats.guestsThisMonth}
          secondary
          tone="blue"
        />
      </div>
    </section>
  );
}

type Tone = "amber" | "red" | "emerald" | "slate" | "blue";

const toneStyles: Record<
  Tone,
  { icon: string; bg: string; emphasized: string }
> = {
  amber: {
    icon: "text-amber-600",
    bg: "bg-amber-50/80",
    emphasized: "border-amber-300 bg-amber-50 ring-1 ring-amber-200",
  },
  red: {
    icon: "text-red-600",
    bg: "bg-red-50/80",
    emphasized: "border-red-300 bg-red-50 ring-1 ring-red-200",
  },
  emerald: {
    icon: "text-emerald-600",
    bg: "bg-emerald-50/80",
    emphasized: "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200",
  },
  slate: {
    icon: "text-slate-500",
    bg: "bg-slate-50/80",
    emphasized: "border-slate-300 bg-slate-50 ring-1 ring-slate-200",
  },
  blue: {
    icon: "text-blue-600",
    bg: "bg-blue-50/80",
    emphasized: "border-blue-300 bg-blue-50 ring-1 ring-blue-200",
  },
};

function StatusCell({
  icon: Icon,
  label,
  value,
  emphasized = false,
  secondary = false,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  emphasized?: boolean;
  secondary?: boolean;
  tone: Tone;
}) {
  const styles = toneStyles[tone];

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-slate-200/80 px-2.5 py-2 sm:px-3 sm:py-2.5",
        secondary ? "bg-slate-50/50" : styles.bg,
        emphasized && styles.emphasized
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon
          className={cn(
            "shrink-0",
            secondary ? "h-3.5 w-3.5 text-slate-400" : "h-4 w-4",
            !secondary && styles.icon
          )}
        />
        <p
          className={cn(
            "font-semibold tabular-nums leading-none text-slate-900",
            emphasized ? "text-xl sm:text-2xl" : secondary ? "text-lg sm:text-xl" : "text-xl"
          )}
        >
          {value}
        </p>
      </div>
      <p
        className={cn(
          "leading-tight",
          secondary ? "text-[10px] text-slate-400 sm:text-xs" : "text-[11px] text-slate-500 sm:text-xs"
        )}
      >
        {label}
      </p>
    </div>
  );
}
