import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RULE_KEYS } from "../keys";
import { buildSnapshotFromRows, resolveFrNightCapLimit } from "../resolver";
import {
  computePropertyNightCapFromSettings,
  resolveNightCapSettingsForProperty,
} from "../night-cap-integration";

describe("rule radar impact helpers", () => {
  it("detects lower night cap after rule snapshot update", async () => {
    const beforeSnapshot = buildSnapshotFromRows([]);
    const afterSnapshot = buildSnapshotFromRows([
      {
        key: RULE_KEYS.FR_NIGHT_CAP_COMMUNE_90_CITIES,
        country: "FR",
        city: null,
        zone: null,
        residency: "primary",
        valueJson: JSON.stringify(["paris", "lyon", "nice", "bordeaux"]),
        effectiveFrom: new Date("2026-06-01"),
        effectiveTo: null,
      },
    ]);

    const stays = [
      {
        checkInDate: new Date(2026, 0, 1),
        checkOutDate: new Date(2026, 0, 31),
        importStatus: null,
      },
    ];

    const beforeSettings = await resolveNightCapSettingsForProperty(
      {
        country: "France",
        city: "Bordeaux",
        residencyStatus: "primary",
      },
      beforeSnapshot
    );
    const afterSettings = await resolveNightCapSettingsForProperty(
      {
        country: "France",
        city: "Bordeaux",
        residencyStatus: "primary",
      },
      afterSnapshot
    );

    const before = computePropertyNightCapFromSettings(stays, {
      country: "France",
      city: "Bordeaux",
      residencyStatus: "primary",
      settings: beforeSettings,
    });
    const after = computePropertyNightCapFromSettings(stays, {
      country: "France",
      city: "Bordeaux",
      residencyStatus: "primary",
      settings: afterSettings,
    });

    assert.equal(before?.limit, 120);
    assert.equal(after?.limit, 90);
    assert.equal(resolveFrNightCapLimit(afterSnapshot, "Bordeaux").limit, 90);
  });

  it("applies Amsterdam 15-night wijk cap from snapshot", async () => {
    const snapshot = buildSnapshotFromRows([]);
    const settings = await resolveNightCapSettingsForProperty(
      {
        country: "Netherlands",
        city: "Amsterdam",
        residencyStatus: "primary",
        wijkKey: "jordaan",
      },
      snapshot
    );

    assert.equal(settings.nightCapLimit, 15);
  });
});
