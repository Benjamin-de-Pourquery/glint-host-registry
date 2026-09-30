import type { LocalizedText } from "@/lib/playbooks/types";
import { CATALONIA_TOURISM_REGISTER_OPEN_DATA_URL } from "@/lib/spain/official-links";
import type { RegisterLookupResult, RegisterLookupStatus } from "./types";

export const CATALONIA_REGISTER_DATASET_METADATA_URL =
  "https://analisi.transparenciacatalunya.cat/api/views/t2h3-cgys.json";

export const CATALONIA_REGISTER_SODA_BASE =
  "https://analisi.transparenciacatalunya.cat/resource/t2h3-cgys.json";

const SELECT_FIELDS =
  "tipus_establiment,n_mero_inscripci,estat,municipi,codi_postal,nom_de_la_via,numero,pis,porta";

type SocrataRow = {
  tipus_establiment?: string;
  n_mero_inscripci?: string;
  estat?: string;
  municipi?: string;
  codi_postal?: string;
  nom_de_la_via?: string;
  numero?: string;
  pis?: string;
  porta?: string;
};

export type RegisterLookupFetchers = {
  fetchRegisterRows: (normalizedNumber: string) => Promise<SocrataRow[]>;
  fetchDatasetUpdatedAt: () => Promise<string | null>;
};

const messages: Record<
  RegisterLookupStatus,
  (ctx: { normalized: string; datasetLabel?: string }) => LocalizedText
> = {
  found: ({ normalized }) => ({
    en: `Registration number ${normalized} appears in the Catalan tourism register open dataset.`,
    fr: `Le numéro ${normalized} figure dans le jeu de données ouvert du registre touristique catalan.`,
  }),
  not_found: ({ normalized, datasetLabel }) => ({
    en: `Number ${normalized} was not found in the ${datasetLabel} dataset. It may be recent, mistyped, or not registered: ask the seller to confirm on official channels.`,
    fr: `Le numéro ${normalized} est introuvable dans le jeu de données ${datasetLabel} ; il peut être récent, mal saisi ou inexistant : à faire confirmer auprès du vendeur sur les canaux officiels.`,
  }),
  uncertain: ({ normalized }) => ({
    en: `We could not confirm ${normalized} in the open dataset (timeout, format, status, or municipality mismatch). Treat as to confirm before relying on the listing number.`,
    fr: `Nous n'avons pas pu confirmer ${normalized} dans le jeu de données ouvert (délai, format, statut ou écart de municipalité). À faire confirmer avant de vous fier au numéro d'annonce.`,
  }),
};

const datasetLabel: LocalizedText = {
  en: "Registre de Turisme de Catalunya (open data)",
  fr: "Registre de Turisme de Catalunya (open data)",
};

/** Uppercase, trim, collapse spaces, ensure dash after HUTB prefix when digits follow. */
export function normalizeCataloniaLicenceNumber(raw: string): string | null {
  const compact = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!compact) return null;

  const match = compact.match(/^(HUTB|HUT|AT)-?(\d{1,12})$/);
  if (!match) return null;

  const prefix = match[1];
  const digits = match[2].padStart(6, "0");
  return `${prefix}-${digits}`;
}

