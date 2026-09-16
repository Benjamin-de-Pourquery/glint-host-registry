/** Alloggiati Web SOAP — official endpoint from WSDL + MANUALEWS.pdf */

export const ALLOGGIATI_SOAP_NAMESPACE = "AlloggiatiService";
export const ALLOGGIATI_SOAP_ENDPOINT =
  "https://alloggiatiweb.poliziadistato.it/service/service.asmx";

export const ALLOGGIATI_WS_MANUAL_URL =
  "https://alloggiatiweb.poliziadistato.it/portalealloggiati/Download/Manuali/MANUALEWS.pdf";
export const ALLOGGIATI_CREAFILE_MANUAL_URL =
  "https://alloggiatiweb.poliziadistato.it/portalealloggiati/Download/Manuali/CREAFILE.pdf";

export function isAlloggiatiLiveEnabled(): boolean {
  return process.env.ALLOCGIATI_LIVE === "true";
}

export function getAlloggiatiEndpoint(): string {
  return process.env.ALLOCGIATI_SOAP_ENDPOINT ?? ALLOGGIATI_SOAP_ENDPOINT;
}

export function canSubmitLive(propertyLiveEnabled: boolean): boolean {
  return isAlloggiatiLiveEnabled() && propertyLiveEnabled;
}
