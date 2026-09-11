import { differenceInDays, isPast } from "date-fns";

export type ComplianceStatus =
  | "ready"
  | "action_needed"
  | "expired"
  | "not_started";

export type PortfolioStatusFilter = ComplianceStatus | "all";

export const PORTFOLIO_STATUS_FILTERS: PortfolioStatusFilter[] = [
  "all",
  "action_needed",
  "expired",
  "ready",
  "not_started",
];

export function parsePortfolioStatusFilter(
  param?: string
): PortfolioStatusFilter | null {
  if (!param || param === "all") {
    return null;
  }
  if (PORTFOLIO_STATUS_FILTERS.includes(param as PortfolioStatusFilter)) {
    return param as PortfolioStatusFilter;
  }
  return null;
}

export function propertiesListHref(
  locale: string,
  options?: { status?: PortfolioStatusFilter | null; tab?: "archived" }
): string {
  const params = new URLSearchParams();
  if (options?.tab === "archived") {
    params.set("tab", "archived");
  } else if (options?.status && options.status !== "all") {
    params.set("status", options.status);
  }
  const query = params.toString();
  return `/${locale}/app/properties${query ? `?${query}` : ""}`;
}

export interface ComplianceInput {
  registrationNumber?: string | null;
  status?: string | null;
  expiryDate?: Date | null;
  checklistCompleted?: number;
  checklistTotal?: number;
}

export function getComplianceStatus(input: ComplianceInput): ComplianceStatus {
  const { registrationNumber, status, expiryDate, checklistCompleted = 0, checklistTotal = 0 } = input;

  if (!registrationNumber && status === "not_started") {
    return "not_started";
  }

  if (expiryDate && isPast(expiryDate)) {
    return "expired";
  }

  const hasNumber = Boolean(registrationNumber?.trim());
  const checklistDone =
    checklistTotal === 0 || checklistCompleted >= checklistTotal;
  const isActive = status === "active" && hasNumber && checklistDone;

  if (isActive) {
    if (expiryDate) {
      const days = differenceInDays(expiryDate, new Date());
      if (days <= 30) {
        return "action_needed";
      }
    }
    return "ready";
  }

  if (status === "pending" || !hasNumber || !checklistDone) {
    return "action_needed";
  }

  if (expiryDate && !isPast(expiryDate)) {
    const days = differenceInDays(expiryDate, new Date());
    if (days <= 30) {
      return "action_needed";
    }
  }

  return "action_needed";
}

export function getDaysUntilExpiry(expiryDate: Date | null | undefined): number | null {
  if (!expiryDate) return null;
  return differenceInDays(expiryDate, new Date());
}

/** Short hint for compact property rows — translation keys under properties.list.nextAction */
export function getComplianceNextActionKey(status: ComplianceStatus): string {
  return status;
}

export const DEFAULT_CHECKLIST_EN = [
  "Obtain municipal registration number",
  "Declare property to local tax authority",
  "Verify maximum rental nights allowed",
  "Register with national STR database (if required)",
  "Prepare guest data retention policy",
  "Update platform listing with registration number",
];

export const DEFAULT_CHECKLIST_FR = [
  "Obtenir le numéro d'enregistrement municipal",
  "Déclarer le bien à l'administration fiscale locale",
  "Vérifier le nombre maximum de nuitées autorisées",
  "Enregistrer dans la base nationale de location (si requis)",
  "Préparer la politique de conservation des données voyageurs",
  "Mettre à jour l'annonce plateforme avec le numéro d'enregistrement",
];
