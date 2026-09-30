import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

describe("pre-purchase sitemap", () => {
  it("includes EN and FR journey URLs", () => {
    const sitemap = readFileSync(join(process.cwd(), "src/app/sitemap.ts"), "utf8");
    assert.match(sitemap, /str-pre-purchase-journey/);
    assert.match(sitemap, /parcours-achat-location-courte-duree/);
  });
});
