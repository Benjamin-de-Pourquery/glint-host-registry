import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("localized not-found routing", () => {
  it("includes a locale catch-all that triggers notFound()", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/[locale]/[...rest]/page.tsx"),
      "utf8"
    );
    assert.match(source, /notFound\(\)/);
  });
});
