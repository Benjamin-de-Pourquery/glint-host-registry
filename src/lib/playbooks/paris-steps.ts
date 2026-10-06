import type { Playbook, PlaybookStep } from "./types";

export const PARIS_RULES_URL =
  "https://www.paris.fr/pages/meubles-touristiques-3637";
export const PARIS_FORM_URL = "https://teleservices.paris.fr/meubles-tourisme/";
export const PARIS_BASU_CONTACT_URL =
  "https://www.paris.fr/pages/demarches-2094#vos-contacts_1";
export const PARIS_URBANISM_DEMARCHES_URL =
  "https://www.paris.fr/pages/les-demarches-d-urbanisme-4458";
export const PARIS_CHANGE_OF_USE_PORTAL =
  "https://s29-sndcu.apps.paris.fr/changement-usage/jsp/site/Portal.jsp?page=accueil";
export const PARIS_CHANGE_OF_USE_INFO =
  "https://www.paris.fr/pages/exercer-une-activite-dans-un-logement-172";
export const PARIS_OPENDATA_CHANGE_OF_USE_URL = "https://opendata.paris.fr";

const parisDocumentsDetailed = [
  {
    name: {
      en: "Last taxe d'habitation notice (avis de taxe d'habitation)",
      fr: "Dernier avis de taxe d'habitation",
    },
    why: {
      en: "Required at step 3 of the online declaration to identify the local (identifiant du local, bottom of page 4). If unavailable, check « J'identifie mon local autrement ».",
      fr: "Requis à l'étape 3 de la déclaration en ligne pour identifier le local (identifiant du local, bas de la page 4). Si indisponible, cochez « J'identifie mon local autrement ».",
    },
  },
  {
    name: {
      en: "National ID or passport of the loueur (landlord)",
      fr: "Pièce d'identité du loueur",
    },
    why: {
      en: "The declaration must be submitted in the name of the loueur (owner/landlord), not the property manager or conciergerie.",
      fr: "La déclaration doit être déposée au nom du loueur (propriétaire), pas du gestionnaire ou de la conciergerie.",
    },
  },
  {
    name: {
      en: "Proof of ownership or lease authorization",
      fr: "Justificatif de propriété ou autorisation de sous-location",
    },
    why: {
      en: "Tenants must have landlord authorization for sub-letting; social housing tenants cannot register STR properties.",
      fr: "Les locataires doivent avoir l'autorisation du bailleur ; les locataires du parc social ne peuvent pas enregistrer un meublé touristique.",
    },
  },
];

const declareStep = (
  key: string,
  appliesWhen: PlaybookStep["appliesWhen"],
  titleEn: string,
  titleFr: string,
  instructionEn: string,
  instructionFr: string,
  extraDocsEn: string[],
  extraDocsFr: string[]
): PlaybookStep => ({
  key,
  title: { en: titleEn, fr: titleFr },
  instruction: { en: instructionEn, fr: instructionFr },
  officialUrls: [
    {
      url: PARIS_FORM_URL,
      label: {
        en: "Paris — online tourist rental declaration (téléservice)",
        fr: "Paris — déclaration meublé touristique (téléservice)",
      },
      role: "form",
      urlVerified: true,
    },
    {
      url: PARIS_RULES_URL,
      label: {
        en: "City of Paris — rules and FAQ (information only)",
        fr: "Ville de Paris — règles et FAQ (information uniquement)",
      },
      role: "rules",
      urlVerified: true,
    },
  ],
  documents: {
    en: [
      ...extraDocsEn,
      "Last taxe d'habitation notice (identifiant du local, page 4)",
      "National ID of the loueur",
    ],
    fr: [
      ...extraDocsFr,
      "Dernier avis de taxe d'habitation (identifiant du local, page 4)",
      "Pièce d'identité du loueur",
    ],
  },
  documentsDetailed: parisDocumentsDetailed,
  timeline: {
    en: "Registration number issued immediately after online submission.",
    fr: "Numéro d'enregistrement délivré immédiatement après la déclaration en ligne.",
  },
  pitfalls: {
    en: "File on teleservices.paris.fr, not the paris.fr rules page. Without the registration number on your listings, fines up to €5,000 may apply. Use « Retirer ma déclaration » and file again if your situation changes; update listings with the new number.",
    fr: "Déposez sur teleservices.paris.fr, pas sur la page de règles paris.fr. Sans numéro sur vos annonces, amendes jusqu'à 5 000 € possibles. Utilisez « Retirer ma déclaration » et déposez à nouveau si votre situation change ; mettez à jour vos annonces avec le nouveau numéro.",
  },
  appliesWhen,
  fieldHints: ["name", "address", "city", "country", "propertyType", "residencyStatus"],
});

