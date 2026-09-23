import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getBelgiumRegion,
  getBelgiumMode,
  isBelgiumCountry,
  normalizeBelgiumCity,
} from "../regions";
import { getGuestReportingJurisdiction } from "@/lib/guest-reporting/router";

describe("isBelgiumCountry", () => {
  it("recognizes country aliases", () => {
    assert.equal(isBelgiumCountry("Belgium"), true);
    assert.equal(isBelgiumCountry("be"), true);
    assert.equal(isBelgiumCountry("Belgique"), true);
    assert.equal(isBelgiumCountry("France"), false);
  });
});

describe("getBelgiumRegion", () => {
  it("routes Brussels city aliases", () => {
    assert.equal(getBelgiumRegion("Brussels"), "brussels");
    assert.equal(getBelgiumRegion("Bruxelles"), "brussels");
    assert.equal(getBelgiumRegion("Brussel"), "brussels");
  });

  it("routes Flanders cities", () => {
    assert.equal(getBelgiumRegion("Antwerp"), "flanders");
    assert.equal(getBelgiumRegion("Antwerpen"), "flanders");
    assert.equal(getBelgiumRegion("Ghent"), "flanders");
    assert.equal(getBelgiumRegion("Bruges"), "flanders");
    assert.equal(getBelgiumRegion("Leuven"), "flanders");
    assert.equal(getBelgiumRegion("Mechelen"), "flanders");
  });

  it("routes Wallonia cities", () => {
    assert.equal(getBelgiumRegion("Liège"), "wallonia");
    assert.equal(getBelgiumRegion("Liege"), "wallonia");
    assert.equal(getBelgiumRegion("Namur"), "wallonia");
    assert.equal(getBelgiumRegion("Charleroi"), "wallonia");
    assert.equal(getBelgiumRegion("Mons"), "wallonia");
    assert.equal(getBelgiumRegion("Tournai"), "wallonia");
  });

  it("uses region hints and postal codes", () => {
    assert.equal(getBelgiumRegion("Unknown", "Flanders"), "flanders");
    assert.equal(getBelgiumRegion("Unknown", "Wallonie"), "wallonia");
    assert.equal(getBelgiumRegion("Somewhere", null, "1000"), "brussels");
    assert.equal(getBelgiumRegion("Somewhere", null, "9000"), "flanders");
    assert.equal(getBelgiumRegion("Somewhere", null, "5000"), "wallonia");
  });

  it("returns unknown for unrecognized city", () => {
    assert.equal(getBelgiumRegion("Spa"), "unknown");
  });
});

describe("normalizeBelgiumCity", () => {
  it("normalizes aliases", () => {
    assert.equal(normalizeBelgiumCity("bruxelles"), "Brussels");
    assert.equal(normalizeBelgiumCity("antwerpen"), "Antwerp");
    assert.equal(normalizeBelgiumCity("liege"), "Liège");
  });
});

describe("getBelgiumMode", () => {
  it("returns registration ops mode", () => {
    assert.equal(getBelgiumMode("Brussels"), "registration");
  });
});

describe("guest reporting jurisdiction", () => {
  it("does not route Belgium to SES, SIBA, Alloggiati or eVisitor", () => {
    assert.equal(getGuestReportingJurisdiction("Belgium", "Brussels"), "none");
    assert.equal(getGuestReportingJurisdiction("be", "Antwerp"), "none");
    assert.notEqual(getGuestReportingJurisdiction("Belgium", "Brussels"), "spain_ses");
    assert.notEqual(getGuestReportingJurisdiction("Belgium", "Liège"), "croatia_evisitor");
  });
});
