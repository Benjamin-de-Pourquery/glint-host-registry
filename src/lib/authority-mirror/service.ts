import { startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { loadPropertyNightCap } from "@/lib/france/night-cap-service";
import { resolvePrimaryRegistrationNumber } from "@/lib/listing-health/resolve-registration";
import { normalizePlatformChannel } from "./channels";
import { buildLedger } from "./ledger";
import { matchReservationsToStays, stayChannel } from "./match";
import { defaultMonthPeriod, formatPeriodMonth, nightsInPeriod, overlapsPeriod } from "./period";
import { reconcile } from "./reconcile";
import type {
  AuthorityMirrorLedger,
  ColumnMapping,
  ParsedPlatformReservation,
  PlatformChannel,
  ReconciliationFindingResult,
} from "./types";
import { parsePlatformFile } from "./parsers";

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function importPlatformReservations(
  propertyId: string,
  userId: string,
  channel: PlatformChannel,
  fileContent: Buffer | string,
  options?: { filename?: string; mapping?: ColumnMapping }
): Promise<{ importId: string; imported: number; matched: number }> {
  const parsed = parsePlatformFile(channel, fileContent, options);
  const active = parsed.filter((row) => row.status !== "cancelled");

  const importRow = await prisma.platformImport.create({
    data: {
      propertyId,
      channel,
      filename: options?.filename ?? null,
      rowCount: active.length,
      createdByUserId: userId,
    },
  });

  const stays = await prisma.guestStay.findMany({
    where: { propertyId },
    select: {
      id: true,
      checkInDate: true,
      checkOutDate: true,
      source: true,
      importStatus: true,
    },
  });

  const matchableStays = stays.map((stay) => ({
    id: stay.id,
    checkIn: stay.checkInDate,
    checkOut: stay.checkOutDate,
    source: stay.source,
    importStatus: stay.importStatus,
  }));

  let matched = 0;

  for (const row of active) {
    const tempId = `pending-${row.externalRef}`;
    const tempReservation = {
      id: tempId,
      checkIn: row.checkIn,
      checkOut: row.checkOut,
      channel,
      status: row.status,
    };

    const matchMap = matchReservationsToStays([tempReservation], matchableStays);
    const matchedStayId = matchMap.get(tempId) ?? null;
    if (matchedStayId) matched += 1;

    await prisma.platformReservation.upsert({
      where: {
        propertyId_channel_externalRef: {
          propertyId,
          channel,
          externalRef: row.externalRef,
        },
      },
      create: {
        propertyId,
        importId: importRow.id,
        channel,
        externalRef: row.externalRef,
        listingRef: row.listingRef ?? null,
        checkIn: row.checkIn,
        checkOut: row.checkOut,
        nights: row.nights,
        guests: row.guests ?? null,
        status: row.status,
        grossAmountCents: row.grossAmountCents ?? null,
        matchedStayId,
      },
      update: {
        importId: importRow.id,
        listingRef: row.listingRef ?? null,
        checkIn: row.checkIn,
        checkOut: row.checkOut,
        nights: row.nights,
        guests: row.guests ?? null,
        status: row.status,
        grossAmountCents: row.grossAmountCents ?? null,
        matchedStayId,
      },
    });
  }

  return { importId: importRow.id, imported: active.length, matched };
}

export async function rematchPropertyReservations(propertyId: string): Promise<number> {
  const [reservations, stays] = await Promise.all([
    prisma.platformReservation.findMany({ where: { propertyId } }),
    prisma.guestStay.findMany({ where: { propertyId } }),
  ]);

  const matchableStays = stays.map((stay) => ({
    id: stay.id,
    checkIn: stay.checkInDate,
    checkOut: stay.checkOutDate,
    source: stay.source,
    importStatus: stay.importStatus,
  }));

  const matchableReservations = reservations.map((reservation) => ({
    id: reservation.id,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    channel: reservation.channel,
    status: reservation.status,
  }));

  const matches = matchReservationsToStays(matchableReservations, matchableStays);
  let updated = 0;

  for (const reservation of reservations) {
    const matchedStayId = matches.get(reservation.id) ?? null;
    if (matchedStayId !== reservation.matchedStayId) {
      await prisma.platformReservation.update({
        where: { id: reservation.id },
        data: { matchedStayId },
      });
      updated += 1;
    }
  }

  return updated;
}

async function loadDeclaredContext(propertyId: string, periodStart: Date, periodEnd: Date) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      registration: true,
      listingChannels: true,
      touristTaxPeriods: true,
      guestStays: {
        include: {
          guestRecords: { select: { id: true } },
          sesSubmissions: { select: { status: true } },
          regionalGuestReports: { select: { status: true } },
        },
      },
      platformReservations: true,
      dac7ListingOverviews: true,
    },
  });

  if (!property) return null;

  const touristTaxPeriod = property.touristTaxPeriods.find(
    (period) => period.periodStart.getTime() === periodStart.getTime()
  );

  const nightCap = await loadPropertyNightCap({
    propertyId: property.id,
    country: property.country,
    city: property.city,
    residencyStatus: property.residencyStatus,
    settings: null,
  });

  const year = periodStart.getFullYear();
  const dac7Rows = property.dac7ListingOverviews.filter((row) => row.year === year);
  const dac7DaysRented = dac7Rows.reduce((sum, row) => sum + row.daysRented, 0);

  const yearReservations = property.platformReservations.filter(
    (reservation) =>
      reservation.status !== "cancelled" &&
      reservation.checkIn.getFullYear() === year
  );
  const dac7ImportedDays = yearReservations.reduce((sum, reservation) => sum + reservation.nights, 0);

  const periodStays = property.guestStays.filter((stay) =>
    overlapsPeriod(stay.checkInDate, stay.checkOutDate, periodStart, periodEnd)
  );

  let guestReportsExpected = 0;
  let guestReportsFiled = 0;

  for (const stay of periodStays) {
    if (!stay.expectsForeignGuest) continue;
    if (stay.importStatus === "cancelled" || stay.importStatus === "removed_from_feed") {
      continue;
    }
    guestReportsExpected += 1;
    const sesFiled = stay.sesSubmissions.some(
      (submission) => submission.status === "accepted" || submission.status === "submitted"
    );
    const regionalFiled = stay.regionalGuestReports.some(
      (report) => report.status === "accepted" || report.status === "submitted"
    );
    if (sesFiled || regionalFiled) {
      guestReportsFiled += 1;
    }
  }

  const guestReports = property.guestStays.flatMap((stay) =>
    stay.regionalGuestReports.map((report) => ({
      stayId: stay.id,
      status: report.status,
    }))
  );

  return {
    property,
    touristTaxNightsTotal: touristTaxPeriod?.nightsInPeriod ?? null,
    guestReportsExpected,
    guestReportsFiled,
    guestReports,
    nightCapUsed: nightCap.computation?.nightsUsed ?? 0,
    nightCapLimit: nightCap.computation?.limit ?? null,
    nightCapExceeded:
      nightCap.computation?.status === "exceeded" ||
      (nightCap.computation?.enabled &&
        nightCap.computation.nightsUsed > nightCap.computation.limit),
    primaryRegistrationNumber: resolvePrimaryRegistrationNumber(property.registration),
    channelRegistrations: property.listingChannels.map((channel) => ({
      channel: channel.channel,
      displayedRegistrationNumber: channel.registrationNumberDisplayed,
    })),
    dac7DaysRented: dac7Rows.length > 0 ? dac7DaysRented : null,
    dac7ImportedDays: yearReservations.length > 0 ? dac7ImportedDays : null,
    periodStays,
    reservations: property.platformReservations,
  };
}

