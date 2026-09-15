import type { SpainGuestReportingMode } from "./regions";

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

export const RD_933_URL =
  "https://www.boe.es/buscar/act.php?id=BOE-A-2021-17461";

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
