import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolvePlaybook } from "@/lib/playbooks";
import { getEffectiveNextStepForIreland } from "../next-action";

describe("Ireland playbooks", () => {
  it("resolves Dublin and national fallback", () => {
    assert.equal(resolvePlaybook("Ireland", "Dublin")?.id, "ie-dublin");
    assert.equal(resolvePlaybook("ie", "Cork")?.id, "ie-national");
  });
});

describe("getEffectiveNextStepForIreland", () => {
  it("prioritises register data before official registration", () => {
    const playbook = resolvePlaybook("Ireland", "Dublin")!;
    const step = getEffectiveNextStepForIreland(
      playbook,
      [],
      "primary",
      {
        country: "Ireland",
        city: "Dublin",
        isRegisterDataReady: false,
        hasIeStlNumber: false,
      }
    );
    assert.ok(step?.key.endsWith("-ie-register-data"));
  });
});
