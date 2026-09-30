import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { generateQuestionTemplates } from "../question-templates";
import { evaluatePrePurchaseJourney } from "../evaluate-journey";

describe("generateQuestionTemplates", () => {
  it("returns seller, syndic, and agent templates per locale", async () => {
    const input = {
      country: "ES" as const,
      region: "CT" as const,
      municipality: "Barcelona",
      addressOrListing: "Carrer Marina 306",
      licenceNumber: "HUTB-000001",
    };
    const evaluation = await evaluatePrePurchaseJourney(input, {
      fetchDatasetUpdatedAt: async () => "2026-07-31",
      fetchRegisterRows: async () => [
        {
          n_mero_inscripci: "HUTB-000001",
          estat: "Alta",
          municipi: "Barcelona",
        },
      ],
    });

    const templates = generateQuestionTemplates(input, evaluation);
    assert.equal(templates.length, 3);
    for (const role of ["seller", "syndic", "agent"]) {
      const tpl = templates.find((t) => t.role === role);
      assert.ok(tpl);
      assert.ok(tpl.body.en.includes("HUTB-000001"));
      assert.ok(tpl.body.fr.length > 40);
    }
  });
});

describe("pre-purchase 1b copy anti-dash", () => {
  const files = [
    "question-templates.ts",
    "report.ts",
    "signup-bridge.ts",
    "render-report-pdf.ts",
  ];

  it("no em or en dash in new 1b lib files", () => {
    const dir = join(process.cwd(), "src/lib/pre-purchase");
    for (const file of files) {
      const content = readFileSync(join(dir, file), "utf8");
      assert.ok(!content.includes("\u2014"), `${file} em dash`);
      assert.ok(!content.includes("\u2013"), `${file} en dash`);
    }
  });
});
