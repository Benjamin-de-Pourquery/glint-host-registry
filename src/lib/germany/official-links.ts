/** EU Regulation 2024/1028 (official ELI, verified HTTP 200). */
export const EU_1028_URL = "https://eur-lex.europa.eu/eli/reg/2024/1028/oj";

/** Berlin Senate: Zweckentfremdungsverbot overview (verified HTTP 200). */
export const BERLIN_ZWVB_URL =
  "https://www.berlin.de/sen/wohnen/rechtliches/zweckentfremdungsverbot/";

/** Berlin Senate: ZwVbG rules and forms (verified HTTP 200). */
export const BERLIN_ZWVB_FORMS_URL =
  "https://www.berlin.de/sen/wohnen/rechtliches/zweckentfremdungsverbot/rechtsvorschriften-und-vordrucke/";

/** service.berlin.de: Zweckentfremdung / holiday letting service page (verified HTTP 200). */
export const BERLIN_SERVICE_ZWVB_URL =
  "https://service.berlin.de/dienstleistung/328146/";

export function getBerlinZwvbOverviewUrl(): string {
  return BERLIN_ZWVB_URL;
}

export function getBerlinZwvbFormsUrl(): string {
  return BERLIN_ZWVB_FORMS_URL;
}

export function getBerlinServiceZwvbUrl(): string {
  return BERLIN_SERVICE_ZWVB_URL;
}

export function getEu1028Url(): string {
  return EU_1028_URL;
}

/** Munich ZeS (Wohnraumzweckentfremdungssatzung) incl. §5a (verified HTTP 200). */
export const MUNICH_ZES_URL =
  "https://stadt.muenchen.de/rathaus/stadtrecht/vorschrift/970/version2/0.html";

/** Munich Sozialreferat: Zweckentfremdung / Bestandssicherung service (verified HTTP 200). */
export const MUNICH_ZWECKENTFREMUNG_SERVICE_URL =
  "https://stadt.muenchen.de/service/info/fachbereich-bestandssicherung/1076745/";

/** Munich infoblatt: Registrierungspflicht Kurzzeitvermietung (verified HTTP 200). */
export const MUNICH_STR_REGISTRATION_INFOBLATT_URL =
  "https://stadt.muenchen.de/dam/Home/Stadtverwaltung/Sozialreferat/wohnungsamt/Zweckentfremdung/LHM_Infoblatt_Registrierungspflicht_Kurzzeitvermietung.pdf";

export function getMunichZesUrl(): string {
  return MUNICH_ZES_URL;
}

export function getMunichZweckentfremdungServiceUrl(): string {
  return MUNICH_ZWECKENTFREMUNG_SERVICE_URL;
}

export function getMunichStrRegistrationInfoblattUrl(): string {
  return MUNICH_STR_REGISTRATION_INFOBLATT_URL;
}
