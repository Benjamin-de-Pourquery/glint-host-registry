import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPrePurchaseReport } from "../report";
import type { PrePurchaseJourneyEvaluation } from "../types";

const baseEvaluation: PrePurchaseJourneyEvaluation = {
  rules: [
    {
      id: "verified-rule",
      category: "national_context",
      title: { en: "Verified", fr: "Vérifié" },
      summary: { en: "Summary", fr: "Résumé" },
      confidence: "official",
      sourceReviewedAt: "2026-09-30",
      officialUrls: [
        {
          url: "https://www.boe.es/buscar/act.php?id=BOE-A-2021-17461",
          label: { en: "BOE", fr: "BOE" },
          role: "rules",
          urlVerified: true,
        },
      ],
    },
    {
      id: "confirm-rule",
      category: "zoning",
      title: { en: "Zoning", fr: "Zonage" },
      confidence: "to_confirm",
      officialUrls: [],
      toConfirmQuestion: { en: "Ask city hall", fr: "Demander la mairie" },
    },
  ],
  flags: [],
  documents: [
    {
      id: "doc-1",
      title: { en: "Doc", fr: "Doc" },
      why: { en: "Why", fr: "Pourquoi" },
    },
  ],
  lookup: {
    status: "found",
    normalizedNumber: "HUTB-000001",
    datasetUpdatedAt: "2026-07-31",
    message: { en: "ok", fr: "ok" },
  },
};

describe("buildPrePurchaseReport", () => {
  it("includes verified, to confirm, documents, and questions sections", () => {
    const report = buildPrePurchaseReport(
      {
        country: "ES",
        region: "CT",
        municipality: "Barcelona",
        addressOrListing: "",
        licenceNumber: "HUTB-000001",
      },
      baseEvaluation
    );

    const ids = report.sections.map((s) => s.id);
    assert.deepEqual(ids, ["verified", "to_confirm", "documents", "questions"]);
    assert.equal(report.datasetUpdatedAt, "2026-07-31");
    assert.equal(report.sections[0].items.length, 1);
    assert.equal(report.sections[1].items.length, 1);
    assert.equal(report.questions.length, 3);
  });
});
