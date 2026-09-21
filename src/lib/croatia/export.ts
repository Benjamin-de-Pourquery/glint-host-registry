import { format } from "date-fns";
import { validateCheckInForEvisitor } from "./check-in-validation";
import { getEvisitorPortalUrl, getMintTourismUrl } from "./official-links";

export const EVISITOR_SYSTEM = "evisitor";

export type EvisitorGuestRecord = {
  id: string;
  lastName: string;
  firstNames: string;
  dateOfBirth: Date;
  placeOfBirth: string;
  nationality: string;
  usualAddress: string;
  mobile: string;
  email: string;
  arrivalDate: Date;
  departureDate: Date;
  documentType: string | null;
  documentNumber: string | null;
  sex: string | null;
};

export type EvisitorStayExport = {
  stayId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestLabel: string | null;
  guests: EvisitorGuestRecord[];
  phase: "arrival" | "departure";
  hrObjectId?: string | null;
  hrCategorisationNumber?: string | null;
};

const CSV_HEADERS = [
  "prezime",
  "ime",
  "spol",
  "datumRodjenja",
  "drzavljanstvo",
  "vrstaIsprave",
  "brojIsprave",
  "datumDolaska",
  "datumOdlaska",
  "faza",
];

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function recordToCsvRow(
  record: EvisitorGuestRecord,
  phase: "arrival" | "departure"
): string {
  const values = [
    record.lastName,
    record.firstNames,
    record.sex ?? "",
    format(record.dateOfBirth, "yyyy-MM-dd"),
    record.nationality,
    record.documentType ?? "",
    record.documentNumber ?? "",
    format(record.arrivalDate, "yyyy-MM-dd"),
    format(record.departureDate, "yyyy-MM-dd"),
    phase,
  ];
  return values.map(escapeCsv).join(",");
}

export function buildEvisitorCsvExport(stay: EvisitorStayExport): string {
  const header =
    `# Glint Host Registry — eVisitor guest export\n` +
    `# Stay: ${stay.stayId} · Phase: ${stay.phase} · Check-in: ${format(stay.checkInDate, "yyyy-MM-dd")}\n` +
    `# Manual portal entry — Glint does not submit to eVisitor (Phase 2: Rhetos API)\n`;
  const rows = [
    CSV_HEADERS.join(","),
    ...stay.guests.map((g) => recordToCsvRow(g, stay.phase)),
  ];
  return header + rows.join("\n");
}

