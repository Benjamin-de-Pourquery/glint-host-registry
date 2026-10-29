import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { frNerMigrationPatchSchema } from "../patch-schema";

describe("frNerMigrationPatchSchema", () => {
  it("accepts ISO timestamps and YYYY-MM-DD dates", () => {
    const parsed = frNerMigrationPatchSchema.safeParse({
      nerIssuedAt: "2026-01-15",
      transitionEndsAt: "2026-12-31T00:00:00.000Z",
    });
    assert.equal(parsed.success, true);
  });

  it("rejects invalid date strings", () => {
    for (const nerIssuedAt of ["not-a-date", "2026-13-01", "2026-02-31"]) {
      const parsed = frNerMigrationPatchSchema.safeParse({ nerIssuedAt });
      assert.equal(parsed.success, false, `expected reject for ${nerIssuedAt}`);
    }
  });
});
