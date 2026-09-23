export const RECONCILIATION_FINDING_CODES = [
  "UNDECLARED_NIGHTS",
  "GUEST_REPORT_MISSING",
  "GUEST_COUNT_MISMATCH",
  "CAP_EXCEEDED_CROSS_CHANNEL",
  "WRONG_KEY_ON_CHANNEL",
  "ORPHAN_PLATFORM_RESERVATION",
  "DAC7_DAYS_MISMATCH",
] as const;

export type ReconciliationFindingCode = (typeof RECONCILIATION_FINDING_CODES)[number];

export const RECONCILIATION_SEVERITIES = ["to_check", "likely_issue"] as const;
export type ReconciliationSeverity = (typeof RECONCILIATION_SEVERITIES)[number];

export const PLATFORM_CHANNELS = ["AIRBNB", "BOOKING", "VRBO", "DIRECT", "OTHER", "GENERIC"] as const;
export type PlatformChannel = (typeof PLATFORM_CHANNELS)[number];

export type ParsedPlatformReservation = {
  externalRef: string;
  listingRef?: string | null;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests?: number | null;
  status: string;
  grossAmountCents?: number | null;
};

export type ColumnMapping = {
  externalRef?: string;
  listingRef?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: string;
  guests?: string;
  status?: string;
  grossAmount?: string;
};

export type ReconcileStayInput = {
  id: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  channel: string;
  source: string;
  guestRecordCount: number;
  hasGuestReport: boolean;
  importStatus?: string | null;
  expectsForeignGuest: boolean;
};

export type ReconcilePlatformReservationInput = {
  id: string;
  channel: string;
  externalRef?: string | null;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests?: number | null;
  status: string;
  matchedStayId?: string | null;
};

export type ReconcileChannelRegistration = {
  channel: string;
  displayedRegistrationNumber: string | null;
};

export type ReconcileDeclaredInput = {
  touristTaxNightsTotal: number | null;
  guestReportsFiled: number;
  guestReportsExpected: number;
  nightCapUsed: number;
  nightCapLimit: number | null;
  nightCapExceeded: boolean;
  primaryRegistrationNumber: string | null;
  channelRegistrations: ReconcileChannelRegistration[];
  dac7DaysRented: number | null;
  dac7ImportedDays: number | null;
};

export type ReconcileInput = {
  propertyId: string;
  periodStart: Date;
  periodEnd: Date;
  stays: ReconcileStayInput[];
  platformReservations: ReconcilePlatformReservationInput[];
  declared: ReconcileDeclaredInput;
};

export type ReconciliationFindingResult = {
  code: ReconciliationFindingCode;
  severity: ReconciliationSeverity;
  expected: Record<string, unknown>;
  observed: Record<string, unknown>;
  sourceRefs: string[];
};

export type LedgerChannelRow = {
  channel: string;
  platformNights: number;
  platformReservations: number;
  declaredTouristTaxNights: number | null;
  guestReportsFiled: number;
  registrationKeyDisplayed: string | null;
};

export type AuthorityMirrorLedger = {
  periodStart: string;
  periodEnd: string;
  channels: LedgerChannelRow[];
  nightCapUsed: number;
  nightCapLimit: number | null;
  touristTaxNightsDeclared: number | null;
  openFindingsCount: number;
};