export function validateStayForEvisitorExport(
  guests: EvisitorGuestRecord[]
): Array<{ guestId: string; field: string; message: { en: string; fr: string } }> {
  const errors: Array<{
    guestId: string;
    field: string;
    message: { en: string; fr: string };
  }> = [];

  for (const guest of guests) {
    const validationErrors = validateCheckInForEvisitor({
      lastName: guest.lastName,
      firstNames: guest.firstNames,
      dateOfBirth: format(guest.dateOfBirth, "yyyy-MM-dd"),
      placeOfBirth: guest.placeOfBirth,
      nationality: guest.nationality,
      usualAddress: guest.usualAddress,
      mobile: guest.mobile,
      email: guest.email,
      arrivalDate: format(guest.arrivalDate, "yyyy-MM-dd"),
      departureDate: format(guest.departureDate, "yyyy-MM-dd"),
      documentType: guest.documentType ?? undefined,
      documentNumber: guest.documentNumber ?? undefined,
      sex: guest.sex ?? undefined,
    });

    for (const err of validationErrors) {
      errors.push({ guestId: guest.id, field: err.field, message: err.message });
    }
  }

  return errors;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type EvisitorLabels = {
  title: string;
  deadlineNote: string;
  portalNote: string;
  phaseLabel: string;
  lastName: string;
  firstNames: string;
  sex: string;
  dateOfBirth: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
  arrivalDate: string;
  departureDate: string;
  footer: string;
  disclaimer: string;
  objectIdLabel: string;
};

export const EVISITOR_PRINT_STYLES = `
  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .subtitle { color: #64748b; margin-bottom: 24px; font-size: 14px; }
  .notice { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 13px; }
  .disclaimer { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th, td { text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 14px; }
  th { background: #f8fafc; font-weight: 600; width: 35%; }
  .guest-block { page-break-after: always; margin-bottom: 32px; }
  .guest-block:last-child { page-break-after: auto; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
  @media print { body { margin: 0; } }
`;

export function renderEvisitorGuestHtml(
  stay: EvisitorStayExport,
  property: { name: string; city: string },
  labels: EvisitorLabels
): string {
  const portalUrl = getEvisitorPortalUrl();
  const mintUrl = getMintTourismUrl();

  const guestBlocks = stay.guests
    .map((record) => {
      const fields = [
        { label: labels.lastName, value: record.lastName },
        { label: labels.firstNames, value: record.firstNames },
        { label: labels.sex, value: record.sex ?? "—" },
        { label: labels.dateOfBirth, value: format(record.dateOfBirth, "dd/MM/yyyy") },
        { label: labels.nationality, value: record.nationality },
        { label: labels.documentType, value: record.documentType ?? "—" },
        { label: labels.documentNumber, value: record.documentNumber ?? "—" },
        { label: labels.arrivalDate, value: format(record.arrivalDate, "dd/MM/yyyy") },
        { label: labels.departureDate, value: format(record.departureDate, "dd/MM/yyyy") },
      ];

      const rows = fields
        .map(
          (f) =>
            `<tr><th>${escapeHtml(f.label)}</th><td>${escapeHtml(f.value)}</td></tr>`
        )
        .join("");

      return `
        <div class="guest-block">
          <h2 style="font-size:16px;">${escapeHtml(record.lastName)}, ${escapeHtml(record.firstNames)}</h2>
          <table><tbody>${rows}</tbody></table>
        </div>
      `;
    })
    .join("");

  const phaseText =
    stay.phase === "arrival"
      ? labels.phaseLabel.replace("{phase}", "dolazak")
      : labels.phaseLabel.replace("{phase}", "odlazak");

  const objectInfo = stay.hrObjectId
    ? `<p style="font-size:13px;"><strong>${escapeHtml(labels.objectIdLabel)}:</strong> ${escapeHtml(stay.hrObjectId)}</p>`
    : "";

  return `
    <h1>${escapeHtml(labels.title)}</h1>
    <p class="subtitle">${escapeHtml(property.name)} — ${escapeHtml(property.city)} · eVisitor · ${escapeHtml(phaseText)}</p>
    <div class="disclaimer">
      <p><strong>${escapeHtml(labels.disclaimer)}</strong></p>
    </div>
    <div class="notice">
      <p><strong>${escapeHtml(labels.deadlineNote)}</strong></p>
      <p>${escapeHtml(labels.portalNote)}</p>
      <p><a href="${escapeHtml(portalUrl)}">${escapeHtml(portalUrl)}</a></p>
      <p><a href="${escapeHtml(mintUrl)}">${escapeHtml(mintUrl)}</a></p>
    </div>
    ${objectInfo}
    <p style="font-size:13px;color:#64748b;">
      Stay: ${format(stay.checkInDate, "dd/MM/yyyy")} – ${format(stay.checkOutDate, "dd/MM/yyyy")}
      ${stay.guestLabel ? ` · ${escapeHtml(stay.guestLabel)}` : ""}
    </p>
    ${guestBlocks}
    <div class="footer">
      <p>${escapeHtml(labels.footer)}</p>
      <p>Glint Host Registry — ${format(new Date(), "dd/MM/yyyy")}</p>
    </div>
  `;
}

export function getCopyFieldsForGuest(
  record: EvisitorGuestRecord
): Array<{ key: string; value: string }> {
  return [
    { key: "prezime", value: record.lastName },
    { key: "ime", value: record.firstNames },
    { key: "brojIsprave", value: record.documentNumber ?? "" },
    { key: "drzavljanstvo", value: record.nationality },
    { key: "datumDolaska", value: format(record.arrivalDate, "dd/MM/yyyy") },
    { key: "datumOdlaska", value: format(record.departureDate, "dd/MM/yyyy") },
  ].filter((f) => f.value);
}

export const EVISITOR_PHASE_NOTES = {
  arrival: "arrival",
  departure: "departure",
} as const;

export function getEvisitorPhaseFromNotes(
  notes: string | null | undefined
): "arrival" | "departure" | null {
  if (notes === EVISITOR_PHASE_NOTES.arrival) return "arrival";
  if (notes === EVISITOR_PHASE_NOTES.departure) return "departure";
  return null;
}
