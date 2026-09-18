import { format } from "date-fns";
import { validateCheckInForSiba } from "./check-in-validation";
import { getSibaPortalUrl, getSibaFaqUrl } from "./official-links";
import { isForeignGuestForSiba } from "./nationality";

export type SibaGuestRecord = {
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

export type SibaStayExport = {
  stayId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestLabel: string | null;
  guests: SibaGuestRecord[];
  phase: "arrival" | "departure";
};

const CSV_HEADERS = [
  "apelido",
  "nome",
  "sexo",
  "dataNascimento",
  "localNascimento",
  "nacionalidade",
  "tipoDocumento",
  "numeroDocumento",
  "dataEntrada",
  "dataSaida",
  "morada",
  "telefone",
  "email",
  "fase",
];

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function recordToCsvRow(record: SibaGuestRecord, phase: "arrival" | "departure"): string {
  const values = [
    record.lastName,
    record.firstNames,
    record.sex ?? "",
    format(record.dateOfBirth, "yyyy-MM-dd"),
    record.placeOfBirth,
    record.nationality,
    record.documentType ?? "",
    record.documentNumber ?? "",
    format(record.arrivalDate, "yyyy-MM-dd"),
    format(record.departureDate, "yyyy-MM-dd"),
    record.usualAddress,
    record.mobile,
    record.email,
    phase,
  ];
  return values.map(escapeCsv).join(",");
}

export function filterForeignGuestsForSiba<T extends { nationality: string }>(
  guests: T[]
): T[] {
  return guests.filter((g) => isForeignGuestForSiba(g.nationality));
}

export function buildSibaCsvExport(stay: SibaStayExport): string {
  const foreignGuests = filterForeignGuestsForSiba(stay.guests);
  const header =
    `# Glint Host Registry — SIBA Boletim de Alojamento export\n` +
    `# Stay: ${stay.stayId} · Phase: ${stay.phase} · Check-in: ${format(stay.checkInDate, "yyyy-MM-dd")}\n` +
    `# Manual portal entry — Glint does not submit to SIBA (SSI/UCFE)\n`;
  const rows = [
    CSV_HEADERS.join(","),
    ...foreignGuests.map((g) => recordToCsvRow(g, stay.phase)),
  ];
  return header + rows.join("\n");
}

export function validateStayForSibaExport(
  guests: SibaGuestRecord[]
): Array<{ guestId: string; field: string; message: { en: string; fr: string } }> {
  const errors: Array<{
    guestId: string;
    field: string;
    message: { en: string; fr: string };
  }> = [];

  const foreignGuests = filterForeignGuestsForSiba(guests);

  for (const guest of foreignGuests) {
    const validationErrors = validateCheckInForSiba({
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

type BoletimLabels = {
  title: string;
  deadlineNote: string;
  portalNote: string;
  phaseLabel: string;
  lastName: string;
  firstNames: string;
  sex: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
  address: string;
  mobile: string;
  email: string;
  arrivalDate: string;
  departureDate: string;
  footer: string;
  disclaimer: string;
};

export const SIBA_PRINT_STYLES = `
  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .subtitle { color: #64748b; margin-bottom: 24px; font-size: 14px; }
  .notice { background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 13px; }
  .disclaimer { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th, td { text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 14px; }
  th { background: #f8fafc; font-weight: 600; width: 35%; }
  .guest-block { page-break-after: always; margin-bottom: 32px; }
  .guest-block:last-child { page-break-after: auto; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
  @media print { body { margin: 0; } }
`;

export function renderSibaBoletimHtml(
  stay: SibaStayExport,
  property: { name: string; city: string },
  labels: BoletimLabels
): string {
  const portalUrl = getSibaPortalUrl();
  const faqUrl = getSibaFaqUrl();
  const foreignGuests = filterForeignGuestsForSiba(stay.guests);

  const guestBlocks = foreignGuests
    .map((record) => {
      const fields = [
        { label: labels.lastName, value: record.lastName },
        { label: labels.firstNames, value: record.firstNames },
        { label: labels.sex, value: record.sex ?? "—" },
        { label: labels.dateOfBirth, value: format(record.dateOfBirth, "dd/MM/yyyy") },
        { label: labels.placeOfBirth, value: record.placeOfBirth },
        { label: labels.nationality, value: record.nationality },
        { label: labels.documentType, value: record.documentType ?? "—" },
        { label: labels.documentNumber, value: record.documentNumber ?? "—" },
        { label: labels.address, value: record.usualAddress },
        { label: labels.mobile, value: record.mobile },
        { label: labels.email, value: record.email },
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
      ? labels.phaseLabel.replace("{phase}", "entrada")
      : labels.phaseLabel.replace("{phase}", "saída");

  return `
    <h1>${escapeHtml(labels.title)}</h1>
    <p class="subtitle">${escapeHtml(property.name)} — ${escapeHtml(property.city)} · SIBA · ${escapeHtml(phaseText)}</p>
    <div class="disclaimer">
      <p><strong>${escapeHtml(labels.disclaimer)}</strong></p>
    </div>
    <div class="notice">
      <p><strong>${escapeHtml(labels.deadlineNote)}</strong></p>
      <p>${escapeHtml(labels.portalNote)}</p>
      <p><a href="${escapeHtml(portalUrl)}">${escapeHtml(portalUrl)}</a></p>
      <p><a href="${escapeHtml(faqUrl)}">${escapeHtml(faqUrl)}</a></p>
    </div>
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
  record: SibaGuestRecord
): Array<{ key: string; value: string }> {
  return [
    { key: "apelido", value: record.lastName },
    { key: "nome", value: record.firstNames },
    { key: "numeroDocumento", value: record.documentNumber ?? "" },
    { key: "nacionalidade", value: record.nationality },
    { key: "dataEntrada", value: format(record.arrivalDate, "dd/MM/yyyy") },
    { key: "dataSaida", value: format(record.departureDate, "dd/MM/yyyy") },
  ].filter((f) => f.value);
}

export const SIBA_PHASE_NOTES = {
  arrival: "arrival",
  departure: "departure",
} as const;

export function getSibaPhaseFromNotes(notes: string | null | undefined): "arrival" | "departure" | null {
  if (notes === SIBA_PHASE_NOTES.arrival) return "arrival";
  if (notes === SIBA_PHASE_NOTES.departure) return "departure";
  return null;
}
