import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("notFound copy", () => {
  for (const locale of ["en", "fr"] as const) {
    it(`includes bilingual notFound strings for ${locale}`, () => {
      const raw = readFileSync(join(process.cwd(), "messages", `${locale}.json`), "utf8");
      const messages = JSON.parse(raw) as {
        notFound: { title: string; description: string; homeCta: string };
      };
      assert.ok(messages.notFound.title.length > 0);
      assert.ok(messages.notFound.description.length > 0);
      assert.ok(messages.notFound.homeCta.length > 0);
      assert.doesNotMatch(messages.notFound.title, /[—–]/);
      assert.doesNotMatch(messages.notFound.description, /[—–]/);
    });
  }
});
