import { normalizePlatformChannel, normalizeRegistrationNumber } from "./channels";
import { nightsInPeriod, overlapsPeriod } from "./period";
import type {
  ReconcileInput,
  ReconciliationFindingResult,
  ReconciliationFindingCode,
  ReconciliationSeverity,
} from "./types";

function finding(
  code: ReconciliationFindingCode,
  severity: ReconciliationSeverity,
  expected: Record<string, unknown>,
  observed: Record<string, unknown>,
  sourceRefs: string[]
): ReconciliationFindingResult {
  return { code, severity, expected, observed, sourceRefs };
}

export function reconcile(input: ReconcileInput): ReconciliationFindingResult[] {
  const findings: ReconciliationFindingResult[] = [];
  const { periodStart, periodEnd, stays, platformReservations, declared } = input;

  const activeReservations = platformReservations.filter(
    (r) => r.status !== "cancelled" && r.status !== "removed"
  );

  const periodStays = stays.filter((stay) =>
    overlapsPeriod(stay.checkIn, stay.checkOut, periodStart, periodEnd)
  );

  const periodReservations = activeReservations.filter((reservation) =>
    overlapsPeriod(reservation.checkIn, reservation.checkOut, periodStart, periodEnd)
  );

  const platformNightsTotal = periodReservations.reduce(
    (sum, reservation) =>
      sum +
      nightsInPeriod(
        reservation.checkIn,
        reservation.checkOut,
        periodStart,
        periodEnd
      ),
    0
  );

  if (
    declared.touristTaxNightsTotal != null &&
    platformNightsTotal > declared.touristTaxNightsTotal
  ) {
    findings.push(
      finding(
        "UNDECLARED_NIGHTS",
        platformNightsTotal - declared.touristTaxNightsTotal > 2 ? "likely_issue" : "to_check",
        { touristTaxNights: declared.touristTaxNightsTotal },
        { platformNights: platformNightsTotal },
        periodReservations.map((r) => r.id)
      )
    );
  }

  for (const stay of periodStays) {
    if (!stay.expectsForeignGuest) continue;
    if (stay.importStatus === "cancelled" || stay.importStatus === "removed_from_feed") {
      continue;
    }
    if (!stay.hasGuestReport) {
      findings.push(
        finding(
          "GUEST_REPORT_MISSING",
          "likely_issue",
          { guestReportFiled: true },
          { stayId: stay.id, guestRecords: stay.guestRecordCount },
          [stay.id]
        )
      );
    }
  }

  if (declared.guestReportsExpected > declared.guestReportsFiled) {
    findings.push(
      finding(
        "GUEST_REPORT_MISSING",
        "to_check",
        { guestReportsExpected: declared.guestReportsExpected },
        { guestReportsFiled: declared.guestReportsFiled },
        []
      )
    );
  }

  for (const reservation of periodReservations) {
    if (!reservation.matchedStayId) {
      findings.push(
        finding(
          "ORPHAN_PLATFORM_RESERVATION",
          "to_check",
          { matchedStayId: reservation.matchedStayId },
          {
            reservationId: reservation.id,
            channel: reservation.channel,
            checkIn: reservation.checkIn.toISOString().slice(0, 10),
            checkOut: reservation.checkOut.toISOString().slice(0, 10),
          },
          [reservation.id]
        )
      );
      continue;
    }

    const stay = periodStays.find((s) => s.id === reservation.matchedStayId);
    if (!stay) continue;

    if (
      reservation.guests != null &&
      reservation.guests > 0 &&
      stay.guestRecordCount > 0 &&
      reservation.guests !== stay.guestRecordCount
    ) {
      findings.push(
        finding(
          "GUEST_COUNT_MISMATCH",
          "to_check",
          { guestCount: reservation.guests },
          { guestRecords: stay.guestRecordCount, stayId: stay.id },
          [reservation.id, stay.id]
        )
      );
    }
  }

  const orphanStays = periodStays.filter((stay) => {
    if (stay.importStatus === "cancelled" || stay.importStatus === "removed_from_feed") {
      return false;
    }
    const channel = normalizePlatformChannel(stay.channel || stay.source);
    if (channel === "DIRECT" || channel === "OTHER") return false;
    return !activeReservations.some(
      (reservation) => reservation.matchedStayId === stay.id
    );
  });

  for (const stay of orphanStays) {
    const hasPlatformChannel = activeReservations.some((r) =>
      normalizePlatformChannel(r.channel) === normalizePlatformChannel(stay.channel || stay.source)
    );
    if (!hasPlatformChannel) continue;
    findings.push(
      finding(
        "ORPHAN_PLATFORM_RESERVATION",
        "to_check",
        { platformReservation: true },
        {
          stayId: stay.id,
          channel: stay.channel || stay.source,
          checkIn: stay.checkIn.toISOString().slice(0, 10),
          checkOut: stay.checkOut.toISOString().slice(0, 10),
        },
        [stay.id]
      )
    );
  }

  if (declared.nightCapExceeded) {
    findings.push(
      finding(
        "CAP_EXCEEDED_CROSS_CHANNEL",
        "likely_issue",
        { nightCapLimit: declared.nightCapLimit },
        { nightCapUsed: declared.nightCapUsed },
        []
      )
    );
  } else if (
    declared.nightCapLimit != null &&
    platformNightsTotal > declared.nightCapLimit
  ) {
    findings.push(
      finding(
        "CAP_EXCEEDED_CROSS_CHANNEL",
        "to_check",
        { nightCapLimit: declared.nightCapLimit },
        { platformNights: platformNightsTotal },
        []
      )
    );
  }

  if (declared.primaryRegistrationNumber) {
    const primary = normalizeRegistrationNumber(declared.primaryRegistrationNumber);
    for (const channel of declared.channelRegistrations) {
      const displayed = channel.displayedRegistrationNumber?.trim();
      if (!displayed) continue;
      if (normalizeRegistrationNumber(displayed) !== primary) {
        findings.push(
          finding(
            "WRONG_KEY_ON_CHANNEL",
            "likely_issue",
            { registrationNumber: declared.primaryRegistrationNumber },
            {
              channel: channel.channel,
              displayedRegistrationNumber: displayed,
            },
            [channel.channel]
          )
        );
      }
    }
  }

  if (
    declared.dac7DaysRented != null &&
    declared.dac7ImportedDays != null &&
    declared.dac7DaysRented !== declared.dac7ImportedDays
  ) {
    findings.push(
      finding(
        "DAC7_DAYS_MISMATCH",
        Math.abs(declared.dac7DaysRented - declared.dac7ImportedDays) > 3
          ? "likely_issue"
          : "to_check",
        { dac7DaysRented: declared.dac7DaysRented },
        { importedDays: declared.dac7ImportedDays },
        []
      )
    );
  }

  return findings;
}
