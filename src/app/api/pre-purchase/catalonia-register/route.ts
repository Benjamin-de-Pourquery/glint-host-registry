import { NextResponse } from "next/server";
import {
  lookupCataloniaRegister,
  fetchDatasetUpdatedAtIso,
  fetchRegisterRowsFromApi,
} from "@/lib/pre-purchase/register-lookup";

type CacheEntry = {
  expiresAt: number;
  payload: Awaited<ReturnType<typeof lookupCataloniaRegister>>;
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

function cacheKey(licence: string, municipality: string, address: string): string {
  return `${licence}|${municipality}|${address}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const licence = searchParams.get("licence") ?? searchParams.get("license") ?? "";
  const municipality = searchParams.get("municipality") ?? "";
  const address = searchParams.get("address") ?? "";

  if (!licence.trim()) {
    return NextResponse.json({ error: "licence_required" }, { status: 400 });
  }

  const key = cacheKey(licence.trim(), municipality.trim(), address.trim());
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) {
    return NextResponse.json(hit.payload, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  }

  const payload = await lookupCataloniaRegister(licence, {
    userMunicipality: municipality,
    userAddress: address,
    fetchers: {
      fetchRegisterRows: (n) => fetchRegisterRowsFromApi(n),
      fetchDatasetUpdatedAt: () => fetchDatasetUpdatedAtIso(),
    },
  });

  cache.set(key, { expiresAt: now + CACHE_TTL_MS, payload });

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
