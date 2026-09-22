export const STAY_NOTIFY_SYSTEM = "amsterdam_stay_notify";

export type StayNotifyCopyFields = {
  registrationNumber: string | null;
  permitNumber: string | null;
  checkInDate: string;
  checkOutDate: string;
  guestLabel: string | null;
  guestCount: number;
  propertyAddress: string;
  city: string;
};

export function buildStayNotifyCopyText(fields: StayNotifyCopyFields): string {
  const lines = [
    `Check-in: ${fields.checkInDate}`,
    `Check-out: ${fields.checkOutDate}`,
    fields.guestLabel ? `Guest: ${fields.guestLabel}` : null,
    `Guests: ${fields.guestCount}`,
    fields.registrationNumber
      ? `Registration: ${fields.registrationNumber}`
      : null,
    fields.permitNumber ? `Permit: ${fields.permitNumber}` : null,
    `Address: ${fields.propertyAddress}, ${fields.city}`,
  ].filter(Boolean);

  return lines.join("\n");
}
