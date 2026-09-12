import type { GuestRecord } from "@/generated/prisma/client";
import type { SesGuestInput, SesStayInput } from "./types";

export function guestRecordToSesInput(record: GuestRecord): SesGuestInput {
  return {
    recordId: record.id,
    lastName: record.lastName,
    firstNames: record.firstNames,
    dateOfBirth: record.dateOfBirth,
    nationality: record.nationality,
    nationalityAlpha3: null,
    usualAddress: record.usualAddress,
    mobile: record.mobile,
    email: record.email,
    arrivalDate: record.arrivalDate,
    departureDate: record.departureDate,
    documentType: record.documentType,
    documentNumber: record.documentNumber,
    documentSupport: record.documentSupport,
    sex: record.sex,
    kinship: record.kinship,
    postalCode: record.postalCode,
    municipalityCode: record.municipalityCode,
    municipalityName: record.municipalityName,
    addressCountryAlpha3: record.addressCountryAlpha3,
  };
}

export function buildStayInputFromRecords(
  stayId: string,
  checkInDate: Date,
  checkOutDate: Date,
  records: GuestRecord[]
): SesStayInput {
  const contractReference = `GLINT-${stayId.slice(-8).toUpperCase()}`;
  return {
    stayId,
    checkInDate,
    checkOutDate,
    contractReference,
    guests: records.map(guestRecordToSesInput),
  };
}
