export const SES_APPLICATION_NAME = "Glint Host Registry";

export const SES_ENDPOINTS = {
  test: "https://hospedajes.pre-ses.mir.es/hospedajes-web/ws/v1/comunicacion",
  production: "https://hospedajes.ses.mir.es/hospedajes-web/ws/v1/comunicacion",
} as const;

export const SES_SOAP_NAMESPACE =
  "http://www.soap.servicios.hospedajes.mir.es/comunicacion";

export type SesDocumentType = "NIF" | "NIE" | "PAS" | "OTRO" | "CIF";
export type SesSex = "H" | "M" | "O";
export type SesPaymentType = "EFECT" | "TARJT" | "TRANS" | "PLATF" | "MOVIL" | "OTRO";

export type SesSubmissionStatus =
  | "queued"
  | "dry_run"
  | "sent"
  | "accepted"
  | "rejected";

export type SesGuestInput = {
  recordId: string;
  lastName: string;
  firstNames: string;
  dateOfBirth: Date;
  nationality: string;
  nationalityAlpha3?: string | null;
  usualAddress: string;
  mobile: string;
  email: string;
  arrivalDate: Date;
  departureDate: Date;
  documentType?: string | null;
  documentNumber?: string | null;
  documentSupport?: string | null;
  sex?: string | null;
  kinship?: string | null;
  postalCode?: string | null;
  municipalityCode?: string | null;
  municipalityName?: string | null;
  addressCountryAlpha3?: string | null;
};

export type SesStayInput = {
  stayId: string;
  checkInDate: Date;
  checkOutDate: Date;
  contractReference: string;
  guests: SesGuestInput[];
};

export type SesValidationError = {
  field: string;
  message: { en: string; fr: string };
  recordId?: string;
};

export type SesBuildResult = {
  xml: string;
  zipBase64: string;
  summary: {
    guestCount: number;
    contractReference: string;
    codigoEstablecimiento: string;
  };
};

export type SesSoapResponse = {
  success: boolean;
  correlationId?: string;
  loteCode?: string;
  governmentCode?: string;
  governmentMessage?: string;
  rawResponse?: string;
};

export type SesSubmitMode = "dry_run" | "live";
