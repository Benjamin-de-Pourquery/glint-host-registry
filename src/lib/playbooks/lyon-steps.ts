import type { Playbook, PlaybookStep } from "./types";

export const LYON_DECLARE_PAGE_URL =
  "https://www.lyon.fr/demarche/logement-habitat/declarer-un-meuble-de-tourisme";
export const LYON_CHANGE_OF_USE_PAGE_URL =
  "https://www.lyon.fr/demarche/logement-habitat/demander-le-changement-dusage-dun-logement-0";
export const LYON_DECLARE_FORM_URL =
  "https://e-services3.lyon.fr/formulaire/jsp/site/Portal.jsp?page=form&id_form=27";
export const LYON_HYPERCENTRE_MAP_URL = "http://cartes.lyon.fr/hypercentre/";
export const LYON_REGLEMENT_PDF_URL =
  "https://www.lyon.fr/sites/lyonfr/files/content/documents/2023-10/R%C3%A8glementation%20relative%20au%20changement%20d%27usage%20des%20locaux%20d%27habitation.pdf";
export const LYON_CHANGE_OF_USE_FORM_PDF_URL =
  "https://www.lyon.fr/sites/lyonfr/files/content/documents/2025-05/formulaire%20changement%20usage%202025%20Projet3%20fields-3.pdf";
export const LYON_TAXE_SEJOUR_URL = "https://taxe-sejour.grandlyon.com/";
export const LYON_SERVICE_HABITAT_PHONE = "04 26 99 62 18";
export const LYON_SERVICE_HABITAT_EMAIL = "habitat.usages@mairie-lyon.fr";

const serviceHabitatContactEn =
  `Service habitat: ${LYON_SERVICE_HABITAT_PHONE}, ${LYON_SERVICE_HABITAT_EMAIL}, or book an online appointment via the official changement d'usage page.`;
const serviceHabitatContactFr =
  `Service habitat : ${LYON_SERVICE_HABITAT_PHONE}, ${LYON_SERVICE_HABITAT_EMAIL}, ou rendez-vous en ligne via la page officielle changement d'usage.`;

