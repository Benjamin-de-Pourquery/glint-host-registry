import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret, hasEncryptionKey } from "@/lib/crypto/secrets";
import { getItalyGuestReportingMode, isItalyCountry } from "@/lib/italy/regions";
import { ALLOGGIATI_WS_MANUAL_URL, isAlloggiatiLiveEnabled } from "@/lib/italy/alloggiati/config";
import { z } from "zod";

const saveSchema = z.object({
  utente: z.string().min(1).max(50),
  password: z.string().min(1).max(200),
  wsKey: z.string().min(1).max(200),
  liveSubmitEnabled: z.boolean().optional(),
});

async function getOwnedProperty(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
    include: { alloggiatiCredential: true },
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

  const reportingSystem = getItalyGuestReportingMode(property.city);
  const credential = property.alloggiatiCredential;

  return NextResponse.json({
    configured: Boolean(credential),
    reportingSystem,
    usesAlloggiati: reportingSystem === "alloggiati",
    utente: credential?.utente ?? null,
    hasPassword: Boolean(credential?.passwordEncrypted),
    hasWsKey: Boolean(credential?.wsKeyEncrypted),
    liveSubmitEnabled: credential?.liveSubmitEnabled ?? false,
    lastTestedAt: credential?.lastTestedAt?.toISOString() ?? null,
    lastTestStatus: credential?.lastTestStatus ?? null,
    encryptionConfigured: hasEncryptionKey(),
    alloggiatiLiveEnv: isAlloggiatiLiveEnabled(),
    wsManualUrl: ALLOGGIATI_WS_MANUAL_URL,
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

  if (!isItalyCountry(property.country)) {
    return NextResponse.json({ error: "Property is not in Italy" }, { status: 400 });
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

    const encryptedPassword = encryptSecret(data.password);
    const encryptedWsKey = encryptSecret(data.wsKey);

    const credential = await prisma.alloggiatiCredential.upsert({
      where: { propertyId: id },
      create: {
        propertyId: id,
        utente: data.utente.trim(),
        passwordEncrypted: encryptedPassword,
        wsKeyEncrypted: encryptedWsKey,
        liveSubmitEnabled: data.liveSubmitEnabled ?? false,
      },
      update: {
        utente: data.utente.trim(),
        passwordEncrypted: encryptedPassword,
        wsKeyEncrypted: encryptedWsKey,
        liveSubmitEnabled: data.liveSubmitEnabled ?? false,
      },
    });

    return NextResponse.json({
      configured: true,
      utente: credential.utente,
      liveSubmitEnabled: credential.liveSubmitEnabled,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
