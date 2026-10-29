import { readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const TSX = join(ROOT, "node_modules", ".bin", "tsx");

function collectTestFiles(dir) {
  /** @type {string[]} */
  const files = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const fullPath = join(dir, entry.name);
    if (entry.name === "__tests__") {
      for (const file of readdirSync(fullPath)) {
        if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) {
          files.push(join(fullPath, file));
        }
      }
      continue;
    }

    if (entry.name === "node_modules" || entry.name.startsWith(".")) {
      continue;
    }

    files.push(...collectTestFiles(fullPath));
  }

  return files;
}

const testFiles = collectTestFiles(SRC).sort();

if (testFiles.length === 0) {
  console.error("No test files found under src/");
  process.exit(1);
}

const relativeFiles = testFiles.map((file) => relative(ROOT, file));
console.error(`Running ${relativeFiles.length} test files (glob under src/**/__tests__)`);

const result = spawnSync(TSX, ["--test", ...relativeFiles], {
  cwd: ROOT,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
