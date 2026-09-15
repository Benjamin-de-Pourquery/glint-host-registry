import { format } from "date-fns";
import { parseAccompanyingChildren } from "@/lib/guest-register";
import { validateCheckInForSes } from "@/lib/ses/check-in-validation";
import type { SpainGuestReportingMode } from "./regions";
import { getRegionalSystemLabel } from "./regions";
import { getOfficialPortalUrl } from "./official-links";

export type RegionalGuestRecord = {
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
  documentSupport: string | null;
  sex: string | null;
  kinship: string | null;
  postalCode: string | null;
  municipalityCode: string | null;
  municipalityName: string | null;
  addressCountryAlpha3: string | null;
  accompanyingChildrenJson: string | null;
};

export type RegionalStayExport = {
  stayId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestLabel: string | null;
  guests: RegionalGuestRecord[];
};

const CSV_HEADERS = [
  "lastName",
  "firstNames",
  "dateOfBirth",
  "placeOfBirth",
  "nationality",
  "documentType",
  "documentNumber",
  "documentSupport",
  "sex",
  "usualAddress",
  "postalCode",
  "municipalityCode",
  "municipalityName",
  "addressCountryAlpha3",
  "mobile",
  "email",
  "arrivalDate",
  "departureDate",
  "kinship",
];

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function recordToCsvRow(record: RegionalGuestRecord): string {
  const values = [
    record.lastName,
    record.firstNames,
    format(record.dateOfBirth, "yyyy-MM-dd"),
    record.placeOfBirth,
    record.nationality,
    record.documentType ?? "",
    record.documentNumber ?? "",
    record.documentSupport ?? "",
    record.sex ?? "",
    record.usualAddress,
    record.postalCode ?? "",
    record.municipalityCode ?? "",
    record.municipalityName ?? "",
    record.addressCountryAlpha3 ?? "",
    record.mobile,
    record.email,
    format(record.arrivalDate, "yyyy-MM-dd"),
    format(record.departureDate, "yyyy-MM-dd"),
    record.kinship ?? "",
  ];
  return values.map(escapeCsv).join(",");
}

export function buildRegionalCsvExport(
  stay: RegionalStayExport,
  system: SpainGuestReportingMode
): string {
  const header = `# Glint Host Registry — ${getRegionalSystemLabel(system)} Annex I export\n# Stay: ${stay.stayId} · Check-in: ${format(stay.checkInDate, "yyyy-MM-dd")}\n# Manual portal entry — Glint does not submit to ${getRegionalSystemLabel(system)}\n`;
  const rows = [CSV_HEADERS.join(","), ...stay.guests.map(recordToCsvRow)];
  return header + rows.join("\n");
}

