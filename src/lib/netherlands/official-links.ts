export const EU_1028_URL =
  "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1028";

export const RIJKSOVERHEID_TOURIST_RENTAL_URL =
  "https://www.rijksoverheid.nl/themas/bouwen-en-wonen/woning-verhuren/woningverhuur-toeristen";

export const NATIONAL_REGISTRATION_PORTAL_URL =
  "https://www.registratietoeristischeverhuur.nl/";

export const AMSTERDAM_HOLIDAY_RENTALS_URL =
  "https://www.amsterdam.nl/en/housing/holiday-rentals/";

export const AMSTERDAM_HOLIDAY_RENTAL_PERMIT_URL =
  "https://www.amsterdam.nl/en/housing/holiday-rentals/holiday-rental-permit/";

export const AMSTERDAM_REPORTING_HOLIDAY_RENTALS_URL =
  "https://www.amsterdam.nl/en/housing/holiday-rentals/reporting-holiday-rentals/";

export const AMSTERDAM_TOURIST_TAX_URL =
  "https://www.amsterdam.nl/en/municipal-taxes/tourist-tax/";

/** Amsterdam registration and per-stay reporting (linked from amsterdam.nl holiday rentals). */
export const AMSTERDAM_TOERISTISCHEVERHUUR_PORTAL_URL =
  "https://www.toeristischeverhuur.nl/";

/** @deprecated Use AMSTERDAM_HOLIDAY_RENTALS_URL; kept for deep links that still resolve. */
export const AMSTERDAM_HOME_SHARING_URL =
  "https://www.amsterdam.nl/en/housing/rent-out/home-sharing/";

/** @deprecated Use AMSTERDAM_TOERISTISCHEVERHUUR_PORTAL_URL for stay reporting. */
export const AMSTERDAM_STAY_NOTIFICATION_URL =
  "https://www.amsterdam.nl/en/housing/rent-out/home-sharing/notify-stay/";

export const ROTTERDAM_TOURIST_RENTAL_URL =
  "https://www.rotterdam.nl/wonen-leven/toeristische-verhuur/";

export const DEN_HAAG_TOURIST_RENTAL_URL =
  "https://www.denhaag.nl/nl/ondernemen/toeristische-verhuur.htm";

export const UTRECHT_TOURIST_RENTAL_URL =
  "https://www.utrecht.nl/wonen-en-leven/toeristische-verhuur/";

export function getStayNotificationPortalUrl(city: string): string {
  const normalized = city.trim().toLowerCase();
  if (normalized === "amsterdam" || normalized === "ams") {
    return AMSTERDAM_TOERISTISCHEVERHUUR_PORTAL_URL;
  }
  if (normalized === "rotterdam") {
    return ROTTERDAM_TOURIST_RENTAL_URL;
  }
  if (
    normalized === "den haag" ||
    normalized === "the hague" ||
    normalized === "'s-gravenhage" ||
    normalized === "s-gravenhage"
  ) {
    return DEN_HAAG_TOURIST_RENTAL_URL;
  }
  if (normalized === "utrecht") {
    return UTRECHT_TOURIST_RENTAL_URL;
  }
  return NATIONAL_REGISTRATION_PORTAL_URL;
}

export function getNationalRegistrationPortalUrl(): string {
  return NATIONAL_REGISTRATION_PORTAL_URL;
}
