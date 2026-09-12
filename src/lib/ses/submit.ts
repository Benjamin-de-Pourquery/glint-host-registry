import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { decryptSecret, hasEncryptionKey } from "@/lib/crypto/secrets";
import { buildSesPayload } from "./xml-builder";
import { validateStayForSes } from "./validation";
import { sendSesSoapRequest } from "./soap-client";
import { canSubmitLive } from "./config";
import type { SesStayInput, SesSubmitMode, SesSubmissionStatus } from "./types";

export type SubmitSesOptions = {
  propertyId: string;
  userId: string;
  stayId?: string;
  guestRecordId?: string;
  stay: SesStayInput;
  mode: SesSubmitMode;
};

export type SubmitSesResult = {
  submissionId: string;
  status: SesSubmissionStatus;
  validationErrors?: Array<{ field: string; message: { en: string; fr: string }; recordId?: string }>;
  governmentCode?: string;
  governmentMessage?: string;
  correlationId?: string;
  loteCode?: string;
  dryRunPreview?: {
    xmlPreview: string;
    summary: { guestCount: number; contractReference: string; codigoEstablecimiento: string };
  };
};

function hashXml(xml: string): string {
  return createHash("sha256").update(xml).digest("hex");
}

export async function submitSesParteViajeros(
  options: SubmitSesOptions
): Promise<SubmitSesResult> {
  const { propertyId, userId, stayId, guestRecordId, stay, mode } = options;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId },
    include: { sesCredential: true },
  });

  if (!property) {
    throw new Error("NOT_FOUND");
  }

  const credential = property.sesCredential;
  if (!credential) {
    throw new Error("NO_CREDENTIALS");
  }

  const validationErrors = validateStayForSes(stay);
  if (validationErrors.length > 0) {
    const submission = await prisma.sesSubmission.create({
      data: {
        propertyId,
        stayId,
        guestRecordId,
        status: "rejected",
        mode,
        validationErrorsJson: JSON.stringify(validationErrors),
        respondedAt: new Date(),
      },
    });
    return {
      submissionId: submission.id,
      status: "rejected",
      validationErrors,
    };
  }

  const payload = buildSesPayload(credential.codigoEstablecimiento, stay);
  const requestSummary = {
    ...payload.summary,
    xmlHash: hashXml(payload.xml),
    guestRecordIds: stay.guests.map((g) => g.recordId),
  };

  const effectiveMode: SesSubmitMode =
    mode === "live" && canSubmitLive(credential.liveSubmitEnabled) ? "live" : "dry_run";

  if (effectiveMode === "dry_run") {
    const submission = await prisma.sesSubmission.create({
      data: {
        propertyId,
        stayId,
        guestRecordId,
        status: "dry_run",
        mode: "dry_run",
        requestSummaryJson: JSON.stringify(requestSummary),
        respondedAt: new Date(),
        governmentMessage: "Dry-run: XML validated, no transmission to SES",
      },
    });

    return {
      submissionId: submission.id,
      status: "dry_run",
      dryRunPreview: {
        xmlPreview: payload.xml.slice(0, 2000),
        summary: payload.summary,
      },
    };
  }

  if (!hasEncryptionKey()) {
    throw new Error("ENCRYPTION_NOT_CONFIGURED");
  }

  const wsUsername = decryptSecret(credential.wsUsernameEncrypted);
  const wsPassword = decryptSecret(credential.wsPasswordEncrypted);

  const submission = await prisma.sesSubmission.create({
    data: {
      propertyId,
      stayId,
      guestRecordId,
      status: "sent",
      mode: "live",
      requestSummaryJson: JSON.stringify(requestSummary),
      submittedAt: new Date(),
    },
  });

  try {
    const response = await sendSesSoapRequest(payload.zipBase64, {
      codigoArrendador: credential.codigoArrendador,
      wsUsername,
      wsPassword,
    });

    const finalStatus: SesSubmissionStatus = response.success ? "accepted" : "rejected";

    await prisma.sesSubmission.update({
      where: { id: submission.id },
      data: {
        status: finalStatus,
        correlationId: response.correlationId,
        loteCode: response.loteCode,
        governmentCode: response.governmentCode,
        governmentMessage: response.governmentMessage,
        respondedAt: new Date(),
      },
    });

    return {
      submissionId: submission.id,
      status: finalStatus,
      governmentCode: response.governmentCode,
      governmentMessage: response.governmentMessage,
      correlationId: response.correlationId,
      loteCode: response.loteCode,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await prisma.sesSubmission.update({
      where: { id: submission.id },
      data: {
        status: "rejected",
        governmentMessage: message,
        respondedAt: new Date(),
      },
    });
    throw error;
  }
}
