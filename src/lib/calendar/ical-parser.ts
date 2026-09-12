import { createHash } from "crypto";

export type ParsedCalendarEvent = {
  uid: string;
  summary: string;
  checkInDate: Date;
  checkOutDate: Date;
  cancelled: boolean;
};

function unfoldIcalLines(content: string): string[] {
  const rawLines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const lines: string[] = [];

  for (const line of rawLines) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }

  return lines;
}

function parseIcalDate(value: string): Date | null {
  const trimmed = value.trim();
  const dateOnlyMatch = /^(\d{4})(\d{2})(\d{2})$/.exec(trimmed);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const dateTimeMatch =
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(trimmed);
  if (dateTimeMatch) {
    const [, year, month, day, hour, minute, second, zulu] = dateTimeMatch;
    if (zulu) {
      return new Date(
        Date.UTC(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          Number(second)
        )
      );
    }
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function stripPropertyName(line: string): { name: string; value: string } | null {
  const separatorIndex = line.indexOf(":");
  if (separatorIndex === -1) return null;

  const rawName = line.slice(0, separatorIndex);
  const value = line.slice(separatorIndex + 1);
  const name = rawName.split(";")[0]?.toUpperCase();
  if (!name) return null;

  return { name, value };
}

function stableEventHash(event: {
  summary: string;
  checkInDate: Date;
  checkOutDate: Date;
}): string {
  const key = `${event.checkInDate.toISOString()}|${event.checkOutDate.toISOString()}|${event.summary}`;
  return createHash("sha256").update(key).digest("hex").slice(0, 32);
}

export function parseIcalEvents(content: string): ParsedCalendarEvent[] {
  const lines = unfoldIcalLines(content);
  const events: ParsedCalendarEvent[] = [];
  let inEvent = false;
  let current: {
    uid?: string;
    summary?: string;
    dtstart?: Date;
    dtend?: Date;
    status?: string;
  } = {};

  for (const line of lines) {
    const upper = line.trim().toUpperCase();

    if (upper === "BEGIN:VEVENT") {
      inEvent = true;
      current = {};
      continue;
    }

    if (upper === "END:VEVENT") {
      if (inEvent && current.dtstart) {
        const checkInDate = current.dtstart;
        const checkOutDate =
          current.dtend && current.dtend > checkInDate
            ? current.dtend
            : new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000);
        const summary = (current.summary ?? "").trim();

        const uid =
          current.uid?.trim() ||
          stableEventHash({ summary, checkInDate, checkOutDate });

        events.push({
          uid,
          summary,
          checkInDate,
          checkOutDate,
          cancelled: current.status?.toUpperCase() === "CANCELLED",
        });
      }

      inEvent = false;
      current = {};
      continue;
    }

    if (!inEvent) continue;

    const parsedLine = stripPropertyName(line.trim());
    if (!parsedLine) continue;

    switch (parsedLine.name) {
      case "UID":
        current.uid = parsedLine.value;
        break;
      case "SUMMARY":
        current.summary = parsedLine.value;
        break;
      case "DTSTART":
        current.dtstart = parseIcalDate(parsedLine.value) ?? current.dtstart;
        break;
      case "DTEND":
        current.dtend = parseIcalDate(parsedLine.value) ?? current.dtend;
        break;
      case "STATUS":
        current.status = parsedLine.value;
        break;
      default:
        break;
    }
  }

  return events;
}

export function buildExternalUid(feedId: string, eventUid: string): string {
  return `${feedId}:${eventUid}`;
}
