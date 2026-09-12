import { lookup } from "dns/promises";
import { isIP } from "net";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_BODY_BYTES = 2 * 1024 * 1024;

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
]);

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;

  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80:")) return true;
  if (normalized.startsWith("::ffff:")) {
    const mapped = normalized.slice("::ffff:".length);
    if (isIP(mapped) === 4) return isPrivateIpv4(mapped);
  }
  return false;
}

function isBlockedIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIpv4(ip);
  if (version === 6) return isPrivateIpv6(ip);
  return true;
}

export function validateCalendarFeedUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Calendar feed URL must use HTTPS");
  }

  if (!parsed.hostname) {
    throw new Error("Invalid calendar feed hostname");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost")) {
    throw new Error("Calendar feed hostname is not allowed");
  }

  if (isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new Error("Calendar feed URL points to a private network address");
    }
    return parsed;
  }

  return parsed;
}

async function assertResolvablePublicHost(hostname: string): Promise<void> {
  if (isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new Error("Calendar feed URL points to a private network address");
    }
    return;
  }

  const records = await lookup(hostname, { all: true });
  if (records.length === 0) {
    throw new Error("Calendar feed hostname could not be resolved");
  }

  for (const record of records) {
    if (isBlockedIp(record.address)) {
      throw new Error("Calendar feed URL resolves to a private network address");
    }
  }
}

export async function fetchCalendarFeedText(url: string): Promise<string> {
  const parsed = validateCalendarFeedUrl(url);
  await assertResolvablePublicHost(parsed.hostname);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/calendar, text/plain, */*",
        "User-Agent": "Glint-Host-Registry/1.0 CalendarSync",
      },
    });

    if (!response.ok) {
      throw new Error(`Calendar feed returned HTTP ${response.status}`);
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      throw new Error("Calendar feed exceeds the maximum allowed size");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Calendar feed response had no body");
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        throw new Error("Calendar feed exceeds the maximum allowed size");
      }
      chunks.push(value);
    }

    const combined = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return new TextDecoder("utf-8", { fatal: false }).decode(combined);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Calendar feed request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
