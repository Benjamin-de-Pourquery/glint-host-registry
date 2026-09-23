import type { ColumnMapping, ParsedPlatformReservation, PlatformChannel } from "../types";
import { parseAirbnbCsv } from "./airbnb";
import { parseBookingCsv, parseBookingSheetRows } from "./booking";
import { parseGenericCsv } from "./generic";
import { parseCsvRows } from "./csv-utils";

export function parsePlatformFile(
  channel: PlatformChannel,
  content: Buffer | string,
  options?: {
    filename?: string;
    mapping?: ColumnMapping;
  }
): ParsedPlatformReservation[] {
  const text = typeof content === "string" ? content : content.toString("utf-8");
  const filename = (options?.filename ?? "").toLowerCase();

  if (channel === "AIRBNB") {
    return parseAirbnbCsv(text);
  }

  if (channel === "BOOKING") {
    if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
      return parseBookingXlsx(content);
    }
    return parseBookingCsv(text);
  }

  if (channel === "GENERIC") {
    return parseGenericCsv(text, options?.mapping ?? {});
  }

  return parseGenericCsv(text, options?.mapping ?? {});
}

function parseBookingXlsx(content: Buffer | string): ParsedPlatformReservation[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require("xlsx") as typeof import("xlsx");
  const buffer =
    typeof content === "string" ? Buffer.from(content, "binary") : content;
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" });
  const stringRows = rows.map((row) =>
    Array.isArray(row) ? row.map((cell) => String(cell ?? "")) : []
  );
  return parseBookingSheetRows(stringRows);
}

export { parseAirbnbCsv } from "./airbnb";
export { parseBookingCsv } from "./booking";
export { parseGenericCsv, detectCsvHeaders, GENERIC_COLUMN_FIELDS } from "./generic";
