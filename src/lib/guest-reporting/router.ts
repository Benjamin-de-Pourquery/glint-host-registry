import {
  getSpainGuestReportingMode,
  isSpainCountry,
  type SpainGuestReportingMode,
} from "@/lib/spain/regions";
import {
  getItalyGuestReportingMode,
  isItalyCountry,
  type ItalyGuestReportingMode,
} from "@/lib/italy/regions";
import {
  getPortugalGuestReportingMode,
  isPortugalCountry,
  type PortugalGuestReportingMode,
} from "@/lib/portugal/regions";
import {
  getGreeceGuestReportingMode,
  isGreeceCountry,
  type GreeceGuestReportingMode,
} from "@/lib/greece/regions";

export type GuestReportingJurisdiction =
  | "france"
  | "spain_ses"
  | "spain_mossos"
  | "spain_ertzaintza"
  | "italy_alloggiati"
  | "portugal_siba"
  | "greece_aade"
  | "none";

export function getGuestReportingJurisdiction(
  country: string,
  city: string,
  region?: string | null
): GuestReportingJurisdiction {
  if (isItalyCountry(country)) {
    const mode = getItalyGuestReportingMode(city, region);
    return mode === "alloggiati" ? "italy_alloggiati" : "none";
  }

  if (isSpainCountry(country)) {
    const mode = getSpainGuestReportingMode(city, region);
    switch (mode) {
      case "ses":
        return "spain_ses";
      case "mossos":
        return "spain_mossos";
      case "ertzaintza":
        return "spain_ertzaintza";
      default:
        return "none";
    }
  }

  if (isPortugalCountry(country)) {
    const mode = getPortugalGuestReportingMode(city, region);
    return mode === "siba" ? "portugal_siba" : "none";
  }

  if (isGreeceCountry(country)) {
    const mode = getGreeceGuestReportingMode(country, city, region);
    return mode === "aade" ? "greece_aade" : "none";
  }

  if (country.trim()) {
    const c = country.trim().toLowerCase();
    if (c === "france" || c === "fr" || c === "frança") {
      return "france";
    }
  }

  return "none";
}

/** Whether extended guest check-in fields (document, sex, etc.) are required. */
export function requiresExtendedGuestCheckIn(
  country: string,
  city: string,
  region?: string | null
): boolean {
  const jurisdiction = getGuestReportingJurisdiction(country, city, region);
  return (
    jurisdiction === "spain_ses" ||
    jurisdiction === "spain_mossos" ||
    jurisdiction === "spain_ertzaintza" ||
    jurisdiction === "italy_alloggiati" ||
    jurisdiction === "portugal_siba" ||
    jurisdiction === "greece_aade"
  );
}

export function getSpainModeFromJurisdiction(
  jurisdiction: GuestReportingJurisdiction
): SpainGuestReportingMode | null {
  switch (jurisdiction) {
    case "spain_ses":
      return "ses";
    case "spain_mossos":
      return "mossos";
    case "spain_ertzaintza":
      return "ertzaintza";
    default:
      return null;
  }
}

export function getItalyModeFromJurisdiction(
  jurisdiction: GuestReportingJurisdiction
): ItalyGuestReportingMode | null {
  return jurisdiction === "italy_alloggiati" ? "alloggiati" : null;
}

export function getPortugalModeFromJurisdiction(
  jurisdiction: GuestReportingJurisdiction
): PortugalGuestReportingMode | null {
  return jurisdiction === "portugal_siba" ? "siba" : null;
}

export function getGreeceModeFromJurisdiction(
  jurisdiction: GuestReportingJurisdiction
): GreeceGuestReportingMode | null {
  return jurisdiction === "greece_aade" ? "aade" : null;
}