export function buildParisPlaybookSteps(
  frSteps: {
    taxDeclaration: (cityKey: string) => PlaybookStep;
    updateListings: (cityKey: string) => PlaybookStep;
    guestRegister: (cityKey: string) => PlaybookStep;
  }
): PlaybookStep[] {
  return [
    {
      key: "paris-verify-rules",
      title: {
        en: "Pick your Paris situation (four paths)",
        fr: "Identifier votre situation parisienne (4 cas)",
      },
      instruction: {
        en: "Paris distinguishes four furnished tourist rental situations on the official Ville de Paris page (updated 25 March 2026): (1) primary residence, whole dwelling, max 90 nights/year; (2) housing that is not your primary residence, with change-of-use with compensation, then change of destination to hébergement hôtelier (BASU) before declaration; (3) commercial or artisanal premises, with prior authorization under the municipal commercial/artisan regulation via Démarches d'urbanisme; (4) other premises (office, garage, etc.), with change of destination via Démarches d'urbanisme. Renting a single room inside your primary residence needs no prior declaration (except chambres d'hôtes). Set property type and residency status in Host Registry so the correct steps appear. For usage questions, the City directs you to a notaire or avocat.",
        fr: "La Ville de Paris distingue quatre situations (page officielle mise à jour le 25/03/2026) : (1) résidence principale, logement entier, 90 nuitées/an max ; (2) logement non principale, avec changement d'usage avec compensation puis changement de destination en hébergement hôtelier (BASU) avant déclaration ; (3) local commercial ou artisanal, autorisation préalable via Démarches d'urbanisme ; (4) autre local (bureau, garage…), changement de destination via Démarches d'urbanisme. La location d'une chambre dans votre résidence principale ne nécessite pas de déclaration préalable (sauf chambres d'hôtes). Renseignez le type de bien et le statut de résidence dans Host Registry. Pour l'usage du local, la Ville vous oriente vers un notaire ou un avocat.",
      },
      officialUrls: [
        {
          url: PARIS_RULES_URL,
          label: {
            en: "City of Paris — tourist furnished rental rules",
            fr: "Ville de Paris — règles meublés touristiques",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: [
          "Confirm which of the four situations applies",
          "Co-ownership bylaws (if applicable)",
          "Estimated annual rental nights for primary residence",
        ],
        fr: [
          "Confirmer la situation parmi les quatre cas",
          "Règlement de copropriété (le cas échéant)",
          "Estimation des nuitées annuelles (résidence principale)",
        ],
      },
      pitfalls: {
        en: "Non-primary, commercial and other premises require all urbanism authorizations before day 1 of rental. Primary residence is capped at 90 nights per calendar year in Paris.",
        fr: "Non principale, local commercial et autre local exigent toutes les autorisations d'urbanisme dès le 1er jour de location. La résidence principale est plafonnée à 90 nuitées par an civile à Paris.",
      },
      fieldHints: ["address", "city", "country", "propertyType", "residencyStatus"],
    },
    {
      key: "paris-copro-tenant",
      title: {
        en: "Copropriété, tenants and social housing",
        fr: "Copropriété, locataires et parc social",
      },
      instruction: {
        en: "In copropriété, STR must comply with the règlement de copropriété. Since 21 November 2024, new bylaws must state whether furnished tourist rental is allowed; existing bylaws may be amended to ban STR in units that are not primary residences where commercial activity is already banned. Any co-owner or tenant who registers must inform the syndic. Tenants need landlord authorization to sub-let. Furnished tourist rental is strictly forbidden in social housing (bail termination risk). A 2025 mayoral arrêté bans key boxes on street furniture; they may be removed if installed.",
        fr: "En copropriété, la location meublée touristique doit respecter le règlement de copropriété. Depuis le 21 novembre 2024, les nouveaux règlements doivent prévoir si elle est autorisée ; les règlements existants peuvent interdire la location dans les logements autres que résidence principale lorsque l'activité commerciale est déjà interdite. Tout copropriétaire ou locataire enregistré doit informer le syndic. Le bailleur doit autoriser la sous-location. La location est strictement interdite dans le parc social (risque de résiliation du bail). Un arrêté de 2025 interdit les boîtes à clés sur le mobilier urbain ; elles peuvent être retirées.",
      },
      officialUrls: [
        {
          url: PARIS_RULES_URL,
          label: {
            en: "City of Paris — copropriété and tenant section",
            fr: "Ville de Paris — section copropriété et locataire",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["Co-ownership bylaws", "Landlord sub-letting authorization (tenants)", "Syndic notice plan"],
        fr: [
          "Règlement de copropriété",
          "Autorisation de sous-location (locataires)",
          "Plan d'information du syndic",
        ],
      },
      fieldHints: ["address", "city", "propertyType", "residencyStatus"],
    },
    {
      key: "paris-change-of-use",
      title: {
        en: "Change-of-use with compensation (non-primary housing)",
        fr: "Changement d'usage avec compensation (logement non principale)",
      },
      instruction: {
        en: "For housing that is not your primary residence, obtain change-of-use authorization with compensation first (transform non-residential premises into housing to offset the loss of permanent rental stock). Use the official simulator and select « meublés de tourisme ». Open data lists past compensation decisions on opendata.paris.fr. Do not rent until all required authorizations are delivered; they are required from day 1.",
        fr: "Pour un logement qui n'est pas votre résidence principale, obtenez d'abord une autorisation de changement d'usage avec compensation. Utilisez le simulateur officiel et choisissez « meublés de tourisme ». Les décisions passées sont listées en open data sur opendata.paris.fr. Ne louez pas avant la délivrance de toutes les autorisations ; elles sont exigées dès le 1er jour.",
      },
      officialUrls: [
        {
          url: PARIS_CHANGE_OF_USE_PORTAL,
          label: {
            en: "Paris — change-of-use simulator and portal",
            fr: "Paris — simulateur et portail changement d'usage",
          },
          role: "portal",
          urlVerified: true,
        },
        {
          url: PARIS_CHANGE_OF_USE_INFO,
          label: {
            en: "City of Paris — change-of-use information",
            fr: "Ville de Paris — informations changement d'usage",
          },
          role: "info",
          urlVerified: true,
        },
        {
          url: PARIS_OPENDATA_CHANGE_OF_USE_URL,
          label: {
            en: "Open data — change-of-use with compensation authorisations",
            fr: "Open data — autorisations changement d'usage avec compensation",
          },
          role: "info",
          urlVerified: true,
        },
      ],
      documents: {
        en: [
          "Property deed and floor plans",
          "Compensation property details",
          "Co-ownership bylaws (if applicable)",
        ],
        fr: [
          "Titre de propriété et plans",
          "Détails du bien de compensation",
          "Règlement de copropriété (le cas échéant)",
        ],
      },
      appliesWhen: "nonPrimary",
      pitfalls: {
        en: "Fines up to €100,000 plus astreinte up to €1,000 per day per m² may apply for secondary STR without change-of-use authorization.",
        fr: "Des amendes jusqu'à 100 000 € plus astreinte jusqu'à 1 000 € par jour et par m² peuvent s'appliquer sans autorisation de changement d'usage.",
      },
      fieldHints: ["address", "city", "propertyType", "residencyStatus"],
    },
    {
      key: "paris-basu-destination",
      title: {
        en: "Change of destination to hébergement hôtelier (BASU)",
        fr: "Changement de destination en hébergement hôtelier (BASU)",
      },
      instruction: {
        en: "After change-of-use with compensation (non-primary housing), you must obtain change of destination to hébergement hôtelier from the Direction de l'Urbanisme (BASU) before any online registration. Contact BASU via the official contacts page. This step is mandatory before filing the meublé declaration.",
        fr: "Après le changement d'usage avec compensation (logement non principale), obtenez le changement de destination en hébergement hôtelier auprès du BASU (Direction de l'Urbanisme) avant toute déclaration en ligne. Contactez le BASU via la page contacts officielle. Cette étape est obligatoire avant la déclaration.",
      },
      officialUrls: [
        {
          url: PARIS_BASU_CONTACT_URL,
          label: {
            en: "City of Paris — BASU contacts",
            fr: "Ville de Paris — contacts BASU",
          },
          role: "info",
          urlVerified: true,
        },
        {
          url: PARIS_RULES_URL,
          label: {
            en: "City of Paris — non-primary housing steps (reference)",
            fr: "Ville de Paris — étapes logement non principale (référence)",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["Change-of-use authorization decision", "BASU correspondence or file reference"],
        fr: ["Décision de changement d'usage", "Référence dossier BASU"],
      },
      appliesWhen: "nonPrimary",
      timeline: {
        en: "Complete before online registration. Required from day 1 of rental once urbanism path applies.",
        fr: "À finaliser avant la déclaration en ligne. Exigé dès le 1er jour de location lorsque la voie urbanisme s'applique.",
      },
      fieldHints: ["address", "city", "propertyType", "residencyStatus"],
    },
    {
      key: "paris-commercial-authorization",
      title: {
        en: "Commercial or artisanal premises authorization",
        fr: "Autorisation local commercial ou artisanal",
      },
      instruction: {
        en: "For commercial or artisanal premises, request prior authorization under the municipal regulation for commercial and artisan premises via the Démarches d'urbanisme online service, then declare the meublé and pay taxe de séjour. Rental is only allowed after all authorizations are delivered, from day 1.",
        fr: "Pour un local commercial ou artisanal, demandez l'autorisation préalable au titre du règlement municipal via le service en ligne Démarches d'urbanisme, puis déclarez le meublé et acquittez la taxe de séjour. La location n'est possible qu'après délivrance de toutes les autorisations, dès le 1er jour.",
      },
      officialUrls: [
        {
          url: PARIS_URBANISM_DEMARCHES_URL,
          label: {
            en: "City of Paris — Démarches d'urbanisme",
            fr: "Ville de Paris — Démarches d'urbanisme",
          },
          role: "portal",
          urlVerified: true,
        },
        {
          url: PARIS_RULES_URL,
          label: {
            en: "City of Paris — commercial or artisanal premises section",
            fr: "Ville de Paris — section local commercial ou artisanal",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["Proof of commercial or artisanal use", "Urbanism application dossier"],
        fr: ["Justificatif d'usage commercial ou artisanal", "Dossier Démarches d'urbanisme"],
      },
      appliesWhen: "commercialPremises",
      pitfalls: {
        en: "Fines up to €25,000 may apply for commercial or artisanal STR without authorization.",
        fr: "Des amendes jusqu'à 25 000 € peuvent s'appliquer sans autorisation pour un local commercial ou artisanal.",
      },
      fieldHints: ["address", "city", "propertyType"],
    },
    {
      key: "paris-other-destination",
      title: {
        en: "Change of destination (office, garage, other)",
        fr: "Changement de destination (bureau, garage, autre)",
      },
      instruction: {
        en: "For other non-habitation premises (for example office or garage), obtain authorization to change the destination to hébergement hôtelier via Démarches d'urbanisme, then declare the meublé and pay taxe de séjour. Rental is only allowed after authorizations are delivered, from day 1. Letting without urbanism authorization is penalized under criminal law; the City page does not publish a fine amount for this case.",
        fr: "Pour un autre local non résidentiel (par exemple bureau ou garage), obtenez le changement de destination en hébergement hôtelier via Démarches d'urbanisme, puis déclarez le meublé et acquittez la taxe de séjour. La location n'est possible qu'après délivrance des autorisations, dès le 1er jour. La location sans autorisation d'urbanisme est sanctionnée pénalement ; la page municipale ne publie pas de montant d'amende pour ce cas.",
      },
      officialUrls: [
        {
          url: PARIS_URBANISM_DEMARCHES_URL,
          label: {
            en: "City of Paris — Démarches d'urbanisme",
            fr: "Ville de Paris — Démarches d'urbanisme",
          },
          role: "portal",
          urlVerified: true,
        },
        {
          url: PARIS_RULES_URL,
          label: {
            en: "City of Paris — other premises section",
            fr: "Ville de Paris — section autre type de local",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["Proof of current premises use", "Urbanism change-of-destination dossier"],
        fr: ["Justificatif d'usage du local", "Dossier changement de destination"],
      },
      appliesWhen: "otherPremises",
      fieldHints: ["address", "city", "propertyType"],
    },
    declareStep(
      "paris-declare-registration",
      "primaryResidence",
      "Declare your furnished tourist rental online",
      "Déclarer votre meublé de tourisme en ligne",
      "Submit your declaration on teleservices.paris.fr (the dedicated téléservice). The registration number is issued immediately and must appear on every listing. The declaration must be filed by the loueur personally, not in the name of a conciergerie. Have your last taxe d'habitation notice ready for the identifiant du local at step 3 (bottom of page 4), or tick « J'identifie mon local autrement ».",
      "Déposez votre déclaration sur teleservices.paris.fr. Le numéro est délivré immédiatement et doit figurer sur chaque annonce. La déclaration doit être déposée par le loueur, pas au nom d'une conciergerie. Munissez-vous de votre avis de taxe d'habitation pour l'identifiant du local à l'étape 3 (bas de la page 4), ou cochez « J'identifie mon local autrement ».",
      [],
      []
    ),
    declareStep(
      "paris-declare-registration-nonPrimary",
      "nonPrimary",
      "Declare online (after urbanism authorizations)",
      "Déclarer en ligne (après autorisations d'urbanisme)",
      "After change-of-use with compensation and BASU change of destination, declare on teleservices.paris.fr. The loueur must file personally. Update listings with the number immediately.",
      "Après changement d'usage avec compensation et changement de destination BASU, déclarez sur teleservices.paris.fr. Le loueur dépose personnellement. Mettez le numéro sur vos annonces dès réception.",
      ["Change-of-use decision", "BASU change-of-destination proof"],
      ["Décision de changement d'usage", "Justificatif changement de destination BASU"]
    ),
    declareStep(
      "paris-declare-registration-commercial",
      "commercialPremises",
      "Declare online (after commercial authorization)",
      "Déclarer en ligne (après autorisation commerciale)",
      "After municipal commercial or artisan authorization, declare on teleservices.paris.fr and display the number on listings.",
      "Après autorisation commerciale ou artisanale, déclarez sur teleservices.paris.fr et affichez le numéro sur vos annonces.",
      ["Commercial or artisan authorization decision"],
      ["Décision d'autorisation commerciale ou artisanale"]
    ),
    declareStep(
      "paris-declare-registration-other",
      "otherPremises",
      "Declare online (after change of destination)",
      "Déclarer en ligne (après changement de destination)",
      "After change of destination to hébergement hôtelier via Démarches d'urbanisme, declare on teleservices.paris.fr.",
      "Après changement de destination en hébergement hôtelier via Démarches d'urbanisme, déclarez sur teleservices.paris.fr.",
      ["Change-of-destination authorization"],
      ["Autorisation de changement de destination"]
    ),
    {
      key: "paris-single-room-exempt",
      title: {
        en: "Single room in primary residence (no declaration)",
        fr: "Chambre seule en résidence principale (pas de déclaration)",
      },
      instruction: {
        en: "Renting a single room inside your primary residence does not require prior authorization or Paris meublé declaration, except for chambres d'hôtes. You may still owe taxe de séjour and must keep a guest police fiche for foreign guests. Host Registry can track stays without a Paris registration number for this layout.",
        fr: "La location d'une simple chambre dans votre résidence principale ne nécessite pas d'autorisation ni de déclaration meublé parisienne, sauf chambres d'hôtes. La taxe de séjour et la fiche police des voyageurs pour les clients étrangers peuvent toutefois s'appliquer. Host Registry peut suivre les séjours sans numéro d'enregistrement parisien pour ce cas.",
      },
      officialUrls: [
        {
          url: PARIS_RULES_URL,
          label: {
            en: "City of Paris — single room exemption",
            fr: "Ville de Paris — exemption chambre seule",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["Landlord authorization if tenant", "Guest register template for foreign guests"],
        fr: ["Autorisation du bailleur si locataire", "Modèle fiche police voyageurs"],
      },
      appliesWhen: "singleRoomExempt",
      fieldHints: ["propertyType", "residencyStatus"],
    },
    frSteps.taxDeclaration("paris"),
    frSteps.updateListings("paris"),
    frSteps.guestRegister("paris"),
  ];
}

export function buildParisPlaybook(
  frSteps: {
    taxDeclaration: (cityKey: string) => PlaybookStep;
    updateListings: (cityKey: string) => PlaybookStep;
    guestRegister: (cityKey: string) => PlaybookStep;
  }
): Playbook {
  return {
    id: "fr-paris",
    country: "France",
    city: "Paris",
    title: {
      en: "Paris furnished tourist rental",
      fr: "Location meublée touristique — Paris",
    },
    description: {
      en: "Four official situations: primary residence (90 nights/year), non-primary housing (change-of-use, BASU, then declaration), commercial or artisanal premises, and other premises. Host Registry tracks steps and documents; you file on Ville de Paris portals.",
      fr: "Quatre situations officielles : résidence principale (90 nuitées/an), logement non principale (changement d'usage, BASU, déclaration), local commercial ou artisanal, autre local. Host Registry suit les étapes ; vous déposez sur les portails de la Ville de Paris.",
    },
    sourceReviewedAt: "2026-03-25",
    steps: buildParisPlaybookSteps(frSteps),
  };
}
