/** Official Italy compliance portals — manual submission only. */

export const BDSR_PORTAL_URL = "https://bdsr.ministeroturismo.gov.it/";
export const MINISTERO_TURISMO_URL = "https://www.ministeroturismo.gov.it/";
export const ALLOGGIATI_PORTAL_URL = "https://alloggiatiweb.poliziadistato.it/";
export const ALLOGGIATI_INFO_URL =
  "https://www.poliziadistato.it/articolo/alloggiati-web";
export const EU_1028_URL =
  "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1028";
export const ISTAT_ROSS1000_URL = "https://www.istat.it/";

export function getAlloggiatiPortalUrl(): string {
  return ALLOGGIATI_PORTAL_URL;
}

export function getAlloggiatiLoginUrl(): string {
  return ALLOGGIATI_PORTAL_URL;
}

export function getBdsrPortalUrl(): string {
  return BDSR_PORTAL_URL;
}
