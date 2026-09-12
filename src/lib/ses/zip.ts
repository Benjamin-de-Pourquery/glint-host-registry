import { strToU8, zipSync } from "fflate";

/** Compress XML to ZIP and encode as Base64 per SES spec. */
export function zipAndBase64Encode(xml: string, filename = "solicitud.xml"): string {
  const zipped = zipSync({ [filename]: strToU8(xml) });
  return Buffer.from(zipped).toString("base64");
}
