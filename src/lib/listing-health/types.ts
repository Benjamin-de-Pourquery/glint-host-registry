export const LISTING_HEALTH_SCORES = ["GREEN", "ORANGE", "RED"] as const;
export type ListingHealthScore = (typeof LISTING_HEALTH_SCORES)[number];

export const LISTING_HEALTH_FACTOR_CODES = [
  "setup_incomplete",
  "missing_registration",
  "expiry_passed",
  "expiry_within_7",
  "expiry_within_14",
  "expiry_within_30",
  "no_listing_urls",
  "channel_number_mismatch",
  "guest_due_critical",
  "guest_due_warning",
  "night_cap_exceeded",
  "night_cap_warning",
] as const;

export type ListingHealthFactorCode = (typeof LISTING_HEALTH_FACTOR_CODES)[number];

export type ListingHealthFactorSeverity = "blocking" | "warning";

export type ListingHealthFactor = {
  code: ListingHealthFactorCode;
  severity: ListingHealthFactorSeverity;
  messageKey: string;
  href: string;
  meta?: Record<string, string | number>;
};

export type ListingHealthChannelInput = {
  channel: string;
  listingUrl: string;
  displayedRegistrationNumber: string | null;
};

export type ListingHealthComputeInput = {
  propertyId: string;
  locale: string;
  registrationRequired: boolean;
  primaryRegistrationNumber: string | null;
  expiryDate: Date | null;
  channels: ListingHealthChannelInput[];
  guestDueCriticalCount: number;
  guestDueWarningCount: number;
  nightCapPercentUsed: number | null;
  nightCapExceeded: boolean;
  now?: Date;
};

export type ListingHealthResult = {
  score: ListingHealthScore;
  factors: ListingHealthFactor[];
  isActivated: boolean;
  computedAt: Date;
};

export type ListingHealthSnapshotRecord = {
  id: string;
  propertyId: string;
  score: ListingHealthScore;
  factors: ListingHealthFactor[];
  isActivated: boolean;
  computedAt: string;
};
