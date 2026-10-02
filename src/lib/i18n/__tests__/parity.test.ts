import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

describe("i18n en/fr parity", () => {
  it("de.monteurKit keys match between en and fr", () => {
    const en = JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8")) as Record<
      string,
      unknown
    >;
    const fr = JSON.parse(readFileSync(join(root, "messages/fr.json"), "utf8")) as Record<
      string,
      unknown
    >;
    const enDe = en.de as Record<string, unknown>;
    const frDe = fr.de as Record<string, unknown>;
    const enKeys = flattenKeys((enDe.monteurKit ?? {}) as Record<string, unknown>, "de.monteurKit");
    const frKeys = flattenKeys((frDe.monteurKit ?? {}) as Record<string, unknown>, "de.monteurKit");
    const enSet = new Set(enKeys);
    const frSet = new Set(frKeys);
    const missingInFr = enKeys.filter((k) => !frSet.has(k));
    const missingInEn = frKeys.filter((k) => !enSet.has(k));
    assert.deepEqual(missingInFr, [], `Missing in fr: ${missingInFr.join(", ")}`);
    assert.deepEqual(missingInEn, [], `Missing in en: ${missingInEn.join(", ")}`);
  });
});
