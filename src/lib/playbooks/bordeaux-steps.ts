import type { Playbook, PlaybookStep } from "./types";

export const BORDEAUX_OWNER_GUIDE_URL =
  "https://www.bordeaux.fr/location-touristique-bordeaux--guide-proprietaires";
export const BORDEAUX_URBANISME_URL =
  "https://www.bordeaux.fr/les-demarches-durbanisme-a-bordeaux";
export const BORDEAUX_REGLEMENT_PDF_URL =
  "https://www.bordeaux.fr/sites/bor-bdxfr-drupal/files/2026-04/reglement-changement-usage.pdf";
export const BORDEAUX_FORMULAIRE_UB_PDF_URL =
  "https://www.bordeaux.fr/sites/bor-bdxfr-drupal/files/2026-03/formulaire-de-demande-ub-v2.pdf";
export const BORDEAUX_PORTAL_URL = "https://taxedesejour.bordeaux-metropole.fr/";
export const BORDEAUX_USAGE_EMAIL = "usagebordeaux@bordeaux-metropole.fr";

export function buildBordeauxPlaybookSteps(
  frSteps: {
    taxDeclaration: (cityKey: string) => PlaybookStep;
    updateListings: (cityKey: string) => PlaybookStep;
    guestRegister: (cityKey: string) => PlaybookStep;
  }
): PlaybookStep[] {
  return [
    {
      key: "bordeaux-verify-rules",
      title: {
        en: "Pick your Bordeaux situation",
        fr: "Identifier votre situation bordelaise",
      },
      instruction: {
        en: `Ville de Bordeaux rules (bordeaux.fr and règlement in force 1 April 2026, checked October 2026): (1) Primary residence: up to 90 tourist nights per calendar year without prior change-of-use authorisation; declaration and registration number still mandatory on taxedesejour.bordeaux-metropole.fr (portal scope: city of Bordeaux only). (2) Non-primary (secondary or other): real and definitive change-of-use authorisation with compensation before renting, using formulaire UB (urbanisme page). (3) Social housing: change-of-use from social units is prohibited (règlement art. 1.2). Add bordeaux:social-housing in property notes if this applies. For compensation sector A/B/C, add bordeaux:secteur-a, bordeaux:secteur-b or bordeaux:secteur-c in notes (Annexe 1 map on bordeaux.fr). The owner guide (February 2026) may lag the urbanisme page on secteur A reinforced compensation; prefer the urbanisme page and règlement PDF for secteur A double surface since 1 April 2026. Host Registry, by Glint, prepares checklists. We never file with the city for you.`,
        fr: `Règles Ville de Bordeaux (bordeaux.fr et règlement au 1er avril 2026, vérifiées en octobre 2026) : (1) Résidence principale : jusqu'à 90 nuitées touristiques par an civile sans autorisation préalable de changement d'usage ; déclaration et numéro d'enregistrement obligatoires sur taxedesejour.bordeaux-metropole.fr (portail : uniquement la ville de Bordeaux). (2) Hors résidence principale : autorisation réelle et définitive de changement d'usage avec compensation avant location, via formulaire UB (page urbanisme). (3) Logement social : changement d'usage interdit (règlement art. 1.2). Ajoutez bordeaux:social-housing dans les notes si applicable. Pour les secteurs A/B/C de compensation, ajoutez bordeaux:secteur-a, bordeaux:secteur-b ou bordeaux:secteur-c (carte Annexe 1). Le guide propriétaires (février 2026) peut être en retard sur la page urbanisme pour la compensation renforcée secteur A ; privilégiez urbanisme + règlement PDF (surface double depuis le 1er avril 2026). Host Registry, par Glint, prépare les checklists. Nous ne déposons rien pour vous.`,
      },
      officialUrls: [
        {
          url: BORDEAUX_OWNER_GUIDE_URL,
          label: {
            en: "City of Bordeaux: tourist rental owner guide",
            fr: "Ville de Bordeaux : guide propriétaires location touristique",
          },
          role: "rules",
          urlVerified: true,
        },
        {
          url: BORDEAUX_URBANISME_URL,
          label: {
            en: "City of Bordeaux: urbanisme and change-of-use (formulaire UB)",
            fr: "Ville de Bordeaux : urbanisme et changement d'usage (formulaire UB)",
          },
          role: "info",
          urlVerified: true,
        },
        {
          url: BORDEAUX_REGLEMENT_PDF_URL,
          label: {
            en: "Change-of-use règlement (PDF, 1 Apr 2026)",
            fr: "Règlement changement d'usage (PDF, 1er avr. 2026)",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: [
          "Primary vs non-primary residence",
          "Optional notes: bordeaux:secteur-a/b/c, bordeaux:social-housing",
          "Postal code for Bordeaux commune (portal is city-only)",
        ],
        fr: [
          "Résidence principale ou hors principale",
          "Notes optionnelles : bordeaux:secteur-a/b/c, bordeaux:social-housing",
          "Code postal commune de Bordeaux (portail ville uniquement)",
        ],
      },
      appliesWhen: "always",
      fieldHints: ["address", "city", "country", "postalCode", "propertyType", "residencyStatus", "notes"],
    },
    {
      key: "bordeaux-optional-room-in-primary",
      title: {
        en: "Optional: renting a room in your primary home",
        fr: "Option : chambre dans votre résidence principale",
      },
      instruction: {
        en: "The owner guide states that renting a room inside your primary home (not the whole unit as a meublé de tourisme) does not require a registration number and has no duration limit. This is distinct from whole-unit furnished tourist rental. Host Registry does not run a separate compliance path for room-only lets; confirm your layout with the city if unsure.",
        fr: "Le guide propriétaires indique que la location d'une chambre dans votre résidence principale (et non la totalité du logement en meublé de tourisme) ne nécessite pas de numéro d'enregistrement et n'a pas de limite de durée. Distinct de la location de la totalité en meublé touristique. Host Registry ne propose pas de parcours dédié chambre seule ; confirmez avec la Ville en cas de doute.",
      },
      officialUrls: [
        {
          url: BORDEAUX_OWNER_GUIDE_URL,
          label: {
            en: "Owner guide: room in primary home",
            fr: "Guide propriétaires : chambre en résidence principale",
          },
          role: "info",
          urlVerified: true,
        },
      ],
      documents: { en: [], fr: [] },
      appliesWhen: "bordeauxRoomInPrimary",
      fieldHints: ["notes", "residencyStatus", "propertyType"],
    },
    {
      key: "bordeaux-optional-chambre-hote",
      title: {
        en: "Optional: chambre d'hôte rules (high level)",
        fr: "Option : règles chambre d'hôte (synthèse)",
      },
      instruction: {
        en: "The owner guide describes chambres d'hôtes: primary residence, breakfast required, caps on guests and rooms. This product path focuses on whole-unit meublés de tourisme. Check the owner guide and copropriété rules before operating a chambre d'hôte.",
        fr: "Le guide propriétaires décrit les chambres d'hôtes : résidence principale, petit-déjeuner obligatoire, plafonds d'invités et de chambres. Ce parcours vise surtout les meublés de tourisme (logement entier). Consultez le guide propriétaires et le règlement de copropriété avant une chambre d'hôte.",
      },
      officialUrls: [
        {
          url: BORDEAUX_OWNER_GUIDE_URL,
          label: {
            en: "Owner guide: chambre d'hôte section",
            fr: "Guide propriétaires : section chambre d'hôte",
          },
          role: "info",
          urlVerified: true,
        },
      ],
      documents: { en: [], fr: [] },
      appliesWhen: "bordeauxChambreHote",
      fieldHints: ["notes", "residencyStatus"],
    },
    {
      key: "bordeaux-social-housing-prohibited",
      title: {
        en: "Social housing: change-of-use prohibited",
        fr: "Logement social : changement d'usage interdit",
      },
      instruction: {
        en: "The règlement prohibits change-of-use for social housing units (public or private conventionnement). Do not list this unit for whole-property furnished tourist rental without confirming tenure status with the city.",
        fr: "Le règlement interdit le changement d'usage des logements sociaux (conventionnement public ou privé). Ne proposez pas ce logement en meublé touristique (totalité) sans confirmer votre statut auprès de la Ville.",
      },
      officialUrls: [
        {
          url: BORDEAUX_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 1.2 (prohibited changes)",
            fr: "Règlement art. 1.2 (interdictions)",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: { en: [], fr: [] },
      appliesWhen: "bordeauxSocialHousing",
      fieldHints: ["notes", "residencyStatus"],
    },
    {
      key: "bordeaux-sector-pending",
      title: {
        en: "Confirm compensation sector (A, B or C)",
        fr: "Confirmer le secteur de compensation (A, B ou C)",
      },
      instruction: {
        en: "Non-primary change-of-use requires compensation in sectors tied to your unit (règlement art. 2.2.1 and Annexe 1). Add bordeaux:secteur-a, bordeaux:secteur-b or bordeaux:secteur-c in property notes after checking the official map on bordeaux.fr or the règlement PDF. Secteur A has reinforced rules since 1 April 2026 (see next step when secteur A applies).",
        fr: "Le changement d'usage hors principale exige une compensation dans des secteurs liés au bien (règlement art. 2.2.1 et Annexe 1). Ajoutez bordeaux:secteur-a, bordeaux:secteur-b ou bordeaux:secteur-c dans les notes après la carte officielle sur bordeaux.fr ou le PDF du règlement. Le secteur A est renforcé depuis le 1er avril 2026 (étape suivante si secteur A).",
      },
      officialUrls: [
        {
          url: BORDEAUX_URBANISME_URL,
          label: {
            en: "Urbanisme page: sector map and UB form",
            fr: "Page urbanisme : carte secteurs et formulaire UB",
          },
          role: "info",
          urlVerified: true,
        },
        {
          url: BORDEAUX_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement Annexe 1 (sectors)",
            fr: "Règlement Annexe 1 (secteurs)",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["Sector map (Annexe 1)", "Property notes tag bordeaux:secteur-a/b/c"],
        fr: ["Carte secteurs (Annexe 1)", "Note bordeaux:secteur-a/b/c"],
      },
      appliesWhen: "bordeauxSecteurPending",
      fieldHints: ["notes", "postalCode", "address"],
    },
    {
      key: "bordeaux-change-of-use-ub",
      title: {
        en: "File change-of-use with compensation (formulaire UB)",
        fr: "Déposer le changement d'usage avec compensation (formulaire UB)",
      },
      instruction: {
        en: `For non-primary whole-unit meublé de tourisme, obtain authorisation before any rental. Download formulaire UB (with notice and pièces list) from the urbanisme page or the PDF linked below. Compensation premises must meet surface, decency, concomitant works, sector and no ground-floor rules (règlement art. 2.2). Authorisation is real and definitive and attaches to the unit. File at the droit des sols guichet unique (Cité municipale, 4 rue Claude Bonnier) or via the urbanisme portal as described on bordeaux.fr. Instruction: 2 months from complete file (règlement art. 4). For questions on usage, the taxedesejour.bordeaux-metropole.fr portal lists ${BORDEAUX_USAGE_EMAIL} (not cited on bordeaux.fr pages checked in October 2026). Do not register on the tourist tax portal until change-of-use is approved.`,
        fr: `Pour un meublé de tourisme (logement entier) hors résidence principale, obtenez l'autorisation avant toute location. Téléchargez le formulaire UB (notice et liste des pièces) sur la page urbanisme ou le PDF ci-dessous. La compensation doit respecter surface, décence, travaux concomitants, secteurs et interdiction du rez-de-chaussée (règlement art. 2.2). L'autorisation est réelle et définitive, attachée au local. Dépôt au guichet unique droit des sols (Cité municipale, 4 rue Claude Bonnier) ou portail urbanisme selon bordeaux.fr. Instruction : 2 mois à dossier complet (règlement art. 4). Questions d'usage : le portail taxedesejour.bordeaux-metropole.fr indique ${BORDEAUX_USAGE_EMAIL} (non repris sur les pages bordeaux.fr vérifiées en octobre 2026). N'enregistrez pas sur le portail taxe de séjour avant l'autorisation.`,
      },
      officialUrls: [
        {
          url: BORDEAUX_URBANISME_URL,
          label: {
            en: "Urbanisme: UB form, notice and document list",
            fr: "Urbanisme : formulaire UB, notice et pièces",
          },
          role: "form",
          urlVerified: true,
        },
        {
          url: BORDEAUX_FORMULAIRE_UB_PDF_URL,
          label: {
            en: "Formulaire UB v2 (PDF)",
            fr: "Formulaire UB v2 (PDF)",
          },
          role: "form",
          urlVerified: true,
        },
        {
          url: BORDEAUX_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement: compensation modalities",
            fr: "Règlement : modalités de compensation",
          },
          role: "rules",
          urlVerified: true,
        },
        {
          url: BORDEAUX_PORTAL_URL,
          label: {
            en: "Tax portal (usage contact email only)",
            fr: "Portail taxe (contact usage uniquement)",
          },
          role: "portal",
          urlVerified: true,
        },
      ],
      documents: {
        en: [
          "Formulaire UB completed",
          "Compensation project (surface, sector, not ground floor)",
          "Co-ownership documents if applicable",
          "Proof of ownership",
        ],
        fr: [
          "Formulaire UB complété",
          "Projet de compensation (surface, secteur, pas de RDC)",
          "Pièces copropriété le cas échéant",
          "Justificatif de propriété",
        ],
      },
      timeline: {
        en: "About 2 months instruction once the file is complete; tacit grant possible if silence after the instruction period (règlement art. 4.2).",
        fr: "Environ 2 mois d'instruction à dossier complet ; accord tacite possible en cas de silence (règlement art. 4.2).",
      },
      pitfalls: {
        en: "Registration number and change-of-use authorisation are separate. Sanctions follow CCH and tourism code (règlement art. 5); do not rely on invented fine amounts in unofficial sources.",
        fr: "Numéro d'enregistrement et autorisation de changement d'usage sont distincts. Sanctions selon CCH et code du tourisme (règlement art. 5) ; ne vous fiez pas à des montants inventés hors sources officielles.",
      },
      appliesWhen: "bordeauxNonPrimaryChangeOfUse",
      fieldHints: ["address", "city", "postalCode", "notes", "residencyStatus"],
    },
    {
      key: "bordeaux-sector-a-reinforced",
      title: {
        en: "Secteur A: reinforced double compensation surface",
        fr: "Secteur A : compensation renforcée (surface double)",
      },
      instruction: {
        en: "Since 1 April 2026, units in secteur A require compensation at double the floor area of the unit subject to change-of-use, unless compensation premises are transformed into social housing (then normal 1:1 rules apply, règlement art. 2.2.2). The urbanisme page (updated June 2026) reflects this; the February 2026 owner guide still describes same-surface compensation only and should not be relied on for secteur A sizing. Plan concomitant works and sector rules (no ground-floor compensation).",
        fr: "Depuis le 1er avril 2026, les biens en secteur A exigent une compensation à surface double par rapport au local concerné, sauf si les locaux de compensation deviennent des logements sociaux (règlement art. 2.2.2, alors règles 1:1). La page urbanisme (mise à jour juin 2026) le reflète ; le guide propriétaires (février 2026) décrit encore une compensation à surface équivalente seulement, à ne pas suivre pour le dimensionnement secteur A. Prévoyez travaux concomitants et règles de secteur (pas de compensation en rez-de-chaussée).",
      },
      officialUrls: [
        {
          url: BORDEAUX_URBANISME_URL,
          label: {
            en: "Urbanisme: secteur A reinforced compensation",
            fr: "Urbanisme : compensation renforcée secteur A",
          },
          role: "rules",
          urlVerified: true,
        },
        {
          url: BORDEAUX_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 2.2.2",
            fr: "Règlement art. 2.2.2",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: [
          "Compensation surface at 2x (unless social housing compensation)",
          "Sector A map confirmation",
        ],
        fr: [
          "Surface de compensation à 2x (sauf logement social en compensation)",
          "Confirmation carte secteur A",
        ],
      },
      appliesWhen: "bordeauxSecteurA",
      fieldHints: ["notes"],
    },
    {
      key: "bordeaux-sector-compensation-rules",
      title: {
        en: "Match compensation sector to your unit",
        fr: "Aligner le secteur de compensation sur votre bien",
      },
      instruction: {
        en: "Compensation premises must sit in allowed zones: unit in A compensates in A; unit in B in A or B; unit in C in A, B or C (règlement art. 2.2.1 d). Ground-floor premises cannot be used as compensation. Works on the unit and compensation must be concomitant.",
        fr: "Les locaux de compensation doivent être dans les zones autorisées : bien en A compensé en A ; en B en A ou B ; en C en A, B ou C (règlement art. 2.2.1 d). Le rez-de-chaussée ne peut pas servir de compensation. Travaux sur le bien et compensation concomitants.",
      },
      officialUrls: [
        {
          url: BORDEAUX_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 2.2.1",
            fr: "Règlement art. 2.2.1",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["Annexe 1 sector map", "Compensation floor plans"],
        fr: ["Carte Annexe 1", "Plans de compensation"],
      },
      appliesWhen: "bordeauxSecteurKnown",
      fieldHints: ["notes", "postalCode"],
    },
    {
      key: "bordeaux-declare-registration",
      title: {
        en: "Register on taxedesejour.bordeaux-metropole.fr",
        fr: "S'inscrire sur taxedesejour.bordeaux-metropole.fr",
      },
      instruction: {
        en: `Declaration and registration number are mandatory for whole-unit meublé de tourisme whether primary or non-primary (règlement art. 4.4). Create your account on taxedesejour.bordeaux-metropole.fr (portal text: only for the city of Bordeaux). Display the number on all ads and contracts; any change to your declaration may require a new number (owner guide). This channel is separate from change-of-use approval for non-primary homes. Platforms may collect taxe de séjour, but you must still declare periods on the Métropole site (owner guide). Host Registry tracks periods from your calendar; you submit on the portal yourself.`,
        fr: `Déclaration et numéro d'enregistrement obligatoires pour le meublé de tourisme (logement entier), résidence principale ou non (règlement art. 4.4). Créez votre compte sur taxedesejour.bordeaux-metropole.fr (portail : uniquement pour la ville de Bordeaux). Affichez le numéro sur toutes les annonces et contrats ; toute modification peut imposer un nouveau numéro (guide propriétaires). Canal distinct de l'autorisation de changement d'usage hors principale. Les plateformes peuvent collecter la taxe de séjour, mais vous devez déclarer sur le site Métropole (guide propriétaires). Host Registry prépare les périodes depuis votre calendrier ; vous déposez sur le portail vous-même.`,
      },
      officialUrls: [
        {
          url: BORDEAUX_PORTAL_URL,
          label: {
            en: "Bordeaux Métropole: tourist tax and registration",
            fr: "Bordeaux Métropole : taxe de séjour et enregistrement",
          },
          role: "portal",
          urlVerified: true,
        },
        {
          url: BORDEAUX_OWNER_GUIDE_URL,
          label: {
            en: "Owner guide: registration and listings",
            fr: "Guide propriétaires : enregistrement et annonces",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: [
          "National ID or passport",
          "Proof of ownership",
          "Change-of-use decision (if non-primary)",
          "Property address in Bordeaux commune",
        ],
        fr: [
          "Pièce d'identité",
          "Justificatif de propriété",
          "Décision de changement d'usage (si hors principale)",
          "Adresse sur la commune de Bordeaux",
        ],
      },
      appliesWhen: "bordeauxNotSocialHousing",
      fieldHints: ["name", "address", "city", "postalCode", "country", "propertyType", "residencyStatus"],
    },
    frSteps.taxDeclaration("bordeaux"),
    frSteps.updateListings("bordeaux"),
    frSteps.guestRegister("bordeaux"),
  ];
}

export function buildBordeauxPlaybook(
  frSteps: {
    taxDeclaration: (cityKey: string) => PlaybookStep;
    updateListings: (cityKey: string) => PlaybookStep;
    guestRegister: (cityKey: string) => PlaybookStep;
  }
): Playbook {
  return {
    id: "fr-bordeaux",
    country: "France",
    city: "Bordeaux",
    title: {
      en: "Bordeaux furnished tourist rental",
      fr: "Location meublée touristique : Bordeaux",
    },
    description: {
      en: "90-night primary cap, formulaire UB change-of-use with compensation for non-primary units, registration on taxedesejour.bordeaux-metropole.fr (city of Bordeaux only). Host Registry tracks steps; you file with the city.",
      fr: "Plafond 90 nuitées en principale, changement d'usage formulaire UB avec compensation hors principale, enregistrement sur taxedesejour.bordeaux-metropole.fr (ville de Bordeaux). Host Registry suit les étapes ; vous déposez auprès de la Ville.",
    },
    sourceReviewedAt: "2026-10-09",
    steps: buildBordeauxPlaybookSteps(frSteps),
  };
}
