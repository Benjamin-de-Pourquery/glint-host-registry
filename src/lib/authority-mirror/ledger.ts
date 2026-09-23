import { normalizePlatformChannel } from "./channels";
import { nightsInPeriod } from "./period";
import type { AuthorityMirrorLedger, LedgerChannelRow, ReconcileChannelRegistration } from "./types";

type LedgerReservation = {
  channel: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
};

type LedgerGuestReport = {
  stayId: string | null;
  status: string;
};

export function buildLedger(input: {
  periodStart: Date;
  periodEnd: Date;
  reservations: LedgerReservation[];
  channelRegistrations: ReconcileChannelRegistration[];
  touristTaxNightsDeclared: number | null;
  guestReports: LedgerGuestReport[];
  nightCapUsed: number;
  nightCapLimit: number | null;
  openFindingsCount: number;
}): AuthorityMirrorLedger {
  const channelSet = new Set<string>();

  for (const reservation of input.reservations) {
    if (reservation.status === "cancelled") continue;
    channelSet.add(normalizePlatformChannel(reservation.channel));
  }
  for (const channel of input.channelRegistrations) {
    channelSet.add(normalizePlatformChannel(channel.channel));
  }

  const filedReports = input.guestReports.filter(
    (report) => report.status === "submitted" || report.status === "accepted"
  ).length;

  const channels: LedgerChannelRow[] = Array.from(channelSet)
    .sort()
    .map((channel) => {
      const channelReservations = input.reservations.filter(
        (reservation) =>
          reservation.status !== "cancelled" &&
          normalizePlatformChannel(reservation.channel) === channel
      );

      const platformNights = channelReservations.reduce(
        (sum, reservation) =>
          sum +
          nightsInPeriod(
            reservation.checkIn,
            reservation.checkOut,
            input.periodStart,
            input.periodEnd
          ),
        0
      );

      const registration = input.channelRegistrations.find(
        (row) => normalizePlatformChannel(row.channel) === channel
      );

      return {
        channel,
        platformNights,
        platformReservations: channelReservations.length,
        declaredTouristTaxNights: input.touristTaxNightsDeclared,
        guestReportsFiled: filedReports,
        registrationKeyDisplayed: registration?.displayedRegistrationNumber ?? null,
      };
    });

  return {
    periodStart: input.periodStart.toISOString(),
    periodEnd: input.periodEnd.toISOString(),
    channels,
    nightCapUsed: input.nightCapUsed,
    nightCapLimit: input.nightCapLimit,
    touristTaxNightsDeclared: input.touristTaxNightsDeclared,
    openFindingsCount: input.openFindingsCount,
  };
}
