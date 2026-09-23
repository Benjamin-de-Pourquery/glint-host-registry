import { endOfYear, startOfDay, startOfYear, subDays } from "date-fns";
import type { EvidencePackPeriodPreset } from "./types";

export function resolveEvidencePackPeriod(
  preset: EvidencePackPeriodPreset,
  customStart?: Date | string | null,
  customEnd?: Date | string | null,
  referenceDate: Date = new Date()
): { periodStart: Date; periodEnd: Date } {
  const today = startOfDay(referenceDate);

  if (preset === "90d") {
    return {
      periodStart: subDays(today, 90),
      periodEnd: today,
    };
  }

  if (preset === "calendar_year") {
    return {
      periodStart: startOfYear(today),
      periodEnd: endOfYear(today),
    };
  }

  if (!customStart || !customEnd) {
    throw new Error("Custom period requires periodStart and periodEnd");
  }

  const periodStart = startOfDay(new Date(customStart));
  const periodEnd = startOfDay(new Date(customEnd));

  if (periodStart.getTime() > periodEnd.getTime()) {
    throw new Error("periodStart must be before periodEnd");
  }

  return { periodStart, periodEnd };
}

export function formatPeriodFilename(
  propertyName: string,
  periodStart: Date,
  periodEnd: Date
): string {
  const slug = propertyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const start = periodStart.toISOString().slice(0, 10);
  const end = periodEnd.toISOString().slice(0, 10);
  return `evidence-pack-${slug || "property"}-${start}-${end}`;
}
