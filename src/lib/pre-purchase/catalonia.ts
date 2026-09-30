import {
  CATALONIA_OPEN_DATA_PORTAL_URL,
  CATALONIA_TOURISM_REGISTER_OPEN_DATA_URL,
  MOSSOS_PORTAL_URL,
} from "@/lib/spain/official-links";
import type { ZoneRuleItem } from "./types";

const REVIEWED = "2026-09-30";

export const CATALONIA_LICENCES_INFO_URL =
  "https://administraciodigital.gencat.cat/ca/dades/dades-obertes/informacio-practica/llicencies/";

export const CATALONIA_PRE_PURCHASE_RULES: ZoneRuleItem[] = [
  {
    id: "ct-hut-register",
    category: "licence_regime",
    title: {
      en: "Catalonia tourism register (HUT / establishment number)",
      fr: "Registre de tourisme de Catalogne (HUT / numéro d'établissement)",
    },
    summary: {
      en: "The Generalitat publishes open data listing tourist accommodation establishments inscribed in the Registre de Turisme de Catalunya. Professional tourist accommodation providers appear on this list. Cross-check any HUT-style number against that dataset and official Generalitat channels.",
      fr: "La Generalitat publie des données ouvertes listant les établissements d'hébergement touristique inscrits au Registre de Turisme de Catalunya. Les professionnels de l'hébergement touristique figurent sur cette liste. Recoupez tout numéro de type HUT avec ce jeu de données et les canaux officiels Generalitat.",
    },
    confidence: "official",
    sourceReviewedAt: REVIEWED,
    officialUrls: [
      {
        url: CATALONIA_TOURISM_REGISTER_OPEN_DATA_URL,
        label: {
          en: "Catalan tourism register (open data)",
          fr: "Registre touristique catalan (open data)",
        },
        role: "info",
        urlVerified: true,
      },
      {
        url: CATALONIA_OPEN_DATA_PORTAL_URL,
        label: {
          en: "Generalitat open data portal",
          fr: "Portail open data Generalitat",
        },
        role: "info",
        urlVerified: true,
      },
      {
        url: CATALONIA_LICENCES_INFO_URL,
        label: {
          en: "Generalitat practical licences information",
          fr: "Informations pratiques licences Generalitat",
        },
        role: "info",
        urlVerified: true,
      },
    ],
  },
  {
    id: "ct-mossos-guest-reporting",
    category: "licence_regime",
    title: {
      en: "Guest reporting in Catalonia (Mossos Hotels)",
      fr: "Déclaration voyageurs en Catalogne (Mossos Hotels)",
    },
    summary: {
      en: "Tourist accommodation operators in Catalonia use the Mossos d'Esquadra guest register (Mossos Hotels), not SES.HOSPEDAJES. Confirm reporting obligations separately from purchase due diligence.",
      fr: "Les exploitants d'hébergement touristique en Catalogne passent par le registre voyageurs des Mossos d'Esquadra (Mossos Hotels), pas par SES.HOSPEDAJES. Vérifiez les obligations de déclaration en dehors de la due diligence d'achat.",
    },
    confidence: "official",
    sourceReviewedAt: REVIEWED,
    officialUrls: [
      {
        url: MOSSOS_PORTAL_URL,
        label: {
          en: "Mossos Hotels guest register portal",
          fr: "Portail registre voyageurs Mossos Hotels",
        },
        role: "portal",
        urlVerified: true,
      },
    ],
  },
  {
    id: "ct-licence-transferability",
    category: "transferability",
    title: {
      en: "Transfer of a tourist housing registration on sale",
      fr: "Transfert d'une inscription de logement touristique lors d'une vente",
    },
    confidence: "to_confirm",
    officialUrls: [
      {
        url: CATALONIA_LICENCES_INFO_URL,
        label: {
          en: "Generalitat licences information (starting point)",
          fr: "Informations licences Generalitat (point de départ)",
        },
        role: "info",
        urlVerified: true,
      },
    ],
    toConfirmQuestion: {
      en: "Ask the seller, the estate agent, and the Generalitat or municipality in writing whether the HUT inscription transfers with the property, requires a new file, or must be cancelled and re-applied. Do not assume the listing number stays valid after completion.",
      fr: "Demandez par écrit au vendeur, à l'agent et à la Generalitat ou la municipalité si l'inscription HUT suit le bien, exige un nouveau dossier ou doit être annulée puis redéposée. Ne supposez pas que le numéro d'annonce reste valable après la vente.",
    },
  },
  {
    id: "ct-minimum-stay",
    category: "minimum_stay",
    title: {
      en: "Minimum stay or use restrictions (Catalonia / municipality)",
      fr: "Durée minimale ou restrictions d'usage (Catalogne / municipalité)",
    },
    confidence: "to_confirm",
    officialUrls: [],
    toConfirmQuestion: {
      en: "Request the municipal urban planning certificate and any tourism conditions affecting minimum nights or authorised use for the exact address.",
      fr: "Demandez le certificat d'urbanisme municipal et toute condition touristique sur les nuits minimales ou l'usage autorisé pour l'adresse exacte.",
    },
  },
  {
    id: "ct-cap-moratorium",
    category: "caps",
    title: {
      en: "Municipal caps or moratoria on new tourist housing",
      fr: "Plafonds ou moratoires municipaux sur les logements touristiques",
    },
    confidence: "to_confirm",
    officialUrls: [],
    toConfirmQuestion: {
      en: "Ask the city planning department whether new tourist housing registrations are accepted for this building or zone, and whether any moratorium applies.",
      fr: "Interrogez le service d'urbanisme sur l'acceptation de nouvelles inscriptions touristiques pour cet immeuble ou cette zone, et sur d'éventuels moratoires.",
    },
  },
];
