import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getSpainGuestReportingMode,
  usesSesHospedajes,
  isRegionalSpainReporting,
  requiresAnnexOneCheckIn,
} from "../regions";

describe("Spain guest reporting mode routing", () => {
  it("routes Barcelona to mossos", () => {
    assert.equal(getSpainGuestReportingMode("Barcelona"), "mossos");
    assert.equal(usesSesHospedajes("Barcelona"), false);
    assert.equal(isRegionalSpainReporting("Barcelona"), true);
    assert.equal(requiresAnnexOneCheckIn("Barcelona"), true);
  });

  it("routes Girona province cities to mossos", () => {
    assert.equal(getSpainGuestReportingMode("Girona"), "mossos");
    assert.equal(getSpainGuestReportingMode("Tarragona"), "mossos");
  });

  it("routes Bilbao to ertzaintza", () => {
    assert.equal(getSpainGuestReportingMode("Bilbao"), "ertzaintza");
    assert.equal(usesSesHospedajes("Bilbao"), false);
    assert.equal(isRegionalSpainReporting("Bilbao"), true);
  });

  it("routes Donostia-San Sebastián to ertzaintza", () => {
    assert.equal(getSpainGuestReportingMode("Donostia"), "ertzaintza");
    assert.equal(getSpainGuestReportingMode("San Sebastián"), "ertzaintza");
  });

  it("routes Vitoria-Gasteiz to ertzaintza", () => {
    assert.equal(getSpainGuestReportingMode("Vitoria-Gasteiz"), "ertzaintza");
    assert.equal(getSpainGuestReportingMode("Vitoria"), "ertzaintza");
  });

  it("routes Madrid to ses", () => {
    assert.equal(getSpainGuestReportingMode("Madrid"), "ses");
    assert.equal(usesSesHospedajes("Madrid"), true);
    assert.equal(isRegionalSpainReporting("Madrid"), false);
    assert.equal(requiresAnnexOneCheckIn("Madrid"), true);
  });

  it("routes Valencia and Málaga to ses", () => {
    assert.equal(getSpainGuestReportingMode("Valencia"), "ses");
    assert.equal(getSpainGuestReportingMode("Málaga"), "ses");
  });

  it("uses region hint for Catalonia", () => {
    assert.equal(getSpainGuestReportingMode("Unknown", "Catalunya"), "mossos");
  });

  it("uses region hint for Euskadi", () => {
    assert.equal(getSpainGuestReportingMode("Unknown", "Euskadi"), "ertzaintza");
  });

  it("returns none for empty city", () => {
    assert.equal(getSpainGuestReportingMode(""), "none");
    assert.equal(requiresAnnexOneCheckIn(""), false);
  });
});
