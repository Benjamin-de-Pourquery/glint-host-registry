import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const en = JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8")) as Record<
  string,
  unknown
>;
const fr = JSON.parse(readFileSync(join(root, "messages/fr.json"), "utf8")) as Record<
  string,
  unknown
>;

function leafKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return prefix ? [prefix] : [];
  }
  const record = obj as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length === 0) {
    return prefix ? [prefix] : [];
  }
  return keys.flatMap((key) => {
    const next = prefix ? `${prefix}.${key}` : key;
    const value = record[key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      return leafKeys(value, next);
    }
    return [next];
  });
}

describe("Amsterdam guide message parity (en/fr)", () => {
  const guides = en.guides as Record<string, unknown>;
  const guidesFr = fr.guides as Record<string, unknown>;

  for (const namespace of ["amsterdamStrRegistration", "amsterdamAirbnbRegistration"]) {
    it(`${namespace} has matching leaf keys in en and fr`, () => {
      const enKeys = leafKeys(guides[namespace]).sort();
      const frKeys = leafKeys(guidesFr[namespace]).sort();
      assert.deepEqual(frKeys, enKeys);
    });
  }

  it("seo keys exist for all Amsterdam guide page ids", () => {
    const meta = en.seo as Record<string, unknown>;
    const metaFr = fr.seo as Record<string, unknown>;
    const ids = [
      "guideAmsterdamStrRegistration",
      "guideAmsterdamStrRegistrationFr",
      "guideAmsterdamAirbnbRegistration",
      "guideAmsterdamAirbnbRegistrationFr",
    ];
    for (const id of ids) {
      assert.ok(meta[id], `missing en seo.${id}`);
      assert.ok(metaFr[id], `missing fr seo.${id}`);
    }
  });
});
