export const EU_1028_URL =
  "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1028";

/** City of Vienna press release on WKVRG plans (verified HTTP 200, Sep 2026). */
export const VIENNA_WKVRG_OTS_URL =
  "https://www.ots.at/presseaussendung/OTS_20260919_OTS0027/buergermeister-ludwig-wien-ist-vorbild-beim-schutz-von-leistbaren-wohnungen-fuer-die-bevoelkerung";

/** Stadt Wien — EU Regulation 2024/1028 policy page (verified HTTP 200). */
export const VIENNA_EU_STR_POLICY_URL =
  "https://www.wien.gv.at/politik/eu-politik-kurzfristige-vermietung";

export function getViennaWkvgrAnnouncementUrl(): string {
  return VIENNA_WKVRG_OTS_URL;
}

export function getViennaEuStrPolicyUrl(): string {
  return VIENNA_EU_STR_POLICY_URL;
}

export function getEu1028Url(): string {
  return EU_1028_URL;
}
