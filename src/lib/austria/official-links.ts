/** EU Regulation 2024/1028 (official ELI, verified HTTP 200). */
export const EU_1028_URL = "https://eur-lex.europa.eu/eli/reg/2024/1028/oj";

/** City of Vienna press release on WKVRG plans (verified HTTP 200, 19 Sep 2026). */
export const VIENNA_WKVRG_OTS_URL =
  "https://www.ots.at/presseaussendung/OTS_20260919_OTS0027/buergermeister-ludwig-wien-ist-vorbild-beim-schutz-von-leistbaren-wohnungen-fuer-die-bevoelkerung";

/** Private rental for tourist purposes (90-day, Ortstaxe, VIETour context). */
export const VIENNA_PRIVATE_TOURIST_RENTAL_URL =
  "https://www.wien.gv.at/wirtschaft/privat-vermieten-touristische-zwecke";

/** Ausnahmebewilligung for short-term rental beyond 90-day home-sharing. */
export const VIENNA_AUSNAHMEBEWILLIGUNG_URL =
  "https://www.wien.gv.at/wohnen/ausnahmebewilligung-kurzzeitvermietung";

/** Ortstaxe (local tax) account — not the future WKVRG registration number. */
export const VIENNA_ORTSTAXE_URL = "https://www.wien.gv.at/amtswege/ortstaxe";

export function getViennaWkvgrAnnouncementUrl(): string {
  return VIENNA_WKVRG_OTS_URL;
}

export function getViennaPrivateTouristRentalUrl(): string {
  return VIENNA_PRIVATE_TOURIST_RENTAL_URL;
}

export function getViennaAusnahmebewilligungUrl(): string {
  return VIENNA_AUSNAHMEBEWILLIGUNG_URL;
}

export function getViennaOrtstaxeUrl(): string {
  return VIENNA_ORTSTAXE_URL;
}

export function getEu1028Url(): string {
  return EU_1028_URL;
}
