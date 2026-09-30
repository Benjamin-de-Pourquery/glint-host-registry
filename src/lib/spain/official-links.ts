import type { SpainGuestReportingMode } from "./regions";

export const EU_1028_URL =
  "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1028";

export const RD_933_URL =
  "https://www.boe.es/buscar/act.php?id=BOE-A-2021-17461";

export const MIVAU_URL = "https://www.mivau.gob.es/";

/** Open-data list of establishments in the Registre de Turisme de Catalunya (verified HTTP 200). */
export const CATALONIA_TOURISM_REGISTER_OPEN_DATA_URL =
  "https://analisi.transparenciacatalunya.cat/Turisme/Establiments-d-allotjament-tur-stic-inscrits-al-Re/t2h3-cgys";

/** Generalitat open-data portal (verified HTTP 200). */
export const CATALONIA_OPEN_DATA_PORTAL_URL =
  "https://administraciodigital.gencat.cat/ca/dades/dades-obertes/inici/";

/** Barcelona City Council tourism information (verified HTTP 200). */
export const BARCELONA_TOURISM_HOUSING_URL =
  "https://ajuntament.barcelona.cat/turisme/en/";

export const MOSSOS_PORTAL_URL =
  "https://registreviatgers.mossos.gencat.cat/mossos_hotels/";
export const MOSSOS_LOGIN_URL =
  "https://registreviatgers.mossos.gencat.cat/mossos_hotels/AppJava/login.do";
export const MOSSOS_PI15_INFO_URL =
  "https://empresa.gencat.cat/ca/ambits-actuacio/turisme/registre-allotjaments-turistics";

export const ERTZAINTZA_PORTAL_URL =
  "https://www.ertzaintza.euskadi.eus/servicios-al-ciudadano/tramites-y-gestiones/registro-de-viajeros/web01a3wztram/es/";
export const EUSKADI_HOSTELERO_URL =
  "https://www.euskadi.eus/informacion/tramitacion-registro-de-viajeros/web01a3wztram/es/";

/** Comunidad de Madrid VUT tourist housing register (verified HTTP 200). */
export const MADRID_VUT_REGISTER_URL =
  "https://www.comunidad.madrid/servicios/hacienda/registro-viviendas-uso-turistico";

/** Decreto 79/2014 Comunidad de Madrid — VUT framework (BOCM). */
export const MADRID_DECRETO_79_2014_URL =
  "https://www.bocm.es/bocm/2014/04/08/BOCM-20140408-1.PDF";

/** Decreto 27/2026 Comunidad de Madrid — VUT amendments (BOCM). */
export const MADRID_DECRETO_27_2026_URL =
  "https://www.bocm.es/bocm/2026/04/26/BOCM-20260426-1.PDF";

/** Ayuntamiento de Madrid tourism / urban planning entry point. */
export const MADRID_AYUNTAMIENTO_TURISMO_URL =
  "https://www.madrid.es/portales/munimadrid/es/Inicio/Turismo-y-Ocio/";

export const SES_HOSPEDAJES_PORTAL_URL =
  "https://hospedajes.ses.mir.es/hospedajes-web/";
export const SES_HOSPEDAJES_TEST_URL =
  "https://hospedajes.pre-ses.mir.es/hospedajes-web/";

export function getOfficialPortalUrl(mode: SpainGuestReportingMode): string | null {
  switch (mode) {
    case "mossos":
      return MOSSOS_PORTAL_URL;
    case "ertzaintza":
      return ERTZAINTZA_PORTAL_URL;
    case "ses":
      return "https://hospedajes.ses.mir.es/hospedajes-web/";
    default:
      return null;
  }
}

export function getOfficialLoginUrl(mode: SpainGuestReportingMode): string | null {
  switch (mode) {
    case "mossos":
      return MOSSOS_LOGIN_URL;
    case "ertzaintza":
      return ERTZAINTZA_PORTAL_URL;
    default:
      return null;
  }
}
