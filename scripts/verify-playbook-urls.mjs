#!/usr/bin/env node
/**
 * Verifies playbook officialUrls return HTTP 200 (or redirect to 200).
 * Run: npm run verify-playbook-urls
 *
 * Exit code 0 when all urlVerified:true links respond with 200.
 * Exit code 1 when a verified URL fails or urlVerified disagrees with HTTP status.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const PLAYBOOK_FILES = [
  "src/lib/playbooks/france.ts",
  "src/lib/playbooks/international.ts",
];

const USER_AGENT =
  "GlintHostRegistry-URLCheck/1.0 (+https://github.com/Benjamin-de-Pourquery/glint-host-registry)";

function extractUrlConstants(source) {
  const constants = new Map();
  const constRegex = /const\s+(\w+)\s*=\s*"([^"]+)"/g;
  let match;
  while ((match = constRegex.exec(source)) !== null) {
    if (match[2].startsWith("http")) {
      constants.set(match[1], match[2]);
    }
  }
  return constants;
}

function resolveUrl(raw, constants) {
  if (raw.startsWith("http")) return raw;
  return constants.get(raw) ?? raw;
}

function extractOfficialUrls(source) {
  const entries = [];
  const constants = extractUrlConstants(source);

  const blockRegex =
    /url:\s*("([^"]+)"|(\w+))[\s\S]*?urlVerified:\s*(true|false)/g;
  let match;
  while ((match = blockRegex.exec(source)) !== null) {
    const raw = match[2] ?? match[3];
    const url = resolveUrl(raw, constants);
    if (!url.startsWith("http")) continue;
    entries.push({ url, urlVerified: match[4] === "true" });
  }
  return entries;
}

async function fetchStatus(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(20_000),
    });
    return response.status;
  } catch (error) {
    return error instanceof Error ? `ERR:${error.message}` : "ERR:unknown";
  }
}

function isOkStatus(status) {
  return status === 200;
}

async function main() {
  const allEntries = [];

  for (const relativePath of PLAYBOOK_FILES) {
    const absolutePath = join(root, relativePath);
    const source = readFileSync(absolutePath, "utf8");
    for (const entry of extractOfficialUrls(source)) {
      allEntries.push({ ...entry, file: relativePath });
    }
  }

  const uniqueUrls = [...new Set(allEntries.map((entry) => entry.url))];
  const statusByUrl = new Map();

  console.log(`Checking ${uniqueUrls.length} unique official URLs...\n`);

  for (const url of uniqueUrls) {
    const status = await fetchStatus(url);
    statusByUrl.set(url, status);
    console.log(`${status}\t${url}`);
  }

  console.log("\n--- Validation ---\n");

  let failures = 0;

  for (const entry of allEntries) {
    const status = statusByUrl.get(entry.url);
    const ok = isOkStatus(status);

    if (entry.urlVerified && !ok) {
      failures++;
      console.log(
        `FAIL verified but not HTTP 200: ${entry.url} (${status}) [${entry.file}]`
      );
    }

    if (!entry.urlVerified && ok) {
      console.log(
        `WARN unverified but HTTP 200 — consider urlVerified:true: ${entry.url} [${entry.file}]`
      );
    }
  }

  if (failures > 0) {
    console.log(`\n${failures} verified URL(s) failed the HTTP 200 check.`);
    process.exit(1);
  }

  console.log("\nAll urlVerified:true entries returned HTTP 200.");
}

main();
