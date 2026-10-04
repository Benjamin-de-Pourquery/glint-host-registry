import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolvePlaybook } from "@/lib/playbooks";
import {
  MALAGA_PGOU_PL07_EXEC_SUMMARY_PDF_URL,
  SEVILLE_VUT_BARRIO_CAP_URL,
} from "@/lib/spain/official-links";

describe("Andalucía city playbooks (municipal sources)", () => {
  it("Seville playbook cites Gerencia de Urbanismo barrio cap page", () => {
    const playbook = resolvePlaybook("Spain", "Seville")!;
    assert.equal(playbook.sourceReviewedAt, "2026-10-04");
    const municipal = playbook.steps.find((s) => s.key === "seville-municipal-dossier");
    assert.ok(municipal);
    assert.ok(
      municipal!.officialUrls?.some((u) => u.url === SEVILLE_VUT_BARRIO_CAP_URL),
    );
    assert.match(municipal!.instruction.en, /10%/);
    assert.match(municipal!.instruction.en, /108 barrios/);
  });

  it("Málaga playbook cites PL07-2026 executive summary and suspension", () => {
    const playbook = resolvePlaybook("Spain", "Málaga")!;
    assert.equal(playbook.sourceReviewedAt, "2026-10-04");
    const municipal = playbook.steps.find((s) => s.key === "malaga-municipal-dossier");
    assert.ok(municipal);
    assert.ok(
      municipal!.officialUrls?.some((u) => u.url === MALAGA_PGOU_PL07_EXEC_SUMMARY_PDF_URL),
    );
    assert.match(municipal!.instruction.en, /three years/i);
    assert.match(municipal!.instruction.en, /48 of 417 barrios/);
    assert.match(municipal!.instruction.en, /proposal in progress/i);
  });
});