export function validateStayForRegionalExport(
  guests: RegionalGuestRecord[]
): Array<{ guestId: string; field: string; message: { en: string; fr: string } }> {
  const errors: Array<{
    guestId: string;
    field: string;
    message: { en: string; fr: string };
  }> = [];

  for (const guest of guests) {
    const validationErrors = validateCheckInForSes({
      lastName: guest.lastName,
      firstNames: guest.firstNames,
      dateOfBirth: format(guest.dateOfBirth, "yyyy-MM-dd"),
      nationality: guest.nationality,
      usualAddress: guest.usualAddress,
      mobile: guest.mobile,
      email: guest.email,
      arrivalDate: format(guest.arrivalDate, "yyyy-MM-dd"),
      departureDate: format(guest.departureDate, "yyyy-MM-dd"),
      documentType: guest.documentType ?? undefined,
      documentNumber: guest.documentNumber ?? undefined,
      documentSupport: guest.documentSupport ?? undefined,
      sex: guest.sex ?? undefined,
      kinship: guest.kinship ?? undefined,
      postalCode: guest.postalCode ?? undefined,
      municipalityCode: guest.municipalityCode ?? undefined,
      municipalityName: guest.municipalityName ?? undefined,
      addressCountryAlpha3: guest.addressCountryAlpha3 ?? undefined,
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

type FitxaLabels = {
  title: string;
  systemLabel: string;
  deadlineNote: string;
  portalNote: string;
  lastName: string;
  firstNames: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
  documentSupport: string;
  sex: string;
  address: string;
  postalCode: string;
  municipality: string;
  country: string;
  mobile: string;
  email: string;
  arrivalDate: string;
  departureDate: string;
  childrenTitle: string;
  footer: string;
};

export const REGIONAL_FITXA_PRINT_STYLES = `
  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .subtitle { color: #64748b; margin-bottom: 24px; font-size: 14px; }
  .notice { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th, td { text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 14px; }
  th { background: #f8fafc; font-weight: 600; width: 35%; }
  .guest-block { page-break-after: always; margin-bottom: 32px; }
  .guest-block:last-child { page-break-after: auto; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
  @media print { body { margin: 0; } }
`;

export function renderRegionalFitxaHtml(
  stay: RegionalStayExport,
  property: { name: string; city: string },
  system: SpainGuestReportingMode,
  labels: FitxaLabels
): string {
  const portalUrl = getOfficialPortalUrl(system) ?? "";
  const guestBlocks = stay.guests
    .map((record) => {
      const children = parseAccompanyingChildren(record.accompanyingChildrenJson);
      const fields = [
        { label: labels.lastName, value: record.lastName },
        { label: labels.firstNames, value: record.firstNames },
        { label: labels.dateOfBirth, value: format(record.dateOfBirth, "dd/MM/yyyy") },
        { label: labels.placeOfBirth, value: record.placeOfBirth },
        { label: labels.nationality, value: record.nationality },
        { label: labels.documentType, value: record.documentType ?? "—" },
        { label: labels.documentNumber, value: record.documentNumber ?? "—" },
        { label: labels.documentSupport, value: record.documentSupport ?? "—" },
        { label: labels.sex, value: record.sex ?? "—" },
        { label: labels.address, value: record.usualAddress },
        { label: labels.postalCode, value: record.postalCode ?? "—" },
        { label: labels.municipality, value: record.municipalityCode || record.municipalityName || "—" },
        { label: labels.country, value: record.addressCountryAlpha3 ?? "—" },
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

      const childrenBlock =
        children.length > 0
          ? `<h3 style="font-size:14px;margin-top:16px;">${escapeHtml(labels.childrenTitle)}</h3>
             <table><tbody>${children
               .map(
                 (c) =>
                   `<tr><td>${escapeHtml(c.firstNames)}</td><td>${escapeHtml(c.dateOfBirth)}</td></tr>`
               )
               .join("")}</tbody></table>`
          : "";

      return `
        <div class="guest-block">
          <h2 style="font-size:16px;">${escapeHtml(record.lastName)}, ${escapeHtml(record.firstNames)}</h2>
          <table><tbody>${rows}</tbody></table>
          ${childrenBlock}
        </div>
      `;
    })
    .join("");

  return `
    <h1>${escapeHtml(labels.title)}</h1>
    <p class="subtitle">${escapeHtml(property.name)} — ${escapeHtml(property.city)} · ${escapeHtml(labels.systemLabel)}</p>
    <div class="notice">
      <p><strong>${escapeHtml(labels.deadlineNote)}</strong></p>
      <p>${escapeHtml(labels.portalNote)}</p>
      ${portalUrl ? `<p><a href="${escapeHtml(portalUrl)}">${escapeHtml(portalUrl)}</a></p>` : ""}
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

export function getCopyFieldsForGuest(record: RegionalGuestRecord): Array<{ key: string; value: string }> {
  return [
    { key: "lastName", value: record.lastName },
    { key: "firstNames", value: record.firstNames },
    { key: "documentNumber", value: record.documentNumber ?? "" },
    { key: "nationality", value: record.nationality },
    { key: "postalCode", value: record.postalCode ?? "" },
    { key: "municipalityCode", value: record.municipalityCode ?? "" },
  ].filter((f) => f.value);
}
