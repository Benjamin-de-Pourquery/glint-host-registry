import { BARCELONA_PRE_PURCHASE_RULES } from "./barcelona";
import { CATALONIA_PRE_PURCHASE_RULES } from "./catalonia";
import { lookupCataloniaRegister, type RegisterLookupFetchers } from "./register-lookup";
import { SPAIN_PRE_PURCHASE_RULES } from "./spain";
import type {
  DocumentToRequest,
  PrePurchaseFlag,
  PrePurchaseJourneyEvaluation,
  PrePurchaseJourneyInput,
  ZoneRuleItem,
} from "./types";
import { openDataPortalUrl } from "./register-lookup";

const BARCELONA_MUNICIPALITY_KEYS = ["barcelona", "barcelone"];

function isBarcelonaMunicipality(name: string): boolean {
  const norm = name.trim().toLowerCase();
  return BARCELONA_MUNICIPALITY_KEYS.some((k) => norm.includes(k));
}

function collectRules(input: PrePurchaseJourneyInput): ZoneRuleItem[] {
  const rules: ZoneRuleItem[] = [...SPAIN_PRE_PURCHASE_RULES];

  if (input.country !== "ES") {
    return rules;
  }

  if (input.region === "CT") {
    rules.push(...CATALONIA_PRE_PURCHASE_RULES);
    if (isBarcelonaMunicipality(input.municipality)) {
      rules.push(...BARCELONA_PRE_PURCHASE_RULES);
    }
  }

  return rules;
}

const BASE_DOCUMENTS: DocumentToRequest[] = [
  {
    id: "estatutos-actas",
    title: {
      en: "Community statutes and meeting minutes",
      fr: "Estatutos et procès-verbaux d'assemblée",
    },
    why: {
      en: "Check whether the comunidad de propietarios restricts tourist or short-term use.",
      fr: "Vérifier si la comunidad de propietarios restreint l'usage touristique ou de courte durée.",
    },
  },
  {
    id: "admin-certificate",
    title: {
      en: "Administrator certificate (administrador de fincas)",
      fr: "Certificat de l'administrador de fincas",
    },
    why: {
      en: "Confirm ongoing compliance and any fines or proceedings affecting the unit.",
      fr: "Confirmer la conformité en cours et d'éventuelles sanctions ou procédures sur le lot.",
    },
  },
  {
    id: "urban-certificate",
    title: {
      en: "Urban planning certificate for the address",
      fr: "Certificat urbanistique pour l'adresse",
    },
    why: {
      en: "Shows whether tourist housing is allowed for this cadastral reference and floor.",
      fr: "Indique si le logement touristique est autorisé pour cette référence cadastrale et cet étage.",
    },
  },
  {
    id: "hut-proof",
    title: {
      en: "HUT registration proof from the seller",
      fr: "Justificatif HUT du vendeur",
    },
    why: {
      en: "PDF or official letter matching the number you checked in the open data register.",
      fr: "PDF ou courrier officiel correspondant au numéro vérifié dans le registre open data.",
    },
  },
];

export async function evaluatePrePurchaseJourney(
  input: PrePurchaseJourneyInput,
  lookupFetchers?: RegisterLookupFetchers
): Promise<PrePurchaseJourneyEvaluation> {
  const rules = collectRules(input);
  const flags: PrePurchaseFlag[] = [];
  let lookup;

  if (input.country !== "ES") {
    flags.push({
      level: "orange",
      code: "country_not_spain",
      title: {
        en: "Spain-only preview",
        fr: "Aperçu limité à l'Espagne",
      },
      detail: {
        en: "This journey currently covers Spain (Catalonia focus). Other countries are not covered yet.",
        fr: "Ce parcours couvre pour l'instant l'Espagne (focus Catalogne). Les autres pays ne sont pas encore couverts.",
      },
    });
  } else if (input.region !== "CT") {
    flags.push({
      level: "orange",
      code: "region_not_catalonia",
      title: {
        en: "Autonomous community not covered yet",
        fr: "Communauté autonome non couverte pour l'instant",
      },
      detail: {
        en: "Only Catalonia has structured zone rules and register lookup in this release. Other Spanish regions: not covered yet.",
        fr: "Seule la Catalogne dispose de règles de zone structurées et de la recherche registre dans cette version. Autres régions espagnoles : non couvert pour l'instant.",
      },
    });
  }

  const licence = input.licenceNumber.trim();
  if (!licence) {
    flags.push({
      level: "red",
      code: "missing_licence_number",
      title: {
        en: "No licence / HUT number provided",
        fr: "Aucun numéro de licence / HUT saisi",
      },
      detail: {
        en: `Ask the seller for the HUT or establishment number and cross-check it in the Catalan open data register (${openDataPortalUrl()}).`,
        fr: `Demandez au vendeur le numéro HUT ou d'établissement et recoupez-le dans le registre open data catalan (${openDataPortalUrl()}).`,
      },
    });
  } else if (input.region === "CT") {
    lookup = await lookupCataloniaRegister(licence, {
      userMunicipality: input.municipality,
      userAddress: input.addressOrListing,
      fetchers: lookupFetchers,
    });

    if (lookup.status === "not_found") {
      flags.push({
        level: "orange",
        code: "register_not_found",
        title: {
          en: "Number not in open data register",
          fr: "Numéro absent du registre open data",
        },
        detail: lookup.message,
      });
    } else if (lookup.status === "uncertain") {
      flags.push({
        level: "verify",
        code: "register_uncertain",
        title: {
          en: "Register lookup inconclusive",
          fr: "Recherche registre non concluante",
        },
        detail: lookup.message,
      });
    } else if (lookup.addressMatchNote) {
      flags.push({
        level: "verify",
        code: "address_soft_match",
        title: {
          en: "Check address match",
          fr: "Vérifier la correspondance d'adresse",
        },
        detail: lookup.addressMatchNote,
      });
    }
  }

  flags.push({
    level: "verify",
    code: "co_ownership",
    title: {
      en: "Co-ownership rules not publicly verifiable",
      fr: "Règles de copropriété non vérifiables publiquement",
    },
    detail: {
      en: "Request estatutos, actas, and an administrator certificate. Glint cannot see community bans in the tourism register.",
      fr: "Demandez estatutos, actas et un certificat d'administrador. Glint ne voit pas les interdictions de copropriété dans le registre touristique.",
    },
  });

  return {
    rules,
    flags,
    documents: BASE_DOCUMENTS,
    lookup,
  };
}
