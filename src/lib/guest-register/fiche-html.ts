import { format } from "date-fns";
import { parseAccompanyingChildren } from "@/lib/guest-register";

export type FicheRecord = {
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
  signatureDataUrl: string | null;
  signedAt: Date | null;
  accompanyingChildrenJson: string | null;
};

export type FicheProperty = {
  name: string;
  city: string;
};

type FicheLabels = {
  title: string;
  lastName: string;
  firstNames: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  usualAddress: string;
  mobile: string;
  email: string;
  arrivalDate: string;
  departureDate: string;
  childrenTitle: string;
  childFirstNames: string;
  childDateOfBirth: string;
  signature: string;
  retention: string;
};

export const FICHE_PRINT_STYLES = `
  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .subtitle { color: #64748b; margin-bottom: 24px; font-size: 14px; }
  .bilingual { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; margin-bottom: 24px; font-size: 12px; color: #64748b; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th, td { text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 14px; }
  th { background: #f8fafc; font-weight: 600; width: 35%; }
  .signature { margin-top: 24px; border: 1px solid #e2e8f0; padding: 12px; }
  .signature img { max-height: 80px; }
  .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
  .fiche-page { page-break-after: always; }
  .fiche-page:last-child { page-break-after: auto; }
  .pack-header { margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; }
  .pack-header h1 { font-size: 24px; }
  @media print {
    body { margin: 0; }
    .no-print { display: none; }
  }
`;

export function renderFicheHtml(
  record: FicheRecord,
  property: FicheProperty,
  labels: FicheLabels,
  options?: { pageClass?: string }
): string {
  const children = parseAccompanyingChildren(record.accompanyingChildrenJson);
  const pageClass = options?.pageClass ?? "fiche-page";

  const fields = [
    { label: labels.lastName, value: record.lastName },
    { label: labels.firstNames, value: record.firstNames },
    { label: labels.dateOfBirth, value: format(record.dateOfBirth, "dd/MM/yyyy") },
    { label: labels.placeOfBirth, value: record.placeOfBirth },
    { label: labels.nationality, value: record.nationality },
    { label: labels.usualAddress, value: record.usualAddress },
    { label: labels.mobile, value: record.mobile },
    { label: labels.email, value: record.email },
    { label: labels.arrivalDate, value: format(record.arrivalDate, "dd/MM/yyyy") },
    { label: labels.departureDate, value: format(record.departureDate, "dd/MM/yyyy") },
  ];

  const childrenTable =
    children.length > 0
      ? `
        <h2 style="font-size: 14px; margin-top: 24px;">${labels.childrenTitle}</h2>
        <table>
          <thead>
            <tr>
              <th>${labels.childFirstNames}</th>
              <th>${labels.childDateOfBirth}</th>
            </tr>
          </thead>
          <tbody>
            ${children
              .map(
                (child) =>
                  `<tr><td>${escapeHtml(child.firstNames)}</td><td>${escapeHtml(child.dateOfBirth)}</td></tr>`
              )
              .join("")}
          </tbody>
        </table>
      `
      : "";

  const signatureBlock = record.signatureDataUrl
    ? `
      <div class="signature">
        <p style="font-size: 12px; font-weight: 600; margin-bottom: 8px;">
          ${labels.signature} / Signature
        </p>
        <img src="${record.signatureDataUrl}" alt="Signature" />
        ${
          record.signedAt
            ? `<p style="font-size: 11px; color: #64748b; margin-top: 8px;">${format(record.signedAt, "dd/MM/yyyy HH:mm")}</p>`
            : ""
        }
      </div>
    `
    : "";

  const rows = fields
    .map(
      (f) =>
        `<tr><th>${escapeHtml(f.label)}</th><td>${escapeHtml(f.value)}</td></tr>`
    )
    .join("");

  return `
    <div class="${pageClass}">
      <h1>${escapeHtml(labels.title)}</h1>
      <p class="subtitle">${escapeHtml(property.name)} — ${escapeHtml(property.city)}</p>
      <div class="bilingual">
        <span>Fiche individuelle de police — Article R. 814-1 du CESEDA</span>
        <span>Individual police form — CESEDA Article R. 814-1</span>
      </div>
      <table><tbody>${rows}</tbody></table>
      ${childrenTable}
      ${signatureBlock}
      <div class="footer">
        <p>${escapeHtml(labels.retention)}</p>
        <p>Glint Host Registry — ${format(new Date(), "dd/MM/yyyy")}</p>
      </div>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
