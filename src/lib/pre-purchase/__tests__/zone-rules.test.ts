import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { BARCELONA_PRE_PURCHASE_RULES } from "../barcelona";
import { CATALONIA_PRE_PURCHASE_RULES } from "../catalonia";
import { SPAIN_PRE_PURCHASE_RULES } from "../spain";
import type { ZoneRuleItem } from "../types";

const ALL_RULES: ZoneRuleItem[] = [
  ...SPAIN_PRE_PURCHASE_RULES,
  ...CATALONIA_PRE_PURCHASE_RULES,
  ...BARCELONA_PRE_PURCHASE_RULES,
];

function assertRuleCompliance(rule: ZoneRuleItem) {
  if (rule.confidence === "to_confirm") {
    assert.ok(
      rule.toConfirmQuestion?.en && rule.toConfirmQuestion.fr,
      `${rule.id} must have toConfirmQuestion`
    );
    return;
  }
  assert.ok(rule.summary?.en && rule.summary?.fr, `${rule.id} must have summary`);
  assert.ok(rule.sourceReviewedAt, `${rule.id} must have sourceReviewedAt`);
  assert.ok(rule.officialUrls.length >= 1, `${rule.id} must have official URL`);
}

describe("pre-purchase zone rules", () => {
  it("every published rule has sources or is to_confirm", () => {
    for (const rule of ALL_RULES) {
      assertRuleCompliance(rule);
    }
  });

  it("includes Barcelona rules when municipality is Barcelona", async () => {
    const { evaluatePrePurchaseJourney } = await import("../evaluate-journey");
    const evaluation = await evaluatePrePurchaseJourney({
      country: "ES",
      region: "CT",
      municipality: "Barcelona",
      addressOrListing: "",
      licenceNumber: "",
    });
    const ids = evaluation.rules.map((r) => r.id);
    assert.ok(ids.includes("bcn-hta-plan"));
  });
});

describe("pre-purchase copy anti-dash", () => {
  const dir = join(process.cwd(), "src/lib/pre-purchase");
  const files = readdirSync(dir, { recursive: true }) as string[];

  it("no em or en dash in pre-purchase lib ts files", () => {
    for (const file of files) {
      if (!String(file).endsWith(".ts")) continue;
      const content = readFileSync(join(dir, String(file)), "utf8");
      assert.ok(!content.includes("\u2014"), `${file} contains em dash`);
      assert.ok(!content.includes("\u2013"), `${file} contains en dash`);
    }
  });
});