function normalizeForAddressCompare(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function softAddressMatch(
  userAddress: string,
  record: SocrataRow
): LocalizedText | undefined {
  const userNorm = normalizeForAddressCompare(userAddress);
  if (!userNorm) return undefined;

  const street = record.nom_de_la_via ?? "";
  const number = record.numero ?? "";
  const haystack = normalizeForAddressCompare(`${street} ${number}`);
  if (!haystack) return undefined;

  if (userNorm.includes(haystack) || haystack.includes(userNorm)) {
    return {
      en: "The open data address appears consistent with what you typed (soft match only).",
      fr: "L'adresse open data semble cohérente avec votre saisie (correspondance indicative seulement).",
    };
  }

  return {
    en: "The open data address does not obviously match what you typed. Ask the seller to confirm the exact unit.",
    fr: "L'adresse open data ne correspond pas clairement à votre saisie. Demandez au vendeur de confirmer le lot exact.",
  };
}

export function buildSocrataQueryUrl(normalizedNumber: string): string {
  const escaped = normalizedNumber.replace(/'/g, "''");
  return `${CATALONIA_REGISTER_SODA_BASE}?$select=${SELECT_FIELDS}&$where=n_mero_inscripci='${escaped}'`;
}

export async function fetchDatasetUpdatedAtIso(
  fetchImpl: typeof fetch = fetch
): Promise<string | null> {
  try {
    const res = await fetchImpl(CATALONIA_REGISTER_DATASET_METADATA_URL, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { rowsUpdatedAt?: number };
    if (!json.rowsUpdatedAt) return null;
    return new Date(json.rowsUpdatedAt * 1000).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

export async function fetchRegisterRowsFromApi(
  normalizedNumber: string,
  fetchImpl: typeof fetch = fetch
): Promise<SocrataRow[]> {
  const url = buildSocrataQueryUrl(normalizedNumber);
  const res = await fetchImpl(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    throw new Error(`register_http_${res.status}`);
  }
  const rows = (await res.json()) as SocrataRow[];
  return Array.isArray(rows) ? rows : [];
}

export async function lookupCataloniaRegister(
  rawNumber: string,
  options: {
    userMunicipality?: string;
    userAddress?: string;
    fetchers?: RegisterLookupFetchers;
  } = {}
): Promise<RegisterLookupResult> {
  const fetchers: RegisterLookupFetchers = options.fetchers ?? {
    fetchRegisterRows: (n) => fetchRegisterRowsFromApi(n),
    fetchDatasetUpdatedAt: () => fetchDatasetUpdatedAtIso(),
  };

  const normalized = normalizeCataloniaLicenceNumber(rawNumber);
  const datasetUpdatedAt = await fetchers.fetchDatasetUpdatedAt();

  if (!normalized) {
    return {
      status: "uncertain",
      normalizedNumber: rawNumber.trim().toUpperCase(),
      datasetUpdatedAt,
      message: messages.uncertain({ normalized: rawNumber.trim() || "?" }),
    };
  }

  let rows: SocrataRow[];
  try {
    rows = await fetchers.fetchRegisterRows(normalized);
  } catch {
    return {
      status: "uncertain",
      normalizedNumber: normalized,
      datasetUpdatedAt,
      message: messages.uncertain({ normalized }),
    };
  }

  if (rows.length === 0) {
    return {
      status: "not_found",
      normalizedNumber: normalized,
      datasetUpdatedAt,
      message: messages.not_found({
        normalized,
        datasetLabel: datasetLabel.en,
      }),
    };
  }

  const row = rows[0];
  const statusValue = (row.estat ?? "").trim();

  const userMunicipality = options.userMunicipality?.trim();
  if (
    userMunicipality &&
    row.municipi &&
    normalizeForAddressCompare(userMunicipality) !==
      normalizeForAddressCompare(row.municipi)
  ) {
    return {
      status: "uncertain",
      normalizedNumber: normalized,
      datasetUpdatedAt,
      message: messages.uncertain({ normalized }),
    };
  }

  if (statusValue && statusValue.toLowerCase() !== "alta") {
    return {
      status: "uncertain",
      normalizedNumber: normalized,
      datasetUpdatedAt,
      message: messages.uncertain({ normalized }),
    };
  }

  const addressMatchNote = options.userAddress
    ? softAddressMatch(options.userAddress, row)
    : undefined;

  return {
    status: "found",
    normalizedNumber: normalized,
    datasetUpdatedAt,
    record: {
      registrationNumber: row.n_mero_inscripci ?? normalized,
      establishmentType: row.tipus_establiment ?? "",
      status: statusValue,
      municipality: row.municipi ?? "",
      postalCode: row.codi_postal ?? "",
      street: row.nom_de_la_via,
      streetNumber: row.numero,
      floor: row.pis,
      door: row.porta,
    },
    addressMatchNote,
    message: messages.found({ normalized }),
  };
}

export function openDataPortalLabel(): LocalizedText {
  return datasetLabel;
}

export function openDataPortalUrl(): string {
  return CATALONIA_TOURISM_REGISTER_OPEN_DATA_URL;
}
