import type { SesGuestInput, SesStayInput, SesBuildResult } from "./types";
import { toAlpha3Nationality } from "./nationality";
import { zipAndBase64Encode } from "./zip";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDateTime(d: Date): string {
  const iso = d.toISOString();
  return iso.slice(0, 19);
}

function splitName(firstNames: string, lastName: string): {
  nombre: string;
  apellido1: string;
  apellido2?: string;
} {
  const parts = lastName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return {
      nombre: firstNames.trim(),
      apellido1: parts[0],
      apellido2: parts.slice(1).join(" "),
    };
  }
  return {
    nombre: firstNames.trim(),
    apellido1: lastName.trim() || firstNames.trim(),
  };
}

function buildAddressBlock(guest: SesGuestInput): string {
  const countryAlpha3 =
    guest.addressCountryAlpha3?.trim().toUpperCase() ||
    toAlpha3Nationality(guest.nationality) ||
    "ESP";
  const isSpain = countryAlpha3 === "ESP";
  const postalCode = guest.postalCode?.trim() || "00000";

  let municipalityXml = "";
  if (isSpain && guest.municipalityCode?.trim()) {
    municipalityXml = `<codigoMunicipio>${escapeXml(guest.municipalityCode.trim())}</codigoMunicipio>`;
  } else if (!isSpain) {
    const name =
      guest.municipalityName?.trim() ||
      guest.usualAddress.split(",").pop()?.trim() ||
      "Unknown";
    municipalityXml = `<nombreMunicipio>${escapeXml(name)}</nombreMunicipio>`;
  } else {
    municipalityXml = `<nombreMunicipio>${escapeXml("Madrid")}</nombreMunicipio>`;
  }

  return `<direccion>
        <direccion>${escapeXml(guest.usualAddress.slice(0, 100))}</direccion>
        ${municipalityXml}
        <codigoPostal>${escapeXml(postalCode)}</codigoPostal>
        <pais>${escapeXml(countryAlpha3)}</pais>
      </direccion>`;
}

function buildPersonaXml(guest: SesGuestInput): string {
  const { nombre, apellido1, apellido2 } = splitName(guest.firstNames, guest.lastName);
  const nationality =
    toAlpha3Nationality(guest.nationality, guest.nationalityAlpha3) || "ESP";
  const docType = guest.documentType?.trim().toUpperCase() || "PAS";
  const docNumber = guest.documentNumber?.trim() || "000000000";
  const sex = guest.sex?.trim().toUpperCase() || "O";

  let docXml = "";
  if (docType && docNumber) {
    docXml = `<tipoDocumento>${escapeXml(docType)}</tipoDocumento>
        <numeroDocumento>${escapeXml(docNumber)}</numeroDocumento>`;
    if (guest.documentSupport?.trim() && (docType === "NIF" || docType === "NIE")) {
      docXml += `\n        <soporteDocumento>${escapeXml(guest.documentSupport.trim())}</soporteDocumento>`;
    }
  }

  let kinshipXml = "";
  if (guest.kinship?.trim()) {
    kinshipXml = `<parentesco>${escapeXml(guest.kinship.trim())}</parentesco>`;
  }

  const contactXml = guest.mobile?.trim()
    ? `<telefono>${escapeXml(guest.mobile.trim())}</telefono>`
    : `<correo>${escapeXml(guest.email.trim())}</correo>`;

  return `<persona>
        <rol>VI</rol>
        <nombre>${escapeXml(nombre)}</nombre>
        <apellido1>${escapeXml(apellido1)}</apellido1>
        ${apellido2 ? `<apellido2>${escapeXml(apellido2)}</apellido2>` : ""}
        ${docXml}
        <fechaNacimiento>${formatDate(guest.dateOfBirth)}</fechaNacimiento>
        <nacionalidad>${escapeXml(nationality)}</nacionalidad>
        <sexo>${escapeXml(sex)}</sexo>
        ${buildAddressBlock(guest)}
        ${contactXml}
        ${kinshipXml}
      </persona>`;
}

function buildComunicacionXml(stay: SesStayInput): string {
  const contractDate = formatDate(stay.checkInDate);
  const personas = stay.guests.map(buildPersonaXml).join("\n      ");

  return `<comunicacion>
      <contrato>
        <referencia>${escapeXml(stay.contractReference)}</referencia>
        <fechaContrato>${contractDate}</fechaContrato>
        <fechaEntrada>${formatDateTime(stay.checkInDate)}</fechaEntrada>
        <fechaSalida>${formatDateTime(stay.checkOutDate)}</fechaSalida>
        <numPersonas>${stay.guests.length}</numPersonas>
        <internet>true</internet>
        <pago>
          <tipoPago>EFECT</tipoPago>
          <fechaPago>${contractDate}</fechaPago>
        </pago>
      </contrato>
      ${personas}
    </comunicacion>`;
}

export function buildParteViajerosXml(
  codigoEstablecimiento: string,
  stay: SesStayInput
): string {
  const comunicacion = buildComunicacionXml(stay);
  return `<?xml version="1.0" encoding="UTF-8"?>
<solicitud xmlns="http://www.soap.servicios.hospedajes.mir.es/altaParteViajero">
  <codigoEstablecimiento>${escapeXml(codigoEstablecimiento)}</codigoEstablecimiento>
  ${comunicacion}
</solicitud>`;
}

export function buildSesPayload(
  codigoEstablecimiento: string,
  stay: SesStayInput
): SesBuildResult {
  const xml = buildParteViajerosXml(codigoEstablecimiento, stay);
  const zipBase64 = zipAndBase64Encode(xml);

  return {
    xml,
    zipBase64,
    summary: {
      guestCount: stay.guests.length,
      contractReference: stay.contractReference,
      codigoEstablecimiento,
    },
  };
}
