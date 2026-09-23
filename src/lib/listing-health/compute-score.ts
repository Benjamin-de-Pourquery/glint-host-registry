import { differenceInCalendarDays, isPast, startOfDay } from "date-fns";
import type {
  ListingHealthComputeInput,
  ListingHealthFactor,
  ListingHealthFactorCode,
  ListingHealthResult,
  ListingHealthScore,
} from "./types";

const NIGHT_CAP_WARNING_PERCENT = 80;

function normalizeRegistrationNumber(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]/g, "");
}

function buildHref(locale: string, propertyId: string, tab: string): string {
  return `/${locale}/app/properties/${propertyId}?tab=${tab}`;
}

function factor(
  code: ListingHealthFactorCode,
  severity: ListingHealthFactor["severity"],
  messageKey: string,
  href: string,
  meta?: ListingHealthFactor["meta"]
): ListingHealthFactor {
  return { code, severity, messageKey, href, meta };
}

function resolveScore(factors: ListingHealthFactor[]): ListingHealthScore {
  if (factors.some((f) => f.severity === "blocking")) return "RED";
  if (factors.some((f) => f.severity === "warning")) return "ORANGE";
  return "GREEN";
}

export function computeScore(input: ListingHealthComputeInput): ListingHealthResult {
  const now = input.now ?? new Date();
  const factors: ListingHealthFactor[] = [];
  const locale = input.locale;
  const propertyId = input.propertyId;

  const activeChannels = input.channels.filter((c) => c.listingUrl.trim());
  const hasListingUrls = activeChannels.length > 0;
  const hasRegistration = Boolean(input.primaryRegistrationNumber?.trim());
  const isActivated = hasRegistration && hasListingUrls;

  if (!hasRegistration && !hasListingUrls) {
    factors.push(
      factor(
        "setup_incomplete",
        "warning",
        "factors.setupIncomplete",
        buildHref(locale, propertyId, "listings")
      )
    );
  }

  if (input.registrationRequired && !hasRegistration) {
    factors.push(
      factor(
        "missing_registration",
        "blocking",
        "factors.missingRegistration",
        buildHref(locale, propertyId, "compliance")
      )
    );
  }

  if (input.expiryDate) {
    const expiry = startOfDay(input.expiryDate);
    const daysLeft = differenceInCalendarDays(expiry, startOfDay(now));

    if (isPast(expiry) && !isSameDay(expiry, now)) {
      factors.push(
        factor(
          "expiry_passed",
          "blocking",
          "factors.expiryPassed",
          buildHref(locale, propertyId, "compliance"),
          { daysOverdue: Math.abs(daysLeft) }
        )
      );
    } else if (daysLeft <= 7) {
      factors.push(
        factor(
          "expiry_within_7",
          "warning",
          "factors.expiryWithin7",
          buildHref(locale, propertyId, "compliance"),
          { daysLeft }
        )
      );
    } else if (daysLeft <= 14) {
      factors.push(
        factor(
          "expiry_within_14",
          "warning",
          "factors.expiryWithin14",
          buildHref(locale, propertyId, "compliance"),
          { daysLeft }
        )
      );
    } else if (daysLeft <= 30) {
      factors.push(
        factor(
          "expiry_within_30",
          "warning",
          "factors.expiryWithin30",
          buildHref(locale, propertyId, "compliance"),
          { daysLeft }
        )
      );
    }
  }

  if (hasRegistration && !hasListingUrls) {
    factors.push(
      factor(
        "no_listing_urls",
        "warning",
        "factors.noListingUrls",
        buildHref(locale, propertyId, "listings")
      )
    );
  }

  const displayedNumbers = activeChannels
    .map((c) => c.displayedRegistrationNumber?.trim())
    .filter((n): n is string => Boolean(n));

  if (displayedNumbers.length >= 2) {
    const normalized = new Set(displayedNumbers.map(normalizeRegistrationNumber));
    if (normalized.size > 1) {
      factors.push(
        factor(
          "channel_number_mismatch",
          "warning",
          "factors.channelNumberMismatch",
          buildHref(locale, propertyId, "listings"),
          { channelCount: normalized.size }
        )
      );
    }
  }

  if (hasRegistration && displayedNumbers.length > 0) {
    const primary = normalizeRegistrationNumber(input.primaryRegistrationNumber!);
    const mismatched = displayedNumbers.some(
      (n) => normalizeRegistrationNumber(n) !== primary
    );
    if (mismatched) {
      const alreadyFlagged = factors.some((f) => f.code === "channel_number_mismatch");
      if (!alreadyFlagged) {
        factors.push(
          factor(
            "channel_number_mismatch",
            "warning",
            "factors.channelNumberMismatchPrimary",
            buildHref(locale, propertyId, "listings")
          )
        );
      }
    }
  }

  if (input.guestDueCriticalCount > 0) {
    factors.push(
      factor(
        "guest_due_critical",
        "blocking",
        "factors.guestDueCritical",
        buildHref(locale, propertyId, "register"),
        { count: input.guestDueCriticalCount }
      )
    );
  } else if (input.guestDueWarningCount > 0) {
    factors.push(
      factor(
        "guest_due_warning",
        "warning",
        "factors.guestDueWarning",
        buildHref(locale, propertyId, "register"),
        { count: input.guestDueWarningCount }
      )
    );
  }

  if (input.nightCapExceeded) {
    factors.push(
      factor(
        "night_cap_exceeded",
        "blocking",
        "factors.nightCapExceeded",
        buildHref(locale, propertyId, "overview"),
        input.nightCapPercentUsed != null
          ? { percentUsed: input.nightCapPercentUsed }
          : undefined
      )
    );
  } else if (
    input.nightCapPercentUsed != null &&
    input.nightCapPercentUsed >= NIGHT_CAP_WARNING_PERCENT
  ) {
    factors.push(
      factor(
        "night_cap_warning",
        "warning",
        "factors.nightCapWarning",
        buildHref(locale, propertyId, "overview"),
        { percentUsed: input.nightCapPercentUsed }
      )
    );
  }

  if (input.capGuardEnabled && input.capGuardCritical) {
    factors.push(
      factor(
        "cap_guard_critical",
        "warning",
        "factors.capGuardCritical",
        buildHref(locale, propertyId, "overview"),
        input.nightCapPercentUsed != null
          ? { percentUsed: input.nightCapPercentUsed }
          : undefined
      )
    );
  }

  const score = resolveScore(factors);

  return {
    score,
    factors,
    isActivated,
    computedAt: now,
  };
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function isListingHealthAtRisk(score: ListingHealthScore): boolean {
  return score === "ORANGE" || score === "RED";
}
