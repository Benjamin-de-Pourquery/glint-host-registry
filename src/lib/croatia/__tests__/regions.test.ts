import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isCroatiaCountry,
  getCroatiaGuestReportingMode,
  requiresEvisitorCheckIn,
  normalizeCroatiaCity,
} from "../regions";

describe("isCroatiaCountry", () => {
  it("recognises Croatia country variants", () => {
    assert.equal(isCroatiaCountry("Croatia"), true);
    assert.equal(isCroatiaCountry("HR"), true);
    assert.equal(isCroatiaCountry("hrvatska"), true);
    assert.equal(isCroatiaCountry("France"), false);
  });
});

describe("getCroatiaGuestReportingMode", () => {
  it("returns evisitor when city is set", () => {
    assert.equal(getCroatiaGuestReportingMode("Dubrovnik"), "evisitor");
    assert.equal(getCroatiaGuestReportingMode("Split"), "evisitor");
    assert.equal(getCroatiaGuestReportingMode("Zagreb"), "evisitor");
  });

  it("returns none when city is empty", () => {
    assert.equal(getCroatiaGuestReportingMode(""), "none");
  });
});

describe("requiresEvisitorCheckIn", () => {
  it("requires check-in for Croatian cities", () => {
    assert.equal(requiresEvisitorCheckIn("Dubrovnik"), true);
    assert.equal(requiresEvisitorCheckIn(""), false);
  });
});

describe("normalizeCroatiaCity", () => {
  it("normalises city aliases", () => {
    assert.equal(normalizeCroatiaCity("dubrovnik"), "Dubrovnik");
    assert.equal(normalizeCroatiaCity("split-dalmatia"), "Split");
  });
});
