import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSocrataQueryUrl,
  lookupCataloniaRegister,
  normalizeCataloniaLicenceNumber,
} from "../register-lookup";

describe("normalizeCataloniaLicenceNumber", () => {
  it("uppercases and inserts dash for HUTB", () => {
    assert.equal(normalizeCataloniaLicenceNumber(" hutb 1 "), "HUTB-000001");
    assert.equal(normalizeCataloniaLicenceNumber("HUTB123456"), "HUTB-123456");
  });

  it("rejects malformed values", () => {
    assert.equal(normalizeCataloniaLicenceNumber(""), null);
    assert.equal(normalizeCataloniaLicenceNumber("FOO-1"), null);
  });
});

describe("lookupCataloniaRegister", () => {
  const datasetDate = "2026-07-31";

  it("returns found for matching row in Alta", async () => {
    const result = await lookupCataloniaRegister("HUTB-000001", {
      userMunicipality: "Barcelona",
      fetchers: {
        fetchDatasetUpdatedAt: async () => datasetDate,
        fetchRegisterRows: async () => [
          {
            n_mero_inscripci: "HUTB-000001",
            estat: "Alta",
            municipi: "Barcelona",
            tipus_establiment: "Habitatges d'ús turístic",
            codi_postal: "08025",
            nom_de_la_via: "Marina",
            numero: "306",
          },
        ],
      },
    });
    assert.equal(result.status, "found");
    assert.equal(result.normalizedNumber, "HUTB-000001");
    assert.equal(result.datasetUpdatedAt, datasetDate);
  });

  it("returns not_found for empty rows", async () => {
    const result = await lookupCataloniaRegister("HUTB-999999", {
      fetchers: {
        fetchDatasetUpdatedAt: async () => datasetDate,
        fetchRegisterRows: async () => [],
      },
    });
    assert.equal(result.status, "not_found");
  });

  it("returns uncertain on fetch error", async () => {
    const result = await lookupCataloniaRegister("HUTB-000001", {
      fetchers: {
        fetchDatasetUpdatedAt: async () => datasetDate,
        fetchRegisterRows: async () => {
          throw new Error("timeout");
        },
      },
    });
    assert.equal(result.status, "uncertain");
  });

  it("returns uncertain on municipality mismatch", async () => {
    const result = await lookupCataloniaRegister("HUTB-000001", {
      userMunicipality: "Girona",
      fetchers: {
        fetchDatasetUpdatedAt: async () => datasetDate,
        fetchRegisterRows: async () => [
          { n_mero_inscripci: "HUTB-000001", estat: "Alta", municipi: "Barcelona" },
        ],
      },
    });
    assert.equal(result.status, "uncertain");
  });
});

describe("buildSocrataQueryUrl", () => {
  it("escapes licence in where clause", () => {
    const url = buildSocrataQueryUrl("HUTB-000001");
    assert.match(url, /HUTB-000001/);
    assert.match(url, /n_mero_inscripci/);
  });
});
