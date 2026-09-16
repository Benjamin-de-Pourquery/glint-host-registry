import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildSchedinaLine,
  SCHEDINA_LINE_LENGTH,
  validateSchedinaLine,
} from "../schedina";

const sampleGuest = {
  id: "g1",
  lastName: "ROSSI",
  firstNames: "PAOLO",
  dateOfBirth: new Date("1973-03-13"),
  placeOfBirth: "ROMA",
  nationality: "ITALIA",
  usualAddress: "Via Roma 1",
  mobile: "+393331234567",
  email: "p@example.com",
  arrivalDate: new Date("2005-02-16"),
  departureDate: new Date("2005-02-18"),
  documentType: "CI",
  documentNumber: "AA1234567",
  sex: "M",
  postalCode: "00100",
  municipalityName: "058091",
  addressCountryAlpha3: "100000100",
  accompanyingChildrenJson: null,
};

describe("alloggiati schedina", () => {
  it("builds exactly 168 characters", () => {
    const line = buildSchedinaLine({ guest: sampleGuest });
    assert.equal(line.length, SCHEDINA_LINE_LENGTH);
    assert.equal(validateSchedinaLine(line), true);
  });

  it("starts with tipo alloggiato 16 (Ospite Singolo)", () => {
    const line = buildSchedinaLine({ guest: sampleGuest });
    assert.equal(line.slice(0, 2), "16");
  });

  it("encodes sex as 1 (M) or 2 (F)", () => {
    const male = buildSchedinaLine({ guest: sampleGuest });
    assert.equal(male.charAt(94), "1");

    const female = buildSchedinaLine({
      guest: { ...sampleGuest, sex: "F" },
    });
    assert.equal(female.charAt(94), "2");
  });

  it("maps Glint document type CI to IDENT", () => {
    const line = buildSchedinaLine({ guest: sampleGuest });
    assert.equal(line.slice(134, 139), "IDENT");
  });

  it("formats arrival date as dd/MM/yyyy", () => {
    const line = buildSchedinaLine({ guest: sampleGuest });
    assert.equal(line.slice(2, 12), "16/02/2005");
  });
});
