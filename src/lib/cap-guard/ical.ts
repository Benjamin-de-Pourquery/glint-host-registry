import { addDays, format } from "date-fns";
import type { DateRange } from "./types";

function escapeIcalText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatIcalDate(date: Date): string {
  return format(date, "yyyyMMdd");
}

function foldLine(line: string): string {
  const max = 75;
  if (line.length <= max) return line;
  const parts: string[] = [line.slice(0, max)];
  let offset = max;
  while (offset < line.length) {
    parts.push(` ${line.slice(offset, offset + max - 1)}`);
    offset += max - 1;
  }
  return parts.join("\r\n");
}

export function buildGuardIcalFeed(
  blocks: DateRange[],
  options: {
    propertyName: string;
    summaryEn: string;
    summaryFr: string;
    locale?: "en" | "fr";
    generatedAt?: Date;
  }
): string {
  const now = options.generatedAt ?? new Date();
  const stamp = format(now, "yyyyMMdd'T'HHmmss'Z'");
  const summary =
    options.locale === "fr" ? options.summaryFr : options.summaryEn;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Glint Host Registry//Cap Guard//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcalText(`Cap Guard, ${options.propertyName}`)}`,
    `X-WR-CALDESC:${escapeIcalText(
      "Availability blocks published by Glint Host Registry Cap Guard."
    )}`,
  ];

  for (const block of blocks) {
    const uid = `cap-guard-${formatIcalDate(block.start)}-${formatIcalDate(block.end)}@glint-host-registry`;
    const dtStart = formatIcalDate(block.start);
    const dtEnd = formatIcalDate(addDays(block.end, 1));
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      foldLine(`SUMMARY:${escapeIcalText(summary)}`),
      "TRANSP:TRANSPARENT",
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
