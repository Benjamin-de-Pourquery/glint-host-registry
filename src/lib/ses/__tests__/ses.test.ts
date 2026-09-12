import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildParteViajerosXml, buildSesPayload } from "../xml-builder";
import { validateGuestForSes, validateStayForSes } from "../validation";
import { buildSoapEnvelope, parseSoapResponse } from "../soap-client";
import { zipAndBase64Encode } from "../zip";
import { toAlpha3Nationality } from "../nationality";
import { canSubmitLive, isSesLiveEnabled } from "../config";
import type { SesGuestInput, SesStayInput } from "../types";

const baseGuest: SesGuestInput = {
  recordId: "rec1",
  lastName: "García",
  firstNames: "Juan",
  dateOfBirth: new Date("1990-05-15"),
  nationality: "Spain",
  usualAddress: "Calle Mayor 1, Madrid",
  mobile: "+34600111222",
  email: "juan@example.com",
  arrivalDate: new Date("2026-09-12T14:00:00Z"),
  departureDate: new Date("2026-09-15T10:00:00Z"),
  documentType: "NIF",
  documentNumber: "12345678Z",
  sex: "H",
  postalCode: "28001",
  municipalityCode: "28079",
  addressCountryAlpha3: "ESP",
};

const baseStay: SesStayInput = {
  stayId: "stay1",
  checkInDate: new Date("2026-09-12T14:00:00Z"),
  checkOutDate: new Date("2026-09-15T10:00:00Z"),
  contractReference: "GLINT-STAY1",
  guests: [baseGuest],
};

describe("SES nationality mapping", () => {
  it("maps Spain to ESP", () => {
    assert.equal(toAlpha3Nationality("Spain"), "ESP");
    assert.equal(toAlpha3Nationality("ESP"), "ESP");
  });
});

describe("SES XML builder", () => {
  it("builds parte de viajeros XML with required fields", () => {
    const xml = buildParteViajerosXml("1234567890", baseStay);
    assert.match(xml, /<codigoEstablecimiento>1234567890<\/codigoEstablecimiento>/);
    assert.match(xml, /<rol>VI<\/rol>/);
    assert.match(xml, /<tipoPago>EFECT<\/tipoPago>/);
    assert.match(xml, /<referencia>GLINT-STAY1<\/referencia>/);
    assert.match(xml, /<nacionalidad>ESP<\/nacionalidad>/);
  });

  it("produces zip+base64 payload", () => {
    const payload = buildSesPayload("1234567890", baseStay);
    assert.ok(payload.zipBase64.length > 0);
    assert.equal(payload.summary.guestCount, 1);
  });

  it("zip encodes valid base64", () => {
    const xml = "<test>hello</test>";
    const encoded = zipAndBase64Encode(xml);
    assert.match(encoded, /^[A-Za-z0-9+/=]+$/);
  });
});

describe("SES validation", () => {
  it("passes valid guest", () => {
    const errors = validateGuestForSes(baseGuest);
    assert.equal(errors.length, 0);
  });

  it("fails guest without document", () => {
    const errors = validateGuestForSes({ ...baseGuest, documentNumber: "" });
    assert.ok(errors.some((e) => e.field === "documentNumber"));
  });

  it("fails stay without guests", () => {
    const errors = validateStayForSes({ ...baseStay, guests: [] });
    assert.ok(errors.some((e) => e.field === "guests"));
  });
});

describe("SES SOAP client", () => {
  it("builds SOAP envelope with PV/A headers", () => {
    const envelope = buildSoapEnvelope("0000000001", "dGVzdA==");
    assert.match(envelope, /<tipoOperacion>A<\/tipoOperacion>/);
    assert.match(envelope, /<tipoComunicacion>PV<\/tipoComunicacion>/);
    assert.match(envelope, /<codigoArrendador>0000000001<\/codigoArrendador>/);
  });

  it("parses success response", () => {
    const parsed = parseSoapResponse(
      '<codigo>0</codigo><descripcion>Ok</descripcion><lote>abc-123</lote>'
    );
    assert.equal(parsed.success, true);
    assert.equal(parsed.governmentCode, "0");
    assert.equal(parsed.loteCode, "abc-123");
  });
});

describe("SES config dry-run defaults", () => {
  const original = process.env.SES_LIVE;

  it("defaults to dry-run when SES_LIVE is not true", () => {
    delete process.env.SES_LIVE;
    assert.equal(isSesLiveEnabled(), false);
    assert.equal(canSubmitLive(true), false);
  });

  it("allows live when SES_LIVE and user enabled", () => {
    process.env.SES_LIVE = "true";
    assert.equal(canSubmitLive(true), true);
    assert.equal(canSubmitLive(false), false);
    process.env.SES_LIVE = original;
  });
});
