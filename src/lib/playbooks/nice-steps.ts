import type { Playbook, PlaybookStep } from "./types";

export const NICE_CHANGE_OF_USE_HUB_URL =
  "https://www.nicecotedazur.org/services/logement/autorisations-de-changements-dusage/";
export const NICE_MEUBLES_TOURISTIQUES_URL =
  "https://www.nicecotedazur.org/services/logement/autorisations-de-changements-dusage/logements-en-meubles-touristiques/";
export const NICE_PARTICULIERS_URL =
  "https://www.nicecotedazur.org/services/logement/autorisations-de-changements-dusage/logements-en-meubles-touristiques/particuliers/";
export const NICE_PERSONNES_MORALES_URL =
  "https://www.nicecotedazur.org/services/logement/autorisations-de-changements-dusage/logements-en-meubles-touristiques/personnes-morales/";
export const NICE_FAQ_URL =
  "https://www.nicecotedazur.org/services/logement/autorisations-de-changements-dusage/foire-aux-questions/";
export const NICE_OWNER_GUIDE_PDF_URL =
  "https://www.nicecotedazur.org/wp-content/uploads/2026/06/Guide-du-Proprietaire-de-Meubles-commune-de-NICE-actualise-au-4-06-26.pdf";
export const NICE_REGLEMENT_2026_PDF_URL =
  "https://www.nicecotedazur.org/wp-content/uploads/2026/08/Reglement-changement-usage-2.1-US-du-22-juin-2026.pdf";
export const NICE_QUOTAS_AVIS_PDF_URL =
  "https://www.nicecotedazur.org/wp-content/uploads/2026/08/Avis-au-public-changement-usage-nice-quotas-15.08.2026.pdf";
export const NICE_SECONDARY_INFO_PDF_URL =
  "https://taxedesejour.ofeaweb.fr/Content/configuration/metropole-nca/ImprimesDeclaratif/Mise%20en%20location%20touristique%20R%C3%A9sidence%20Secondaire%20-%20Investissement%20locatif%20%C3%A0%20NICE.pdf";
export const NICE_CHANGE_PORTAL_URL = "https://changementdusage.fr/nice";
export const NICE_PORTAL_URL = "https://taxedesejour.ofeaweb.fr/ts/metropole-nca";
export const NICE_CHANGE_EMAIL = "changement.usage@ville-nice.fr";

