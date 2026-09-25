import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RULE_KEYS } from "../keys";
import {
  buildSnapshotFromRows,
  resolveFrCommune90Cities,
  resolveFrNightCapLimit,
  resolveFromSnapshot,
  resolveNlAmsterdamNightCapLimit,
} from "../resolver";

describe("rule radar resolver", () => {
  it("falls back to hardcoded defaults when no rows exist", () => {
    const snapshot = buildSnapshotFromRows([]);
    assert.equal(
      resolveFromSnapshot(snapshot, RULE_KEYS.FR_NIGHT_CAP_STATUTORY_LIMIT, 0),
      120
    );
    assert.deepEqual(resolveFrCommune90Cities(snapshot), ["paris", "lyon", "nice"]);
  });

  it("uses newer effective row for the same key", () => {
    const snapshot = buildSnapshotFromRows([
      {
        key: RULE_KEYS.FR_NIGHT_CAP_STATUTORY_LIMIT,
        country: "FR",
        city: null,
        zone: null,
        residency: "primary",
        valueJson: "100",
        effectiveFrom: new Date("2024-01-01"),
        effectiveTo: null,
      },
      {
        key: RULE_KEYS.FR_NIGHT_CAP_STATUTORY_LIMIT,
        country: "FR",
        city: null,
        zone: null,
        residency: "primary",
        valueJson: "110",
        effectiveFrom: new Date("2025-01-01"),
        effectiveTo: null,
      },
    ]);

    assert.equal(
      resolveFromSnapshot(snapshot, RULE_KEYS.FR_NIGHT_CAP_STATUTORY_LIMIT, 120),
      110
    );
  });

  it("resolves Paris commune 90 cap from snapshot", () => {
    const snapshot = buildSnapshotFromRows([]);
    const paris = resolveFrNightCapLimit(snapshot, "Paris");
    assert.equal(paris.limit, 90);
    assert.equal(paris.source, "commune_90");

    const bordeaux = resolveFrNightCapLimit(snapshot, "Bordeaux");
    assert.equal(bordeaux.limit, 120);
    assert.equal(bordeaux.source, "statutory_120");
  });

  it("resolves Amsterdam wijk 15 cap from snapshot", () => {
    const snapshot = buildSnapshotFromRows([]);
    assert.equal(resolveNlAmsterdamNightCapLimit(snapshot, "jordaan"), 15);
    assert.equal(resolveNlAmsterdamNightCapLimit(snapshot, "other-wijk"), 30);
  });

  it("respects overridden wijk list in snapshot", () => {
    const snapshot = buildSnapshotFromRows([
      {
        key: RULE_KEYS.NL_AMSTERDAM_WIJK_15_ZONES,
        country: "NL",
        city: "Amsterdam",
        zone: null,
        residency: "primary",
        valueJson: JSON.stringify(["custom-wijk"]),
        effectiveFrom: new Date("2026-04-01"),
        effectiveTo: null,
      },
    ]);

    assert.equal(resolveNlAmsterdamNightCapLimit(snapshot, "custom-wijk"), 15);
    assert.equal(resolveNlAmsterdamNightCapLimit(snapshot, "jordaan"), 30);
  });

  it("ignores rows outside effective window", () => {
    const snapshot = buildSnapshotFromRows(
      [
        {
          key: RULE_KEYS.FR_NIGHT_CAP_STATUTORY_LIMIT,
          country: "FR",
          city: null,
          zone: null,
          residency: "primary",
          valueJson: "99",
          effectiveFrom: new Date("2030-01-01"),
          effectiveTo: null,
        },
      ],
      new Date("2026-01-01")
    );

    assert.equal(
      resolveFromSnapshot(snapshot, RULE_KEYS.FR_NIGHT_CAP_STATUTORY_LIMIT, 120),
      120
    );
  });
});
