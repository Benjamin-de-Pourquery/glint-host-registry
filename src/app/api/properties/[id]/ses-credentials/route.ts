import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret, hasEncryptionKey } from "@/lib/crypto/secrets";
import { isSpainCountry, getSpainGuestReportingMode } from "@/lib/spain/regions";
import { z } from "zod";

const saveSchema = z.object({
  codigoArrendador: z.string().min(1).max(10),
  wsUsername: z.string().min(1).max(100),
  wsPassword: z.string().min(1).max(200),
  codigoEstablecimiento: z.string().min(1).max(10),
  liveSubmitEnabled: z.boolean().optional(),
});

async function getOwnedProperty(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
    include: { sesCredential: true },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const property = await getOwnedProperty(id, session.user.id);

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const reportingSystem = getSpainGuestReportingMode(property.city);
  const credential = property.sesCredential;

  return NextResponse.json({
    configured: Boolean(credential),
    reportingSystem,
    usesSes: reportingSystem === "ses",
    codigoArrendador: credential?.codigoArrendador ?? null,
    codigoEstablecimiento: credential?.codigoEstablecimiento ?? null,
    wsUsernameHint: credential ? "••••••••" : null,
    hasPassword: Boolean(credential?.wsPasswordEncrypted),
    liveSubmitEnabled: credential?.liveSubmitEnabled ?? false,
    lastTestedAt: credential?.lastTestedAt?.toISOString() ?? null,
    lastTestStatus: credential?.lastTestStatus ?? null,
    encryptionConfigured: hasEncryptionKey(),
    sesLiveEnv: process.env.SES_LIVE === "true",
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const property = await getOwnedProperty(id, session.user.id);

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isSpainCountry(property.country)) {
    return NextResponse.json({ error: "Property is not in Spain" }, { status: 400 });
  }

  if (!hasEncryptionKey()) {
    return NextResponse.json(
      { error: "Secure credential storage is not available" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const data = saveSchema.parse(body);

    const encryptedUsername = encryptSecret(data.wsUsername);
    const encryptedPassword = encryptSecret(data.wsPassword);

    const credential = await prisma.sesCredential.upsert({
      where: { propertyId: id },
      create: {
        propertyId: id,
        codigoArrendador: data.codigoArrendador.trim(),
        wsUsernameEncrypted: encryptedUsername,
        wsPasswordEncrypted: encryptedPassword,
        codigoEstablecimiento: data.codigoEstablecimiento.trim(),
        liveSubmitEnabled: data.liveSubmitEnabled ?? false,
      },
      update: {
        codigoArrendador: data.codigoArrendador.trim(),
        wsUsernameEncrypted: encryptedUsername,
        wsPasswordEncrypted: encryptedPassword,
        codigoEstablecimiento: data.codigoEstablecimiento.trim(),
        liveSubmitEnabled: data.liveSubmitEnabled ?? false,
      },
    });

    return NextResponse.json({
      configured: true,
      codigoArrendador: credential.codigoArrendador,
      codigoEstablecimiento: credential.codigoEstablecimiento,
      liveSubmitEnabled: credential.liveSubmitEnabled,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
