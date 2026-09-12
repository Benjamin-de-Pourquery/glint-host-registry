import {
  SES_APPLICATION_NAME,
  SES_SOAP_NAMESPACE,
  type SesSoapResponse,
} from "./types";
import { getSesEndpoint } from "./config";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildSoapEnvelope(
  codigoArrendador: string,
  zipBase64: string
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:com="${SES_SOAP_NAMESPACE}">
  <soapenv:Header/>
  <soapenv:Body>
    <com:comunicacionRequest>
      <peticion>
        <cabecera>
          <codigoArrendador>${escapeXml(codigoArrendador)}</codigoArrendador>
          <aplicacion>${escapeXml(SES_APPLICATION_NAME)}</aplicacion>
          <tipoOperacion>A</tipoOperacion>
          <tipoComunicacion>PV</tipoComunicacion>
        </cabecera>
        <solicitud>${zipBase64}</solicitud>
      </peticion>
    </com:comunicacionRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function extractTag(xml: string, tag: string): string | undefined {
  const patterns = [
    new RegExp(`<(?:\\w+:)?${tag}[^>]*>([^<]*)</(?:\\w+:)?${tag}>`, "i"),
    new RegExp(`<${tag}>([^<]*)</${tag}>`, "i"),
  ];
  for (const pattern of patterns) {
    const match = xml.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return undefined;
}

export function parseSoapResponse(responseXml: string): SesSoapResponse {
  const codigo = extractTag(responseXml, "codigo");
  const descripcion = extractTag(responseXml, "descripcion");
  const lote = extractTag(responseXml, "lote") ?? extractTag(responseXml, "codigoLote");
  const idComunicacion =
    extractTag(responseXml, "idComunicacion") ??
    extractTag(responseXml, "idPeticion");

  const success = codigo === "0" || codigo === "0000";

  return {
    success,
    correlationId: idComunicacion,
    loteCode: lote,
    governmentCode: codigo,
    governmentMessage: descripcion,
    rawResponse: responseXml.slice(0, 4000),
  };
}

export async function sendSesSoapRequest(
  zipBase64: string,
  credentials: {
    codigoArrendador: string;
    wsUsername: string;
    wsPassword: string;
  }
): Promise<SesSoapResponse> {
  const endpoint = getSesEndpoint();
  const envelope = buildSoapEnvelope(credentials.codigoArrendador, zipBase64);
  const basicAuth = Buffer.from(
    `${credentials.wsUsername}:${credentials.wsPassword}`
  ).toString("base64");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "",
      Authorization: `Basic ${basicAuth}`,
    },
    body: envelope,
    signal: AbortSignal.timeout(30000),
  });

  const responseText = await response.text();

  if (!response.ok) {
    return {
      success: false,
      governmentCode: String(response.status),
      governmentMessage: `HTTP ${response.status}`,
      rawResponse: responseText.slice(0, 4000),
    };
  }

  return parseSoapResponse(responseText);
}
