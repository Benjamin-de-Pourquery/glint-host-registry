export type GuestRecordSummary = {
  id: string;
  lastName: string;
  firstNames: string;
  nationality: string;
  arrivalDate: string;
  departureDate: string;
  isFrenchNational: boolean;
  requiresPoliceForm: boolean;
  signedAt: string | null;
  submittedAt: string | null;
  retentionExpiresAt: string | null;
};

export type GuestStaySummary = {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  expectsForeignGuest: boolean;
  guestLabel: string | null;
  notes: string | null;
  source: string;
  importStatus: string | null;
  hasMatchingFiche: boolean;
  guestCount: number;
  isMissingFiche: boolean;
  ficheDeadline: string;
};

export type GuestRegisterPanelData = {
  token: { enabled: boolean; token: string; createdAt: string } | null;
  records: GuestRecordSummary[];
  stays: GuestStaySummary[];
  guestsThisMonth: number;
  missingFichesCount: number;
};

function isRecordSummary(value: unknown): value is GuestRecordSummary {
  if (!value || typeof value !== "object") return false;
  const row = value as GuestRecordSummary;
  return typeof row.id === "string" && typeof row.lastName === "string";
}

function isStaySummary(value: unknown): value is GuestStaySummary {
  if (!value || typeof value !== "object") return false;
  const row = value as GuestStaySummary;
  return (
    typeof row.id === "string" &&
    typeof row.checkInDate === "string" &&
    typeof row.checkOutDate === "string"
  );
}

export function normalizeGuestRegisterPanelData(
  raw: unknown
): GuestRegisterPanelData | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Partial<GuestRegisterPanelData>;
  const records = Array.isArray(data.records)
    ? data.records.filter(isRecordSummary)
    : [];
  const stays = Array.isArray(data.stays) ? data.stays.filter(isStaySummary) : [];

  let token: GuestRegisterPanelData["token"] = null;
  if (data.token && typeof data.token === "object") {
    const t = data.token as GuestRegisterPanelData["token"];
    if (
      t &&
      typeof t.enabled === "boolean" &&
      typeof t.token === "string" &&
      typeof t.createdAt === "string"
    ) {
      token = t;
    }
  }

  return {
    token,
    records,
    stays,
    guestsThisMonth:
      typeof data.guestsThisMonth === "number" && Number.isFinite(data.guestsThisMonth)
        ? data.guestsThisMonth
        : 0,
    missingFichesCount:
      typeof data.missingFichesCount === "number" &&
      Number.isFinite(data.missingFichesCount)
        ? data.missingFichesCount
        : 0,
  };
}