export async function runReconciliation(
  propertyId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<ReconciliationFindingResult[]> {
  const context = await loadDeclaredContext(propertyId, periodStart, periodEnd);
  if (!context) return [];

  const reconcileInput = {
    propertyId,
    periodStart,
    periodEnd,
    stays: context.periodStays.map((stay) => {
      const hasGuestReport =
        stay.sesSubmissions.some(
          (submission) =>
            submission.status === "accepted" || submission.status === "submitted"
        ) ||
        stay.regionalGuestReports.some(
          (report) => report.status === "accepted" || report.status === "submitted"
        );

      return {
        id: stay.id,
        checkIn: stay.checkInDate,
        checkOut: stay.checkOutDate,
        nights: nightsInPeriod(
          stay.checkInDate,
          stay.checkOutDate,
          periodStart,
          periodEnd
        ),
        channel: normalizePlatformChannel(stayChannel({
          id: stay.id,
          checkIn: stay.checkInDate,
          checkOut: stay.checkOutDate,
          source: stay.source,
        })),
        source: stay.source,
        guestRecordCount: stay.guestRecords.length,
        hasGuestReport,
        importStatus: stay.importStatus,
        expectsForeignGuest: stay.expectsForeignGuest,
      };
    }),
    platformReservations: context.reservations.map((reservation) => ({
      id: reservation.id,
      channel: reservation.channel,
      externalRef: reservation.externalRef,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      nights: reservation.nights,
      guests: reservation.guests,
      status: reservation.status,
      matchedStayId: reservation.matchedStayId,
    })),
    declared: {
      touristTaxNightsTotal: context.touristTaxNightsTotal,
      guestReportsFiled: context.guestReportsFiled,
      guestReportsExpected: context.guestReportsExpected,
      nightCapUsed: context.nightCapUsed,
      nightCapLimit: context.nightCapLimit,
      nightCapExceeded: Boolean(context.nightCapExceeded),
      primaryRegistrationNumber: context.primaryRegistrationNumber,
      channelRegistrations: context.channelRegistrations,
      dac7DaysRented: context.dac7DaysRented,
      dac7ImportedDays: context.dac7ImportedDays,
    },
  };

  const findings = reconcile(reconcileInput);

  await prisma.reconciliationFinding.deleteMany({
    where: {
      propertyId,
      periodStart,
      periodEnd,
      resolvedAt: null,
    },
  });

  if (findings.length > 0) {
    await prisma.reconciliationFinding.createMany({
      data: findings.map((item) => ({
        propertyId,
        periodStart,
        periodEnd,
        code: item.code,
        severity: item.severity,
        expectedJson: JSON.stringify(item.expected),
        observedJson: JSON.stringify(item.observed),
        sourceRefsJson: JSON.stringify(item.sourceRefs),
      })),
    });
  }

  return findings;
}

export async function getAuthorityMirrorLedger(
  propertyId: string,
  periodStart?: Date,
  periodEnd?: Date
): Promise<AuthorityMirrorLedger> {
  const period = periodStart && periodEnd
    ? { periodStart, periodEnd }
    : defaultMonthPeriod();

  const context = await loadDeclaredContext(propertyId, period.periodStart, period.periodEnd);
  if (!context) {
    return buildLedger({
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      reservations: [],
      channelRegistrations: [],
      touristTaxNightsDeclared: null,
      guestReports: [],
      nightCapUsed: 0,
      nightCapLimit: null,
      openFindingsCount: 0,
    });
  }

  const openFindingsCount = await prisma.reconciliationFinding.count({
    where: {
      propertyId,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      resolvedAt: null,
    },
  });

  return buildLedger({
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    reservations: context.reservations,
    channelRegistrations: context.channelRegistrations,
    touristTaxNightsDeclared: context.touristTaxNightsTotal,
    guestReports: context.guestReports,
    nightCapUsed: context.nightCapUsed,
    nightCapLimit: context.nightCapLimit,
    openFindingsCount,
  });
}

export async function countOpenFindings(propertyId: string): Promise<number> {
  return prisma.reconciliationFinding.count({
    where: { propertyId, resolvedAt: null },
  });
}

export async function saveColumnMapping(
  propertyId: string,
  userId: string,
  channel: string,
  mapping: ColumnMapping
): Promise<void> {
  await prisma.platformColumnMapping.upsert({
    where: {
      propertyId_userId_channel: {
        propertyId,
        userId,
        channel,
      },
    },
    create: {
      propertyId,
      userId,
      channel,
      mappingJson: JSON.stringify(mapping),
    },
    update: {
      mappingJson: JSON.stringify(mapping),
    },
  });
}

export async function loadColumnMapping(
  propertyId: string,
  userId: string,
  channel: string
): Promise<ColumnMapping> {
  const row = await prisma.platformColumnMapping.findUnique({
    where: {
      propertyId_userId_channel: {
        propertyId,
        userId,
        channel,
      },
    },
  });
  if (!row) return {};
  return parseJson<ColumnMapping>(row.mappingJson, {});
}

export async function listFindings(
  propertyId: string,
  periodStart: Date,
  periodEnd: Date
) {
  const rows = await prisma.reconciliationFinding.findMany({
    where: { propertyId, periodStart, periodEnd },
    orderBy: [{ resolvedAt: "asc" }, { createdAt: "desc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    severity: row.severity,
    expected: parseJson(row.expectedJson, {}),
    observed: parseJson(row.observedJson, {}),
    sourceRefs: parseJson<string[]>(row.sourceRefsJson, []),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    periodMonth: formatPeriodMonth(row.periodStart),
  }));
}

export async function resolveFinding(findingId: string, propertyId: string): Promise<boolean> {
  const row = await prisma.reconciliationFinding.findFirst({
    where: { id: findingId, propertyId },
  });
  if (!row) return false;
  await prisma.reconciliationFinding.update({
    where: { id: findingId },
    data: { resolvedAt: new Date() },
  });
  return true;
}

export async function upsertDac7Overview(
  propertyId: string,
  data: {
    year: number;
    channel: string;
    listingRef?: string | null;
    daysRented: number;
    q1ConsiderationCents?: number | null;
    q2ConsiderationCents?: number | null;
    q3ConsiderationCents?: number | null;
    q4ConsiderationCents?: number | null;
  }
) {
  const listingRef = data.listingRef?.trim() || "";
  return prisma.dac7ListingOverview.upsert({
    where: {
      propertyId_year_channel_listingRef: {
        propertyId,
        year: data.year,
        channel: data.channel,
        listingRef,
      },
    },
    create: {
      propertyId,
      year: data.year,
      channel: data.channel,
      listingRef,
      daysRented: data.daysRented,
      q1ConsiderationCents: data.q1ConsiderationCents ?? null,
      q2ConsiderationCents: data.q2ConsiderationCents ?? null,
      q3ConsiderationCents: data.q3ConsiderationCents ?? null,
      q4ConsiderationCents: data.q4ConsiderationCents ?? null,
    },
    update: {
      daysRented: data.daysRented,
      q1ConsiderationCents: data.q1ConsiderationCents ?? null,
      q2ConsiderationCents: data.q2ConsiderationCents ?? null,
      q3ConsiderationCents: data.q3ConsiderationCents ?? null,
      q4ConsiderationCents: data.q4ConsiderationCents ?? null,
    },
  });
}

export async function listDac7Overviews(propertyId: string, year: number) {
  const rows = await prisma.dac7ListingOverview.findMany({
    where: { propertyId, year },
    orderBy: [{ channel: "asc" }, { listingRef: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    year: row.year,
    channel: row.channel,
    listingRef: row.listingRef,
    daysRented: row.daysRented,
    q1ConsiderationCents: row.q1ConsiderationCents,
    q2ConsiderationCents: row.q2ConsiderationCents,
    q3ConsiderationCents: row.q3ConsiderationCents,
    q4ConsiderationCents: row.q4ConsiderationCents,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function loadReconciliationStatement(
  propertyId: string,
  periodStart: Date,
  periodEnd: Date,
  locale: "en" | "fr"
) {
  const [ledger, findings] = await Promise.all([
    getAuthorityMirrorLedger(propertyId, periodStart, periodEnd),
    listFindings(propertyId, periodStart, periodEnd),
  ]);

  const openFindings = findings.filter((finding) => !finding.resolvedAt);

  return {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    locale,
    ledger,
    findings: openFindings,
    generatedAt: startOfDay(new Date()).toISOString(),
  };
}

export type { ParsedPlatformReservation };
