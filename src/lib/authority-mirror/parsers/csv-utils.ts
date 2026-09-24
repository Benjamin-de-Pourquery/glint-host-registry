export function parseCsvRows(content: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      row.push(current.trim());
      current = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(current.trim());
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

export function rowsToObjects(rows: string[][]): Array<Record<string, string>> {
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  const objects: Array<Record<string, string>> = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    if (!row.some((cell) => cell.trim())) continue;
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = row[index]?.trim() ?? "";
      }
    });
    objects.push(obj);
  }

  return objects;
}

export function findHeaderKey(
  row: Record<string, string>,
  candidates: string[]
): string | undefined {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase().replace(/[^a-z0-9]/g, "");
    const match = keys.find(
      (key) => key.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized
    );
    if (match) return match;
  }
  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase();
    const match = keys.find((key) => key.toLowerCase().includes(normalized));
    if (match) return match;
  }
  return undefined;
}

export function parseFlexibleDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const iso = /^\d{4}-\d{2}-\d{2}/.exec(trimmed);
  if (iso) {
    const d = new Date(trimmed.slice(0, 10));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const eu = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/.exec(trimmed);
  if (eu) {
    const day = Number(eu[1]);
    const month = Number(eu[2]);
    let year = Number(eu[3]);
    if (year < 100) year += 2000;
    const d = new Date(year, month - 1, day);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const us = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/.exec(trimmed);
  if (us) {
    const month = Number(us[1]);
    const day = Number(us[2]);
    let year = Number(us[3]);
    if (year < 100) year += 2000;
    const d = new Date(year, month - 1, day);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseInteger(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const parsed = Number.parseInt(value.replace(/[^\d-]/g, ""), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseAmountCents(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const normalized = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  const amount = Number.parseFloat(normalized);
  if (Number.isNaN(amount)) return null;
  return Math.round(amount * 100);
}

export function computeNights(checkIn: Date, checkOut: Date, explicit?: number | null): number {
  if (explicit != null && explicit > 0) return explicit;
  const diff = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

export function normalizeReservationStatus(value: string | undefined): string {
  const raw = (value ?? "").trim().toLowerCase();
  if (!raw) return "confirmed";
  if (raw.includes("cancel")) return "cancelled";
  if (raw.includes("declin") || raw.includes("reject")) return "cancelled";
  return "confirmed";
}
