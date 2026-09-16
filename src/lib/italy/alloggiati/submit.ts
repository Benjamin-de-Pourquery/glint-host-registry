import { prisma } from "@/lib/prisma";
import { decryptSecret, hasEncryptionKey } from "@/lib/crypto/secrets";
import { validateStayForAlloggiatiExport } from "@/lib/italy/export";
import { canSubmitLive } from "./config";
import { buildSchedineLines } from "./schedina";
import {
  generateAlloggiatiToken,
  submitSchedineToAlloggiati,
  type AlloggiatiSoapResponse,
} from "./soap-client";

export type AlloggiatiSubmitMode = "dry_run" | "live";

export type SubmitAlloggiatiResult = {
  mode: AlloggiatiSubmitMode;
  success: boolean;
  schedineCount: number;
  schedineValide?: number;
  governmentCode?: string;
  governmentMessage?: string;
  governmentDetail?: string;
  tokenExpires?: string;
  dryRunNote?: string;
};

async function getDecryptedCredentials(propertyId: string, userId: string) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId },
    include: { alloggiatiCredential: true },
  });

  if (!property?.alloggiatiCredential) {
    throw new Error("NO_CREDENTIALS");
  }

  if (!hasEncryptionKey()) {
    throw new Error("NO_ENCRYPTION");
  }

  const credential = property.alloggiatiCredential;
  return {
    property,
    credential,
    utente: credential.utente,
    password: decryptSecret(credential.passwordEncrypted),
    wsKey: decryptSecret(credential.wsKeyEncrypted),
    liveSubmitEnabled: credential.liveSubmitEnabled,
  };
}

function soapToResult(
  mode: AlloggiatiSubmitMode,
  schedineCount: number,
  response: AlloggiatiSoapResponse,
  dryRunNote?: string
): SubmitAlloggiatiResult {
  return {
    mode,
    success: response.success,
    schedineCount,
    schedineValide: response.schedineValide,
    governmentCode: response.errorCode,
    governmentMessage: response.errorMessage,
    governmentDetail: response.errorDetail,
    tokenExpires: response.tokenExpires,
    dryRunNote,
  };
}

export async function testAlloggiatiCredentials(
  propertyId: string,
  userId: string
): Promise<SubmitAlloggiatiResult & { testStatus: string }> {
  const { credential, utente, password, wsKey } = await getDecryptedCredentials(
    propertyId,
    userId
  );

  const tokenResponse = await generateAlloggiatiToken({ utente, password, wsKey });
  const tokenOk = Boolean(tokenResponse.token) && !tokenResponse.errorCode;

  let testStatus = "auth_failed";
  if (tokenOk && tokenResponse.token) {
    const { testAlloggiatiAuthentication } = await import("./soap-client");
    const authTest = await testAlloggiatiAuthentication(utente, tokenResponse.token);
    testStatus = authTest.success || authTest.esito === true ? "ok" : "auth_failed";
  } else if (!tokenResponse.errorCode && !tokenResponse.errorMessage) {
    testStatus = "connection_failed";
  }

  await prisma.alloggiatiCredential.update({
    where: { propertyId },
    data: {
      lastTestedAt: new Date(),
      lastTestStatus: testStatus,
    },
  });

  return {
    ...soapToResult(
      "dry_run",
      0,
      tokenResponse,
      "Connectivity test via GenerateToken + Authentication_Test"
    ),
    testStatus,
  };
}

export async function submitAlloggiatiSchedine(options: {
  propertyId: string;
  userId: string;
  guests: Array<{
    id: string;
    lastName: string;
    firstNames: string;
    dateOfBirth: Date;
    placeOfBirth: string;
    nationality: string;
    usualAddress: string;
    mobile: string;
    email: string;
    arrivalDate: Date;
    departureDate: Date;
    documentType: string | null;
    documentNumber: string | null;
    sex: string | null;
    postalCode: string | null;
    municipalityName: string | null;
    addressCountryAlpha3: string | null;
    accompanyingChildrenJson: string | null;
  }>;
  mode: AlloggiatiSubmitMode;
}): Promise<SubmitAlloggiatiResult> {
  const { propertyId, userId, guests, mode } = options;

  const validationErrors = validateStayForAlloggiatiExport(guests);
  if (validationErrors.length > 0) {
    return {
      mode,
      success: false,
      schedineCount: guests.length,
      governmentMessage: `${validationErrors.length} validation issue(s)`,
      dryRunNote: "Fix guest fields before SOAP Test/Send",
    };
  }

  const { credential, utente, password, wsKey, liveSubmitEnabled } =
    await getDecryptedCredentials(propertyId, userId);

  const effectiveLive = mode === "live" && canSubmitLive(liveSubmitEnabled);
  const effectiveMode: AlloggiatiSubmitMode = effectiveLive ? "live" : "dry_run";

  const schedine = buildSchedineLines(guests);

  const tokenResponse = await generateAlloggiatiToken({ utente, password, wsKey });
  if (!tokenResponse.token) {
    return soapToResult(
      effectiveMode,
      schedine.length,
      tokenResponse,
      "GenerateToken failed — check utente, password, and WSKEY"
    );
  }

  const submitResponse = await submitSchedineToAlloggiati(
    utente,
    tokenResponse.token,
    schedine,
    effectiveLive
  );

  const dryRunNote =
    effectiveMode === "dry_run"
      ? "SOAP Test operation — schedine validated on Polizia servers, not submitted (Send)"
      : undefined;

  if (effectiveMode === "live" && submitResponse.success) {
    await prisma.alloggiatiCredential.update({
      where: { propertyId },
      data: { lastTestedAt: new Date(), lastTestStatus: "live_ok" },
    });
  }

  return soapToResult(effectiveMode, schedine.length, submitResponse, dryRunNote);
}
