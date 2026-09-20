import { format } from "date-fns";
import { validateCheckInForAade } from "./check-in-validation";
import { getAadeShortTermHubUrl, getMyAadeUrl } from "./official-links";
import { getAadeDeclarationDeadline } from "./stay-duration";

export const AADE_SYSTEM = "aade_short_term";

export type AadeGuestRecord = {
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

export type AadeStayExport = {
  stayId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestLabel: string | null;
  guests: AadeGuestRecord[];
  amaNumber: string | null;
  propertyAddress: string;
  propertyCity: string;
};

const CSV_HEADERS = [
  "epwnymo",
  "onoma",
  "fylo",
  "hmeromhniaGennhshs",
  "toposGennhshs",
  "ethnikothta",
  "typosEggrafou",
  "arithmosEggrafou",
  "hmeromhniaAfyxhs",
  "hmeromhniaAnaxwrhshs",
  "dieuthynsh",
  "kinhto",
  "email",
  "ama",
];

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function recordToCsvRow(record: AadeGuestRecord, amaNumber: string | null): string {
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
    amaNumber ?? "",
  ];
  return values.map(escapeCsv).join(",");
}

export function buildAadeCsvExport(stay: AadeStayExport): string {
  const deadline = getAadeDeclarationDeadline(stay.checkOutDate);
  const header =
    `# Glint Host Registry — AADE Short-Term Stay Declaration export\n` +
    `# Stay: ${stay.stayId} · Check-in: ${format(stay.checkInDate, "yyyy-MM-dd")} · Check-out: ${format(stay.checkOutDate, "yyyy-MM-dd")}\n` +
    `# Declaration due by: ${format(deadline, "yyyy-MM-dd")} (20th of month after departure)\n` +
    `# Manual portal entry — Glint does not submit to AADE\n`;
  const rows = [
    CSV_HEADERS.join(","),
    ...stay.guests.map((g) => recordToCsvRow(g, stay.amaNumber)),
  ];
  return header + rows.join("\n");
}

export function validateStayForAadeExport(
  guests: AadeGuestRecord[]
): Array<{ guestId: string; field: string; message: { en: string; fr: string } }> {
  const errors: Array<{
    guestId: string;
    field: string;
    message: { en: string; fr: string };
  }> = [];

  for (const guest of guests) {
    const validationErrors = validateCheckInForAade({
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

type DeclarationLabels = {
  title: string;
  deadlineNote: string;
  portalNote: string;
  disclaimer: string;
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
  amaLabel: string;
  propertyLabel: string;
  footer: string;
};

export const AADE_PRINT_STYLES = `
  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .subtitle { color: #64748b; margin-bottom: 24px; font-size: 14px; }
  .notice { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 13px; }
  .disclaimer { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th, td { text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 14px; }
  th { background: #f8fafc; font-weight: 600; width: 35%; }
  .guest-block { page-break-after: always; margin-bottom: 32px; }
  .guest-block:last-child { page-break-after: auto; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
  @media print { body { margin: 0; } }
`;

export function renderAadeDeclarationHtml(
  stay: AadeStayExport,
  property: { name: string; city: string },
  labels: DeclarationLabels
): string {
  const hubUrl = getAadeShortTermHubUrl();
  const myAadeUrl = getMyAadeUrl();
  const deadline = getAadeDeclarationDeadline(stay.checkOutDate);

  const guestBlocks = stay.guests
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

  return `
    <h1>${escapeHtml(labels.title)}</h1>
    <p class="subtitle">${escapeHtml(property.name)} — ${escapeHtml(property.city)} · AADE · ${format(stay.checkInDate, "dd/MM/yyyy")} – ${format(stay.checkOutDate, "dd/MM/yyyy")}</p>
    <div class="disclaimer">
      <p><strong>${escapeHtml(labels.disclaimer)}</strong></p>
    </div>
    <div class="notice">
      <p><strong>${escapeHtml(labels.deadlineNote)}</strong> ${format(deadline, "dd/MM/yyyy")}</p>
      <p>${escapeHtml(labels.portalNote)}</p>
      <p><a href="${escapeHtml(hubUrl)}">${escapeHtml(hubUrl)}</a></p>
      <p><a href="${escapeHtml(myAadeUrl)}">${escapeHtml(myAadeUrl)}</a></p>
    </div>
    <table>
      <tbody>
        <tr><th>${escapeHtml(labels.amaLabel)}</th><td>${escapeHtml(stay.amaNumber ?? "—")}</td></tr>
        <tr><th>${escapeHtml(labels.propertyLabel)}</th><td>${escapeHtml(stay.propertyAddress)}, ${escapeHtml(stay.propertyCity)}</td></tr>
      </tbody>
    </table>
    ${stay.guestLabel ? `<p style="font-size:13px;color:#64748b;">${escapeHtml(stay.guestLabel)}</p>` : ""}
    ${guestBlocks}
    <div class="footer">
      <p>${escapeHtml(labels.footer)}</p>
      <p>Glint Host Registry — ${format(new Date(), "dd/MM/yyyy")}</p>
    </div>
  `;
}

export function getCopyFieldsForGuest(
  record: AadeGuestRecord,
  amaNumber: string | null
): Array<{ key: string; value: string }> {
  return [
    { key: "epwnymo", value: record.lastName },
    { key: "onoma", value: record.firstNames },
    { key: "arithmosEggrafou", value: record.documentNumber ?? "" },
    { key: "ethnikothta", value: record.nationality },
    { key: "hmeromhniaAfyxhs", value: format(record.arrivalDate, "dd/MM/yyyy") },
    { key: "hmeromhniaAnaxwrhshs", value: format(record.departureDate, "dd/MM/yyyy") },
    { key: "ama", value: amaNumber ?? "" },
  ].filter((f) => f.value);
}
