import { NextResponse } from "next/server";
import { buildGuardIcalFeed } from "@/lib/cap-guard/ical";
import { parseBudgetWindows } from "@/lib/cap-guard/compute-blocks";
import { computeGuardBlocks } from "@/lib/cap-guard/compute-blocks";
import {
  loadCapGuardPolicyByToken,
  recordBlocksPublishedEvent,
} from "@/lib/cap-guard/service";
import { loadPropertyNightCap } from "@/lib/france/night-cap-service";
import type { CapGuardMode } from "@/lib/cap-guard/types";

function resolveRegistrationExpiry(
  registration: {
    expiryDate: Date | null;
    nlHolidayPermitExpiry: Date | null;
  } | null
): Date | null {
  if (!registration) return null;
  const candidates = [
    registration.expiryDate,
    registration.nlHolidayPermitExpiry,
  ].filter(Boolean) as Date[];
  if (candidates.length === 0) return null;
  return candidates.reduce((earliest, date) =>
    date < earliest ? date : earliest
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token: rawToken } = await params;
  const token = rawToken.replace(/\.ics$/i, "");

  const policy = await loadCapGuardPolicyByToken(token);
  if (!policy?.enabled) {
    return new NextResponse("Not found", { status: 404 });
  }

  const property = policy.property;
  const nightCap = await loadPropertyNightCap({
    propertyId: property.id,
    country: property.country,
    city: property.city,
    residencyStatus: property.residencyStatus,
    settings: property.nightCapSettings,
  });

  if (!nightCap.applies || !nightCap.computation?.enabled) {
    return new NextResponse("Not found", { status: 404 });
  }

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const locale = acceptLanguage.toLowerCase().startsWith("fr") ? "fr" : "en";
  const budgetWindows = parseBudgetWindows(policy.budgetWindows);
  const registrationExpiry = resolveRegistrationExpiry(property.registration);

  const blocks = computeGuardBlocks(
    property.guestStays,
    nightCap.computation,
    {
      enabled: policy.enabled,
      mode: policy.mode as CapGuardMode,
      bufferNights: policy.bufferNights,
      budgetWindows,
      registrationGate: policy.registrationGate,
    },
    new Date(),
    registrationExpiry
  );

  await recordBlocksPublishedEvent(property.id, blocks.length);

  const body = buildGuardIcalFeed(blocks, {
    propertyName: property.name,
    summaryEn: "Closed by Host Registry",
    summaryFr: "Fermé par Host Registry",
    locale,
  });

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
