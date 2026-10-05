/** EU Regulation 2024/1028 (official ELI). */
export const EU_1028_URL = "https://eur-lex.europa.eu/eli/reg/2024/1028/oj";

/** DETE / gov.ie press release (13 May 2026, updated 6 Aug 2026). */
export const GOV_IE_STL_REGISTER_PRESS_URL =
  "https://www.gov.ie/en/department-of-enterprise-tourism-and-employment/press-releases/short-term-let-register-to-come-into-effect-from-december-2026/";

/** DETE short-term letting explainer. */
export const DETE_STL_EXPLAINER_URL =
  "https://enterprise.gov.ie/en/what-we-do/trade-investment/tourism/short-term-letting/short-term-letting-in-ireland.html";

/** Fáilte Ireland national STL register (portal announced for 1 Dec 2026). */
export const FAILTE_STL_REGISTER_URL =
  "https://www.failteireland.ie/en/short-term-letting-register";

/** Fáilte Ireland STL register FAQ. */
export const FAILTE_STL_FAQ_URL =
  "https://www.failteireland.ie/en/short-term-letting-register/faq";

/** Citizens Information: short-term lets (planning Forms 15/16/17, edited 23 June 2026). */
export const CITIZENS_INFO_STL_URL =
  "https://www.citizensinformation.ie/en/housing/owning-a-home/home-owners/renting-your-property-for-shortterm-lets/";

export function getFailteStlRegisterUrl(): string {
  return FAILTE_STL_REGISTER_URL;
}

export function getCitizensInfoStlUrl(): string {
  return CITIZENS_INFO_STL_URL;
}
