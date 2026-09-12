import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptSecret, hasEncryptionKey } from "@/lib/crypto/secrets";
import { buildSoapEnvelope, parseSoapResponse } from "@/lib/ses/soap-client";
import { getSesEndpoint } from "@/lib/ses/config";
import { checkSesRateLimit } from "@/lib/ses/rate-limit";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateCheck = checkSesRateLimit(session.user.id);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfterMs: rateCheck.retryAfterMs },
      { status: 429 }
    );
  }

  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: { id, userId: session.user.id },
    include: { sesCredential: true },
  });

  if (!property?.sesCredential) {
    return NextResponse.json({ error: "Credentials not configured" }, { status: 404 });
  }

  if (!hasEncryptionKey()) {
    return NextResponse.json({ error: "Encryption not configured" }, { status: 503 });
  }

  const credential = property.sesCredential;
  const wsUsername = decryptSecret(credential.wsUsernameEncrypted);
  const wsPassword = decryptSecret(credential.wsPasswordEncrypted);

  // Minimal empty solicitud for connectivity test — expect validation error from SES, not auth error
  const emptyZipBase64 = Buffer.from("UEsDBBQAAAAIAAAAAAA=" ).toString("base64");
  const envelope = buildSoapEnvelope(credential.codigoArrendador, emptyZipBase64);
  const basicAuth = Buffer.from(`${wsUsername}:${wsPassword}`).toString("base64");

  try {
    const response = await fetch(getSesEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "",
        Authorization: `Basic ${basicAuth}`,
      },
      body: envelope,
      signal: AbortSignal.timeout(15000),
    });

    const responseText = await response.text();
    const parsed = parseSoapResponse(responseText);

    const authOk =
      parsed.governmentCode !== "10107" &&
      parsed.governmentCode !== "10108" &&
      response.status !== 401;

    const status = authOk ? "ok" : "auth_failed";
    await prisma.sesCredential.update({
      where: { propertyId: id },
      data: {
        lastTestedAt: new Date(),
        lastTestStatus: status,
      },
    });

    return NextResponse.json({
      status,
      httpStatus: response.status,
      governmentCode: parsed.governmentCode,
      governmentMessage: parsed.governmentMessage,
      endpoint: getSesEndpoint(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    await prisma.sesCredential.update({
      where: { propertyId: id },
      data: {
        lastTestedAt: new Date(),
        lastTestStatus: "connection_failed",
      },
    });
    return NextResponse.json({ status: "connection_failed", message }, { status: 502 });
  }
}
