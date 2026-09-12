export const CALENDAR_SOURCE_LABELS = [
  "airbnb",
  "booking",
  "vrbo",
  "google",
  "other",
] as const;

export type CalendarSourceLabel = (typeof CALENDAR_SOURCE_LABELS)[number];

const STAY_SOURCE_LABELS = new Set<string>(CALENDAR_SOURCE_LABELS);

export function detectSourceLabelFromUrl(
  url: URL,
  requested?: CalendarSourceLabel | null
): CalendarSourceLabel | null {
  if (requested && requested !== "other") {
    return requested;
  }
  if (url.hostname.toLowerCase() === "calendar.google.com") {
    return "google";
  }
  return requested ?? null;
}

export function resolveStaySource(sourceLabel: string | null | undefined): string {
  if (sourceLabel && STAY_SOURCE_LABELS.has(sourceLabel)) {
    return sourceLabel;
  }
  return "ical";
}