export function buildNicePlaybookSteps(
  frSteps: {
    taxDeclaration: (cityKey: string) => PlaybookStep;
    updateListings: (cityKey: string) => PlaybookStep;
    guestRegister: (cityKey: string) => PlaybookStep;
  }
): PlaybookStep[] {
  return [
    {
      key: "nice-verify-rules",
      title: {
        en: "Pick your Nice situation",
        fr: "Identifier votre situation niçoise",
      },
      instruction: {
        en: `Ville de Nice and Métropole Nice Côte d'Azur rules (nicecotedazur.org, owner guide PDF updated 4 June 2026, règlement 2.1 applicable 1 September 2026, checked October 2026): (1) Primary residence whole dwelling: no change-of-use authorisation if you stay within the communal rental duration cap (120 cumulative days per calendar year on Nice commune from 1 September 2026 per règlement 2.1 article 5 and the meublés page; 90 days per year before that date). Mandatory registration number via the Métropole taxe de séjour portal. (2) Non-primary or investment: change-of-use authorisation on changementdusage.fr/nice before any tourist rental. Natural persons may receive one 5-year temporary authorisation per tax household for a first meublé (règlement 2.1 and particuliers page); commercial legal entities need compensation from the 1st meublé. (3) Change-of-use number and registration number (déclaration en mairie on the tax portal) are different. Add nice:quota-zone if your address is in Vieux-Nice, Riquier-Port-Mont Boron, Centre-Ville or Ouest quota sectors; nice:location-mixte for the student/summer mixte path; nice:second-meuble or nice:compensation when a compensation dossier applies. Host Registry, by Glint, prepares checklists. We never file with the Ville de Nice for you.`,
        fr: `Règles Ville de Nice et Métropole Nice Côte d'Azur (nicecotedazur.org, guide propriétaires PDF au 4 juin 2026, règlement 2.1 au 1er septembre 2026, vérifiées en octobre 2026) : (1) Résidence principale (logement entier) : pas d'autorisation de changement d'usage si vous respectez le plafond communal (120 jours cumulés par année civile sur Nice commune à partir du 1er septembre 2026 selon le règlement 2.1 article 5 et la page meublés ; 90 jours par an avant cette date). Numéro d'enregistrement obligatoire sur le portail taxe de séjour métropolitain. (2) Hors résidence principale ou investissement : autorisation de changement d'usage sur changementdusage.fr/nice avant toute location touristique. Les personnes physiques peuvent obtenir une autorisation temporaire de 5 ans pour un 1er meublé par foyer fiscal (règlement 2.1 et page particuliers) ; les personnes morales à vocation commerciale compensent dès le 1er meublé. (3) Le numéro de changement d'usage et le numéro d'enregistrement (déclaration en mairie via le portail taxe) diffèrent. Ajoutez nice:quota-zone si le bien est en secteur à quotas ; nice:location-mixte pour la location mixte ; nice:second-meuble ou nice:compensation si un dossier de compensation est requis. Host Registry, par Glint, prépare les checklists. Nous ne déposons rien pour vous.`,
      },
      officialUrls: [
        {
          url: NICE_MEUBLES_TOURISTIQUES_URL,
          label: {
            en: "Métropole NCA: furnished tourist rental rules",
            fr: "Métropole NCA : règles meublés touristiques",
          },
          role: "rules",
          urlVerified: true,
        },
        {
          url: NICE_OWNER_GUIDE_PDF_URL,
          label: {
            en: "Owner guide PDF (Nice commune, June 2026)",
            fr: "Guide propriétaires PDF (commune de Nice, juin 2026)",
          },
          role: "rules",
          urlVerified: true,
        },
        {
          url: NICE_REGLEMENT_2026_PDF_URL,
          label: {
            en: "Change-of-use règlement 2.1 (1 Sep 2026)",
            fr: "Règlement changement d'usage 2.1 (1er sept. 2026)",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: [
          "Primary vs non-primary residence",
          "Owner type (natural person vs legal entity)",
          "Optional notes: nice:quota-zone, nice:location-mixte, nice:second-meuble, nice:compensation",
        ],
        fr: [
          "Résidence principale ou hors principale",
          "Statut propriétaire (personne physique ou morale)",
          "Notes optionnelles : nice:quota-zone, nice:location-mixte, nice:second-meuble, nice:compensation",
        ],
      },
      appliesWhen: "always",
      fieldHints: [
        "address",
        "city",
        "country",
        "propertyType",
        "residencyStatus",
        "ownerIsLegalEntity",
        "notes",
      ],
    },
    {
      key: "nice-quota-zone",
      title: {
        en: "Quota sectors: online window and caps",
        fr: "Secteurs à quotas : fenêtre et plafonds",
      },
      instruction: {
        en: "In Vieux-Nice, Riquier-Port-Mont Boron, Centre-Ville and Ouest, first-time change-of-use requests for furnished tourist rental are subject to annual quotas. For 2026 online filing reopens on 1 September and closes in late December, with a maximum of 691 authorisations across the four sectors (Métropole web pages cite 31 December; the 15 August 2026 public notice cites 21 December for first requests: check the exact date on nicecotedazur.org). Test your address on changementdusage.fr/nice. Renewals, location mixte and compensation dossiers are not quota-limited and may be filed year-round per the public notice PDF.",
        fr: "Dans Vieux-Nice, Riquier-Port-Mont Boron, Centre-Ville et Ouest, les premières demandes de changement d'usage pour meublé touristique sont soumises à des quotas annuels. Pour 2026 le dépôt en ligne rouvre le 1er septembre et se clôt en fin décembre, avec 691 autorisations maximum sur les quatre secteurs (les pages web Métropole indiquent le 31 décembre, l'avis au public du 15 août 2026 cite le 21 décembre pour les premières demandes : vérifiez la date exacte sur nicecotedazur.org). Testez l'adresse sur changementdusage.fr/nice. Renouvellements, location mixte et dossiers de compensation ne sont pas soumis aux quotas et restent déposables toute l'année selon l'avis au public.",
      },
      officialUrls: [
        {
          url: NICE_QUOTAS_AVIS_PDF_URL,
          label: {
            en: "Public notice: quota sectors 2026 (PDF)",
            fr: "Avis au public : secteurs quotas 2026 (PDF)",
          },
          role: "rules",
          urlVerified: true,
        },
        {
          url: NICE_CHANGE_PORTAL_URL,
          label: {
            en: "changementdusage.fr/nice (address test)",
            fr: "changementdusage.fr/nice (test d'adresse)",
          },
          role: "portal",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["Complete online dossier within the annual window if quota applies"],
        fr: ["Dossier en ligne complet dans la fenêtre annuelle si quota applicable"],
      },
      appliesWhen: "niceQuotaZone",
      fieldHints: ["address", "notes"],
    },
    {
      key: "nice-location-mixte",
      title: {
        en: "Optional: location mixte (student year + summer tourists)",
        fr: "Option : location mixte (étudiant + été touristique)",
      },
      instruction: {
        en: "The Métropole offers a location mixte path: rent to a student during the academic year and to tourists in summer (June-August or July-September per FAQ), with change-of-use still required but without compensation when you meet mixte conditions (student CAF beneficiary, maximum rent, annual renewal). Add nice:location-mixte in property notes to keep this branch visible. Confirm eligibility on the mixte FAQ and owner guide before filing.",
        fr: "La Métropole propose une location mixte : location à un étudiant pendant l'année universitaire et à des touristes l'été (juin-août ou juillet-septembre selon la FAQ), avec changement d'usage obligatoire mais sans compensation si les conditions mixte sont remplies (étudiant allocataire CAF, loyer plafonné, renouvellement annuel). Ajoutez nice:location-mixte dans les notes pour afficher cette branche. Confirmez l'éligibilité sur la FAQ mixte et le guide propriétaires avant dépôt.",
      },
      officialUrls: [
        {
          url: NICE_FAQ_URL,
          label: {
            en: "Change-of-use FAQ (mixte section)",
            fr: "FAQ changement d'usage (section mixte)",
          },
          role: "info",
          urlVerified: true,
        },
        {
          url: NICE_OWNER_GUIDE_PDF_URL,
          label: {
            en: "Owner guide: location mixte",
            fr: "Guide propriétaires : location mixte",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: { en: [], fr: [] },
      appliesWhen: "niceLocationMixte",
      fieldHints: ["notes", "residencyStatus"],
    },
    {
      key: "nice-change-of-use",
      title: {
        en: "Obtain change-of-use authorisation (when required)",
        fr: "Obtenir l'autorisation de changement d'usage (si requis)",
      },
      instruction: {
        en: "Non-primary furnished tourist rentals need a change-of-use authorisation before day 1. File online on changementdusage.fr/nice (paper forms only on request to changement.usage@ville-nice.fr). Natural persons: one 5-year temporary authorisation per tax household for a first meublé without compensation under règlement 2.1 unless you need mixte or compensation branches. Commercial legal entities (personnes morales à vocation commerciale): compensation from the 1st meublé. Other legal entities follow natural-person rules. Produce a valid DPE class A to E (A to D from 1 January 2034 per public notice) and a sworn statement that copropriété rules allow furnished tourist rental. The authorisation number is not the tax portal registration number.",
        fr: "Les meublés hors résidence principale exigent une autorisation de changement d'usage avant le 1er jour de location. Déposez en ligne sur changementdusage.fr/nice (formulaires papier sur demande à changement.usage@ville-nice.fr). Personnes physiques : une autorisation temporaire de 5 ans par foyer fiscal pour un 1er meublé sans compensation au titre du règlement 2.1, sauf branches mixte ou compensation. Personnes morales à vocation commerciale : compensation dès le 1er meublé. Les autres personnes morales suivent les règles des personnes physiques. DPE valide classes A à E (A à D à partir du 1er janvier 2034 selon l'avis au public) et attestation sur l'honneur de compatibilité avec le règlement de copropriété. Le numéro d'autorisation n'est pas le numéro d'enregistrement du portail taxe.",
      },
      officialUrls: [
        {
          url: NICE_CHANGE_PORTAL_URL,
          label: {
            en: "Nice change-of-use portal",
            fr: "Portail changement d'usage Nice",
          },
          role: "portal",
          urlVerified: true,
        },
        {
          url: NICE_PARTICULIERS_URL,
          label: {
            en: "Particuliers: checklist and 5-year rule",
            fr: "Particuliers : pièces et règle des 5 ans",
          },
          role: "rules",
          urlVerified: true,
        },
        {
          url: NICE_PERSONNES_MORALES_URL,
          label: {
            en: "Commercial legal entities: compensation from 1st meublé",
            fr: "Personnes morales à vocation commerciale : compensation dès le 1er meublé",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: [
          "Full ownership deed",
          "ID copy",
          "Valid DPE (classes A-E)",
          "Copropriété sworn statement",
        ],
        fr: [
          "Titre de propriété complet",
          "Copie pièce d'identité",
          "DPE valide (classes A-E)",
          "Attestation sur l'honneur copropriété",
        ],
      },
      appliesWhen: "niceNonPrimaryChangeOfUse",
      fieldHints: ["address", "city", "residencyStatus", "ownerIsLegalEntity", "notes"],
    },
    {
      key: "nice-compensation",
      title: {
        en: "Compensation dossier (legal entity, 2nd meublé, or after temp period)",
        fr: "Dossier de compensation (personne morale, 2e meublé ou après autorisation temporaire)",
      },
      instruction: {
        en: "When compensation applies, you must transform non-housing premises into housing on Nice concomitantly with the change-of-use request, or buy titres de commercialité from a third party transforming premises into housing (local must be in Nice, meet decency rules). Commercial legal entities need compensation from the 1st furnished tourist rental. Natural persons need it from the 2nd meublé or after the 5-year temporary authorisation ends unless you qualify for location mixte. Details and forms are on the Métropole change-of-use hub and règlement 2.1 PDF.",
        fr: "Lorsque la compensation s'applique, transformez des locaux non habitables en logement sur Nice de façon concomitante à la demande, ou achetez des titres de commercialité auprès d'un tiers transformant des locaux en logement (local à Nice, décence). Les personnes morales à vocation commerciale compensent dès le 1er meublé touristique. Les personnes physiques compensent à partir du 2e meublé ou après la fin de l'autorisation temporaire de 5 ans sauf éligibilité location mixte. Formules et détails sur le hub changement d'usage Métropole et le PDF règlement 2.1.",
      },
      officialUrls: [
        {
          url: NICE_MEUBLES_TOURISTIQUES_URL,
          label: {
            en: "Compensation rules summary",
            fr: "Synthèse règles de compensation",
          },
          role: "rules",
          urlVerified: true,
        },
        {
          url: NICE_REGLEMENT_2026_PDF_URL,
          label: {
            en: "Règlement 2.1 compensation articles",
            fr: "Règlement 2.1 articles compensation",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["Compensation premises details or titre de commercialité contract"],
        fr: ["Détails locaux de compensation ou contrat titre de commercialité"],
      },
      appliesWhen: "niceCompensationRequired",
      fieldHints: ["notes", "ownerIsLegalEntity", "residencyStatus"],
    },
    {
      key: "nice-declare-registration",
      title: {
        en: "Register for your mairie number on the tax portal",
        fr: "Obtenir le numéro de déclaration en mairie sur le portail taxe",
      },
      instruction: {
        en: "All furnished tourist rentals (primary or non-primary) need a registration number for platform listings. After any required change-of-use authorisation for non-primary units, create a host account on the Métropole Nice Côte d'Azur taxe de séjour portal, complete hébergeur and hébergement sections, and generate the 13-character registration number (déclaration en mairie). The portal validates your file before issuing the récépissé. This number differs from the change-of-use authorisation reference.",
        fr: "Tous les meublés touristiques (principale ou non) ont besoin d'un numéro d'enregistrement pour les annonces. Après toute autorisation de changement d'usage requise pour les biens hors principale, créez un compte hébergeur sur le portail taxe de séjour Métropole Nice Côte d'Azur, complétez les fiches hébergeur et hébergement, puis générez le numéro à 13 caractères (déclaration en mairie). Le portail valide le dossier avant le récépissé. Ce numéro diffère de la référence d'autorisation de changement d'usage.",
      },
      officialUrls: [
        {
          url: NICE_PORTAL_URL,
          label: {
            en: "Taxe de séjour Métropole NCA portal",
            fr: "Portail taxe de séjour Métropole NCA",
          },
          role: "portal",
          urlVerified: true,
        },
        {
          url: NICE_SECONDARY_INFO_PDF_URL,
          label: {
            en: "Portal help PDF (secondary / investment)",
            fr: "PDF d'aide portail (secondaire / investissement)",
          },
          role: "info",
          urlVerified: true,
        },
        {
          url: NICE_OWNER_GUIDE_PDF_URL,
          label: {
            en: "Owner guide: step 2 registration",
            fr: "Guide propriétaires : étape 2 enregistrement",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: [
          "National ID or passport",
          "Proof of ownership",
          "Change-of-use authorisation (if non-primary)",
        ],
        fr: [
          "Pièce d'identité",
          "Justificatif de propriété",
          "Autorisation de changement d'usage (si hors principale)",
        ],
      },
      appliesWhen: "always",
      fieldHints: ["name", "address", "city", "country", "propertyType", "residencyStatus"],
    },
    frSteps.taxDeclaration("nice"),
    frSteps.updateListings("nice"),
    frSteps.guestRegister("nice"),
  ];
}

export function buildNicePlaybook(
  frSteps: {
    taxDeclaration: (cityKey: string) => PlaybookStep;
    updateListings: (cityKey: string) => PlaybookStep;
    guestRegister: (cityKey: string) => PlaybookStep;
  }
): Playbook {
  return {
    id: "fr-nice",
    country: "France",
    city: "Nice",
    title: {
      en: "Nice furnished tourist rental",
      fr: "Location meublée touristique : Nice",
    },
    description: {
      en: "Change-of-use on changementdusage.fr/nice when required, registration number on taxedesejour.ofeaweb.fr/ts/metropole-nca, 120-day primary cap on Nice commune from 1 September 2026 (90 days before). Host Registry tracks steps; you file with the Ville de Nice and Métropole portals.",
      fr: "Changement d'usage sur changementdusage.fr/nice si requis, numéro d'enregistrement sur le portail taxe de séjour métropolitain, plafond 120 jours en résidence principale sur Nice à partir du 1er septembre 2026 (90 jours avant). Host Registry suit les étapes ; vous déposez sur les portails Ville et Métropole.",
    },
    sourceReviewedAt: "2026-10-09",
    steps: buildNicePlaybookSteps(frSteps),
  };
}