export function buildLyonPlaybookSteps(
  frSteps: {
    taxDeclaration: (cityKey: string) => PlaybookStep;
    updateListings: (cityKey: string) => PlaybookStep;
    guestRegister: (cityKey: string) => PlaybookStep;
  }
): PlaybookStep[] {
  return [
    {
      key: "lyon-verify-rules",
      title: {
        en: "Pick your Lyon situation (four paths)",
        fr: "Identifier votre situation lyonnaise (4 cas)",
      },
      instruction: {
        en: `Ville de Lyon rules (lyon.fr, verified October 2026): (1) Primary residence: online declaration via the official page (links to the téléservice), registration number immediately, up to 90 nights per year without other formalities. (2) Non-primary inside the hypercentre: changement d'usage with compensation from the 1st m² (same arrondissement, inside hypercentre). (3) Non-primary outside hypercentre, under 35 m², natural person: the Métropole règlement (art. 13.1.a) allows one temporary personal authorization without compensation (9 years, non-renewable, one dwelling per owner in Lyon), but the city's changement d'usage page states a compensation condition for the 9-year authorization. Confirm with the Service habitat before relying on any path. (4) Outside hypercentre, 35 m² or more, or legal entity: compensation from the 1st m². Set residency, postal code (69001 to 69009), surface, hypercentre and owner type in Host Registry so the correct steps appear. ${serviceHabitatContactEn}`,
        fr: `Règles Ville de Lyon (lyon.fr, vérifiées en octobre 2026) : (1) Résidence principale : déclaration en ligne via la page officielle (lien vers le téléservice), numéro immédiat, jusqu'à 90 nuitées par an sans autre formalité. (2) Non principale dans l'hypercentre : changement d'usage avec compensation dès le 1er m² (même arrondissement, dans l'hypercentre). (3) Hors hypercentre, moins de 35 m², personne physique : le règlement métropolitain (art. 13.1.a) prévoit une autorisation personnelle temporaire sans compensation (9 ans, non renouvelable, un logement par propriétaire à Lyon), mais la page changement d'usage de la Ville indique une condition de compensation pour l'autorisation de 9 ans. Confirmez avec le Service habitat avant de vous engager. (4) Hors hypercentre, 35 m² ou plus, ou personne morale : compensation dès le 1er m². Renseignez résidence, code postal (69001 à 69009), surface, hypercentre et type de propriétaire dans Host Registry. ${serviceHabitatContactFr}`,
      },
      officialUrls: [
        {
          url: LYON_DECLARE_PAGE_URL,
          label: {
            en: "Ville de Lyon: declare a furnished tourist rental",
            fr: "Ville de Lyon : déclarer un meublé de tourisme",
          },
          role: "rules",
          urlVerified: true,
        },
        {
          url: LYON_CHANGE_OF_USE_PAGE_URL,
          label: {
            en: "Ville de Lyon: change-of-use procedures",
            fr: "Ville de Lyon : changement d'usage",
          },
          role: "info",
          urlVerified: true,
        },
        {
          url: LYON_REGLEMENT_PDF_URL,
          label: {
            en: "Métropole de Lyon: change-of-use règlement (PDF)",
            fr: "Métropole de Lyon : règlement changement d'usage (PDF)",
          },
          role: "rules",
          urlVerified: true,
        },
        {
          url: LYON_HYPERCENTRE_MAP_URL,
          label: {
            en: "Hypercentre map (linked from lyon.fr)",
            fr: "Carte hypercentre (lien depuis lyon.fr)",
          },
          role: "info",
          urlVerified: false,
        },
      ],
      documents: {
        en: [
          "Primary vs non-primary residence (8+ months occupancy for primary)",
          "Postal code 69001 to 69009",
          "Habitable surface in m²",
          "Hypercentre location (check official map)",
          "Natural person vs legal entity owner",
        ],
        fr: [
          "Résidence principale ou non (occupation 8+ mois pour principale)",
          "Code postal 69001 à 69009",
          "Surface habitable en m²",
          "Localisation hypercentre (carte officielle)",
          "Personne physique ou morale propriétaire",
        ],
      },
      fieldHints: [
        "address",
        "city",
        "country",
        "postalCode",
        "propertyType",
        "residencyStatus",
        "habitableSurfaceM2",
        "lyonInHypercentre",
        "ownerIsLegalEntity",
      ],
    },
    {
      key: "lyon-copro-syndic",
      title: {
        en: "Inform the syndic (copropriété)",
        fr: "Informer le syndic (copropriété)",
      },
      instruction: {
        en: "After you declare, inform the syndic. The syndic must place an information item on the next general meeting agenda (art. 9-2 loi 65-557, loi 2024-1039 art. 8). Obtain co-ownership and landlord approvals where required before renting.",
        fr: "Après la déclaration, informez le syndic. Il doit inscrire un point d'information à l'ordre du jour de la prochaine AG (art. 9-2 loi 65-557, loi 2024-1039 art. 8). Obtenez les accords de copropriété et du bailleur si nécessaire avant de louer.",
      },
      officialUrls: [
        {
          url: LYON_DECLARE_PAGE_URL,
          label: {
            en: "Ville de Lyon: copropriété section",
            fr: "Ville de Lyon : section copropriété",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: ["Syndic notice plan", "Co-ownership bylaws extract", "Landlord authorization if tenant"],
        fr: [
          "Plan d'information du syndic",
          "Extrait règlement de copropriété",
          "Autorisation du bailleur si locataire",
        ],
      },
      appliesWhen: "always",
      fieldHints: ["address", "city", "propertyType", "residencyStatus"],
    },
    {
      key: "lyon-hypercentre-check",
      title: {
        en: "Confirm hypercentre perimeter",
        fr: "Vérifier le périmètre hypercentre",
      },
      instruction: {
        en: "Inside the hypercentre, change-of-use requires compensation from the 1st m² for any applicant. Compensation premises must be in the hypercentre and the same arrondissement (règlement art. 12). Use the interactive map linked from the official lyon.fr pages (cartes.lyon.fr may be unavailable from some networks).",
        fr: "Dans l'hypercentre, le changement d'usage exige une compensation dès le 1er m² pour tout demandeur. Le bien de compensation doit être dans l'hypercentre et le même arrondissement (règlement art. 12). Utilisez la carte interactive accessible depuis les pages lyon.fr (cartes.lyon.fr peut être indisponible selon les réseaux).",
      },
      officialUrls: [
        {
          url: LYON_CHANGE_OF_USE_PAGE_URL,
          label: {
            en: "Ville de Lyon: hypercentre and map link",
            fr: "Ville de Lyon : hypercentre et lien carte",
          },
          role: "info",
          urlVerified: true,
        },
        {
          url: LYON_HYPERCENTRE_MAP_URL,
          label: {
            en: "Hypercentre map (secondary)",
            fr: "Carte hypercentre (lien secondaire)",
          },
          role: "info",
          urlVerified: false,
        },
      ],
      appliesWhen: "lyonNonPrimaryHypercentre",
      documents: {
        en: ["Hypercentre map (via lyon.fr)", "Arrondissement postal code 69001 to 69009"],
        fr: ["Carte hypercentre (via lyon.fr)", "Code postal arrondissement 69001 à 69009"],
      },
      fieldHints: ["lyonInHypercentre", "postalCode", "address"],
    },
    {
      key: "lyon-change-of-use-hypercentre",
      title: {
        en: "Changement d'usage with compensation (hypercentre)",
        fr: "Changement d'usage avec compensation (hypercentre)",
      },
      instruction: {
        en: `File a changement d'usage request with the Service habitat before any rental. Compensation from the 1st m²; compensation property in the hypercentre and same arrondissement. Download the 2025 form from the official page or use the PDF linked on lyon.fr. Email ${LYON_SERVICE_HABITAT_EMAIL} or post to Service habitat, 198 avenue Jean Jaurès, 69007 Lyon. Do not rely on the online registration number alone: it is not authorization.`,
        fr: `Déposez une demande de changement d'usage au Service habitat avant toute location. Compensation dès le 1er m² ; bien de compensation dans l'hypercentre et même arrondissement. Téléchargez le formulaire 2025 sur la page officielle ou le PDF sur lyon.fr. Envoyez à ${LYON_SERVICE_HABITAT_EMAIL} ou courrier au Service habitat, 198 avenue Jean Jaurès, 69007 Lyon. Le numéro d'enregistrement en ligne ne vaut pas autorisation.`,
      },
      officialUrls: [
        {
          url: LYON_CHANGE_OF_USE_PAGE_URL,
          label: {
            en: "Ville de Lyon: change-of-use application",
            fr: "Ville de Lyon : demande changement d'usage",
          },
          role: "portal",
          urlVerified: true,
        },
        {
          url: LYON_CHANGE_OF_USE_FORM_PDF_URL,
          label: {
            en: "Changement d'usage form 2025 (PDF)",
            fr: "Formulaire changement d'usage 2025 (PDF)",
          },
          role: "form",
          urlVerified: true,
        },
        {
          url: LYON_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 12 (reference)",
            fr: "Règlement art. 12 (référence)",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: [
          "Completed changement d'usage form",
          "Interior plans (+ compensation premises plans)",
          "Co-ownership bylaws extract",
          "DPE for tourist-rental project",
          "Ownership / notarial documents as applicable",
        ],
        fr: [
          "Formulaire changement d'usage complété",
          "Plans intérieurs (+ plans bien de compensation)",
          "Extrait règlement de copropriété",
          "DPE projet location touristique",
          "Pièces propriété / notaire selon cas",
        ],
      },
      appliesWhen: "lyonNonPrimaryHypercentre",
      pitfalls: {
        en: "The 2023 règlement (art. 15, CCH L.651-2/L.651-3) quotes a civil fine up to €50,000, return-to-housing order and astreinte up to €1,000/day/m² for breaches; national ceilings may have changed since loi 2024-1039.",
        fr: "Le règlement 2023 (art. 15, CCH L.651-2/L.651-3) cite une amende civile jusqu'à 50 000 €, remise en logement et astreinte jusqu'à 1 000 €/jour/m² ; les plafonds nationaux ont pu évoluer depuis la loi 2024-1039.",
      },
      fieldHints: ["address", "city", "postalCode", "habitableSurfaceM2", "lyonInHypercentre"],
    },
    {
      key: "lyon-change-of-use-outside-temp-confirm",
      title: {
        en: "Outside hypercentre, under 35 m²: confirm with Service habitat",
        fr: "Hors hypercentre, moins de 35 m² : confirmer avec le Service habitat",
      },
      instruction: {
        en: `The Métropole règlement (art. 13.1.a) describes one temporary personal authorization without compensation for a natural person (under 35 m², outside hypercentre, 9 years non-renewable, one dwelling per owner in Lyon). The Ville de Lyon changement d'usage page states that the 9-year authorization is conditional on compensation. Do not treat "no compensation" as certain. Contact the Service habitat (${LYON_SERVICE_HABITAT_PHONE}, ${LYON_SERVICE_HABITAT_EMAIL}, or online appointment on the official page) before filing or renting. Additional units or a definitive (à titre réel) authorization require compensation and hébergement hôtelier destination.`,
        fr: `Le règlement métropolitain (art. 13.1.a) prévoit une autorisation personnelle temporaire sans compensation pour une personne physique (moins de 35 m², hors hypercentre, 9 ans non renouvelable, un logement par propriétaire à Lyon). La page changement d'usage de la Ville indique que l'autorisation de 9 ans est conditionnée à une compensation. Ne considérez pas l'absence de compensation comme acquise. Contactez le Service habitat (${LYON_SERVICE_HABITAT_PHONE}, ${LYON_SERVICE_HABITAT_EMAIL}, ou rendez-vous en ligne sur la page officielle) avant de déposer ou louer. Tout bien supplémentaire ou une autorisation à titre réel exigent une compensation et une destination hébergement hôtelier.`,
      },
      officialUrls: [
        {
          url: LYON_CHANGE_OF_USE_PAGE_URL,
          label: {
            en: "Ville de Lyon: change-of-use (compensation wording)",
            fr: "Ville de Lyon : changement d'usage (mention compensation)",
          },
          role: "info",
          urlVerified: true,
        },
        {
          url: LYON_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 13.1.a (reference)",
            fr: "Règlement art. 13.1.a (référence)",
          },
          role: "rules",
          urlVerified: true,
        },
        {
          url: LYON_DECLARE_PAGE_URL,
          label: {
            en: "Ville de Lyon: declare page (non-primary rules)",
            fr: "Ville de Lyon : page déclarer (règles non principale)",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: [
          "Written confirmation from Service habitat on compensation requirement",
          "Changement d'usage dossier if compensation applies",
          "Proof of no prior temporary authorization in Lyon (one per natural person)",
        ],
        fr: [
          "Confirmation écrite du Service habitat sur la compensation",
          "Dossier changement d'usage si compensation requise",
          "Justificatif d'absence d'autorisation temporaire antérieure à Lyon",
        ],
      },
      appliesWhen: "lyonOutsideUnder35NaturalConfirm",
      pitfalls: {
        en: "Host Registry flags this branch as confirm with Service habitat. Glint does not submit changement d'usage files for you.",
        fr: "Host Registry signale cette branche : à confirmer avec le Service habitat. Glint ne dépose pas les dossiers changement d'usage pour vous.",
      },
      fieldHints: [
        "habitableSurfaceM2",
        "lyonInHypercentre",
        "ownerIsLegalEntity",
        "residencyStatus",
      ],
    },
    {
      key: "lyon-change-of-use-compensation-outside",
      title: {
        en: "Changement d'usage with compensation (outside hypercentre)",
        fr: "Changement d'usage avec compensation (hors hypercentre)",
      },
      instruction: {
        en: `For non-primary properties outside the hypercentre when surface is 35 m² or more, or the owner is a legal entity, compensation is required from the 1st m² (règlement art. 13.1.b and 13.2). lyon.fr describes compensation with a property of identical surface (+/- 5%) in the same arrondissement. Units from a division within the last 10 years: compensation on the total surface of the original lot (art. 14). File via the official changement d'usage page: ${LYON_SERVICE_HABITAT_EMAIL}, ${LYON_SERVICE_HABITAT_PHONE}.`,
        fr: `Pour les biens non principaux hors hypercentre lorsque la surface est de 35 m² ou plus, ou que le propriétaire est une personne morale, la compensation est exigée dès le 1er m² (règlement art. 13.1.b et 13.2). lyon.fr décrit une compensation avec un bien de surface identique (+/- 5 %) dans le même arrondissement. Logements issus d'une division depuis moins de 10 ans : compensation sur la surface totale du lot d'origine (art. 14). Déposez via la page officielle changement d'usage : ${LYON_SERVICE_HABITAT_EMAIL}, ${LYON_SERVICE_HABITAT_PHONE}.`,
      },
      officialUrls: [
        {
          url: LYON_CHANGE_OF_USE_PAGE_URL,
          label: {
            en: "Ville de Lyon: change-of-use application",
            fr: "Ville de Lyon : demande changement d'usage",
          },
          role: "portal",
          urlVerified: true,
        },
        {
          url: LYON_CHANGE_OF_USE_FORM_PDF_URL,
          label: {
            en: "Changement d'usage form 2025 (PDF)",
            fr: "Formulaire changement d'usage 2025 (PDF)",
          },
          role: "form",
          urlVerified: true,
        },
        {
          url: LYON_REGLEMENT_PDF_URL,
          label: {
            en: "Métropole règlement (reference)",
            fr: "Règlement métropole (référence)",
          },
          role: "rules",
          urlVerified: true,
        },
      ],
      documents: {
        en: [
          "Compensation property details",
          "Interior and compensation plans",
          "Co-ownership bylaws extract",
          "DPE for tourist-rental project",
        ],
        fr: [
          "Détails du bien de compensation",
          "Plans intérieurs et de compensation",
          "Extrait règlement de copropriété",
          "DPE projet location touristique",
        ],
      },
      appliesWhen: "lyonNonPrimaryCompensationRequired",
      fieldHints: ["habitableSurfaceM2", "ownerIsLegalEntity", "postalCode", "address"],
    },
    {
      key: "lyon-change-of-use-generic",
      title: {
        en: "Changement d'usage before registration (non-primary)",
        fr: "Changement d'usage avant enregistrement (non principale)",
      },
      instruction: {
        en: `For non-primary residences, complete hypercentre, surface and owner type in Host Registry to see the precise branch. Until then, review the official changement d'usage page and règlement. The registration number does not authorize rental without prior authorization. ${serviceHabitatContactEn}`,
        fr: `Pour les résidences non principales, complétez hypercentre, surface et type de propriétaire dans Host Registry pour afficher la branche précise. En attendant, consultez la page changement d'usage et le règlement. Le numéro d'enregistrement n'autorise pas la location sans autorisation préalable. ${serviceHabitatContactFr}`,
      },
      officialUrls: [
        {
          url: LYON_CHANGE_OF_USE_PAGE_URL,
          label: {
            en: "Ville de Lyon: change-of-use procedures",
            fr: "Ville de Lyon : procédures changement d'usage",
          },
          role: "info",
          urlVerified: true,
        },
      ],
      appliesWhen: "lyonNonPrimaryDetailsPending",
      documents: {
        en: ["Hypercentre yes/no", "Habitable surface m²", "Natural person vs legal entity"],
        fr: ["Hypercentre oui/non", "Surface habitable m²", "Personne physique ou morale"],
      },
      fieldHints: [
        "residencyStatus",
        "habitableSurfaceM2",
        "lyonInHypercentre",
        "ownerIsLegalEntity",
      ],
    },
    {
      key: "lyon-declare-registration-primary",
      title: {
        en: "Declare online (primary residence)",
        fr: "Déclarer en ligne (résidence principale)",
      },
      instruction: {
        en: "Open the official Ville de Lyon declaration page and follow the link to the online téléservice. Complete the form to receive your registration number immediately. Display it on every listing. Host Registry tracks and reminds; you file on the official téléservice yourself. The direct e-services3.lyon.fr URL is listed on lyon.fr but may be unreachable from some networks: use the lyon.fr page as your primary entry point.",
        fr: "Ouvrez la page officielle de déclaration de la Ville de Lyon et suivez le lien vers le téléservice en ligne. Complétez le formulaire pour obtenir immédiatement votre numéro. Affichez-le sur chaque annonce. Host Registry suit et rappelle ; vous déposez vous-même sur le téléservice officiel. L'URL directe e-services3.lyon.fr est indiquée sur lyon.fr mais peut être inaccessible selon les réseaux : privilégiez la page lyon.fr.",
      },
      officialUrls: [
        {
          url: LYON_DECLARE_PAGE_URL,
          label: {
            en: "Ville de Lyon: declaration page (start here)",
            fr: "Ville de Lyon : page déclaration (point d'entrée)",
          },
          role: "form",
          urlVerified: true,
        },
        {
          url: LYON_DECLARE_FORM_URL,
          label: {
            en: "Online téléservice (secondary, from lyon.fr)",
            fr: "Téléservice en ligne (secondaire, depuis lyon.fr)",
          },
          role: "portal",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["National ID", "Proof of ownership", "Primary residence status"],
        fr: ["Pièce d'identité", "Justificatif de propriété", "Statut résidence principale"],
      },
      timeline: {
        en: "Registration number issued immediately after online submission.",
        fr: "Numéro délivré immédiatement après la déclaration en ligne.",
      },
      appliesWhen: "primaryResidence",
      fieldHints: ["name", "address", "city", "postalCode", "residencyStatus"],
    },
    {
      key: "lyon-declare-registration-non-primary",
      title: {
        en: "Declare online (after changement d'usage authorization)",
        fr: "Déclarer en ligne (après autorisation changement d'usage)",
      },
      instruction: {
        en: "After changement d'usage authorization, use the official declaration page (link to téléservice). The registration number is sent by email after the online declaration and must appear on listings. Start from lyon.fr, not a bookmarked e-services URL alone.",
        fr: "Après autorisation de changement d'usage, utilisez la page officielle de déclaration (lien vers le téléservice). Le numéro est envoyé par email après la déclaration en ligne et doit figurer sur les annonces. Partez de lyon.fr, pas seulement d'une URL e-services enregistrée.",
      },
      officialUrls: [
        {
          url: LYON_DECLARE_PAGE_URL,
          label: {
            en: "Ville de Lyon: declaration page (start here)",
            fr: "Ville de Lyon : page déclaration (point d'entrée)",
          },
          role: "form",
          urlVerified: true,
        },
        {
          url: LYON_DECLARE_FORM_URL,
          label: {
            en: "Online téléservice (secondary)",
            fr: "Téléservice en ligne (secondaire)",
          },
          role: "portal",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Change-of-use authorization decision", "National ID", "Proof of ownership"],
        fr: [
          "Décision d'autorisation de changement d'usage",
          "Pièce d'identité",
          "Justificatif de propriété",
        ],
      },
      appliesWhen: "nonPrimary",
      fieldHints: ["name", "address", "city", "residencyStatus"],
    },
    frSteps.taxDeclaration("lyon"),
    frSteps.updateListings("lyon"),
    frSteps.guestRegister("lyon"),
  ];
}

export function buildLyonPlaybook(
  frSteps: {
    taxDeclaration: (cityKey: string) => PlaybookStep;
    updateListings: (cityKey: string) => PlaybookStep;
    guestRegister: (cityKey: string) => PlaybookStep;
  }
): Playbook {
  return {
    id: "fr-lyon",
    country: "France",
    city: "Lyon",
    title: {
      en: "Lyon furnished tourist rental",
      fr: "Location meublée touristique : Lyon",
    },
    description: {
      en: "Primary residence: declaration on lyon.fr (90 nights/year). Non-primary: changement d'usage paths by zone and surface. Host Registry tracks steps; you file on Ville de Lyon portals.",
      fr: "Résidence principale : déclaration sur lyon.fr (90 nuitées/an). Non principale : voies changement d'usage selon zone et surface. Host Registry suit les étapes ; vous déposez sur les portails de la Ville de Lyon.",
    },
    sourceReviewedAt: "2026-10-07",
    steps: buildLyonPlaybookSteps(frSteps),
  };
}
