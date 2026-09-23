export const EU_1028_URL =
  "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1028";

/** Brussels-Capital — prior declaration rules (verified HTTP 200). */
export const BRUSSELS_RULES_URL =
  "https://economy-employment.brussels/tourist-accommodation-rules-news";

/** Brussels private host declaration form (verified HTTP 200). */
export const BRUSSELS_PRIVATE_FORM_URL =
  "https://economy-employment.brussels/tourist-accommodation-private-form";

/** Brussels professional host declaration form (verified HTTP 200). */
export const BRUSSELS_PROFESSIONAL_FORM_URL =
  "https://economy-employment.brussels/tourist-accommodation-form";

/** Brussels tourist tax — fiscalité.brussels (verified HTTP 200 after redirect). */
export const BRUSSELS_TOURIST_TAX_URL = "https://fiscalite.brussels/tourist-tax";

/** Flanders — Logiesdecreet aanmelding (verified HTTP 200). */
export const FLANDERS_AANMELDING_URL =
  "https://toerismevlaanderen.be/nl/logies/aanmelding";

/** Wallonia — tourist accommodation business (verified HTTP 200). */
export const WALLONIA_TOURISM_URL =
  "https://www.wallonie.be/en/demarches/setting-and-running-tourist-accommodation-business";

/** Tourisme Wallonie portal (verified HTTP 200). */
export const TOURISME_WALLONIE_URL = "https://www.tourisme-wallonie.be/";

export function getBrusselsRulesUrl(): string {
  return BRUSSELS_RULES_URL;
}

export function getBrusselsFormUrl(operatorCategory: "private" | "professional"): string {
  return operatorCategory === "professional"
    ? BRUSSELS_PROFESSIONAL_FORM_URL
    : BRUSSELS_PRIVATE_FORM_URL;
}

export function getFlandersAanmeldingUrl(): string {
  return FLANDERS_AANMELDING_URL;
}

export function getWalloniaTourismUrl(): string {
  return WALLONIA_TOURISM_URL;
}

export function getTourismeWallonieUrl(): string {
  return TOURISME_WALLONIE_URL;
}
