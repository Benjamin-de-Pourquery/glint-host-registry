/**
 * Alloggiati Web SOAP client — envelopes per official WSDL + MANUALEWS.pdf (Polizia di Stato).
 * Operations: GenerateToken, Authentication_Test, Test (dry-run), Send (live only).
 */

import { ALLOGGIATI_SOAP_NAMESPACE, getAlloggiatiEndpoint } from "./config";

export type AlloggiatiSoapResponse = {
  success: boolean;
  esito?: boolean;
  errorCode?: string;
  errorMessage?: string;
  errorDetail?: string;
  token?: string;
  tokenIssued?: string;
  tokenExpires?: string;
  schedineValide?: number;
  rawResponse: string;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

function extractBool(xml: string, tag: string): boolean | undefined {
  const value = extractTag(xml, tag);
  if (value === undefined) return undefined;
  return value.toLowerCase() === "true";
}

export function buildGenerateTokenEnvelope(
  utente: string,
  password: string,
  wsKey: string
): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GenerateToken xmlns="${ALLOGGIATI_SOAP_NAMESPACE}">
      <Utente>${escapeXml(utente)}</Utente>
      <Password>${escapeXml(password)}</Password>
      <WsKey>${escapeXml(wsKey)}</WsKey>
    </GenerateToken>
  </soap:Body>
</soap:Envelope>`;
}

export function buildAuthenticationTestEnvelope(utente: string, token: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Authentication_Test xmlns="${ALLOGGIATI_SOAP_NAMESPACE}">
      <Utente>${escapeXml(utente)}</Utente>
      <token>${escapeXml(token)}</token>
    </Authentication_Test>
  </soap:Body>
</soap:Envelope>`;
}

export function buildSchedineTestEnvelope(
  utente: string,
  token: string,
  schedine: string[],
  operation: "Test" | "Send"
): string {
  const schedineXml = schedine
    .map((line) => `<string>${escapeXml(line)}</string>`)
    .join("");

  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${operation} xmlns="${ALLOGGIATI_SOAP_NAMESPACE}">
      <Utente>${escapeXml(utente)}</Utente>
      <token>${escapeXml(token)}</token>
      <ElencoSchedine>${schedineXml}</ElencoSchedine>
    </${operation}>
  </soap:Body>
</soap:Envelope>`;
}

export function parseAlloggiatiSoapResponse(
  responseXml: string,
  operation: "GenerateToken" | "Authentication_Test" | "Test" | "Send"
): AlloggiatiSoapResponse {
  const esito =
    extractBool(responseXml, "esito") ??
    extractBool(responseXml, `${operation}Result`) ??
    extractBool(responseXml, "Authentication_TestResult");

  const errorCode = extractTag(responseXml, "ErroreCod");
  const errorMessage = extractTag(responseXml, "ErroreDes");
  const errorDetail = extractTag(responseXml, "ErroreDettaglio");
  const token = extractTag(responseXml, "token");
  const tokenIssued = extractTag(responseXml, "issued");
  const tokenExpires = extractTag(responseXml, "expires");
  const schedineValideRaw = extractTag(responseXml, "SchedineValide");
  const schedineValide = schedineValideRaw ? Number.parseInt(schedineValideRaw, 10) : undefined;

  const success =
    (esito === true && !errorCode) ||
    (operation === "GenerateToken" && Boolean(token) && !errorCode);

  return {
    success,
    esito,
    errorCode,
    errorMessage,
    errorDetail,
    token,
    tokenIssued,
    tokenExpires,
    schedineValide: Number.isFinite(schedineValide) ? schedineValide : undefined,
    rawResponse: responseXml.slice(0, 8000),
  };
}

export async function sendAlloggiatiSoapRequest(
  soapAction: string,
  envelope: string
): Promise<AlloggiatiSoapResponse> {
  const endpoint = getAlloggiatiEndpoint();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: soapAction,
      },
      body: envelope,
      signal: AbortSignal.timeout(30000),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return {
        success: false,
        errorCode: String(response.status),
        errorMessage: `HTTP ${response.status}`,
        rawResponse: responseText.slice(0, 8000),
      };
    }

    const operation = soapAction.split("/").pop() as
      | "GenerateToken"
      | "Authentication_Test"
      | "Test"
      | "Send";
    return parseAlloggiatiSoapResponse(responseText, operation);
  } catch (error) {
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : "Connection failed",
      rawResponse: "",
    };
  }
}

export async function generateAlloggiatiToken(credentials: {
  utente: string;
  password: string;
  wsKey: string;
}): Promise<AlloggiatiSoapResponse> {
  const envelope = buildGenerateTokenEnvelope(
    credentials.utente,
    credentials.password,
    credentials.wsKey
  );
  const result = await sendAlloggiatiSoapRequest(
    `${ALLOGGIATI_SOAP_NAMESPACE}/GenerateToken`,
    envelope
  );
  return result;
}

export async function testAlloggiatiAuthentication(
  utente: string,
  token: string
): Promise<AlloggiatiSoapResponse> {
  const envelope = buildAuthenticationTestEnvelope(utente, token);
  return sendAlloggiatiSoapRequest(
    `${ALLOGGIATI_SOAP_NAMESPACE}/Authentication_Test`,
    envelope
  );
}

export async function submitSchedineToAlloggiati(
  utente: string,
  token: string,
  schedine: string[],
  live: boolean
): Promise<AlloggiatiSoapResponse> {
  const operation = live ? "Send" : "Test";
  const envelope = buildSchedineTestEnvelope(utente, token, schedine, operation);
  return sendAlloggiatiSoapRequest(`${ALLOGGIATI_SOAP_NAMESPACE}/${operation}`, envelope);
}
