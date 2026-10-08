import type { Playbook, PlaybookStep } from "./types";

export const MARSEILLE_CHANGE_OF_USE_PAGE_URL =
  "https://www.marseille.fr/logement-urbanisme/logement/changements-d-usage";
export const MARSEILLE_TAXE_SEJOUR_PAGE_URL =
  "https://www.marseille.fr/decouvrir-marseille/une-ville-de-tourisme/la-taxe-de-sejour";
/** Browser entry point; redirects to the verified portal URL below. */
export const MARSEILLE_PORTAL_DISPLAY_URL = "https://taxedesejour.marseille.fr";
export const MARSEILLE_PORTAL_VERIFIED_URL =
  "https://taxedesejour.ofeaweb.fr/ts/marseille";
export const MARSEILLE_REGLEMENT_PDF_URL =
  "https://www.marseille.fr/sites/default/files/contenu/logement/Taxe-Sejour/reglement-de-changement-usage-20250227.pdf";

const ARRONDISSEMENT_GROUPS_EN =
  "1-2-3, 4-5-6, 7-8-9, 10-11-12, 13-14-15-16";
const ARRONDISSEMENT_GROUPS_FR =
  "1-2-3, 4-5-6, 7-8-9, 10-11-12, 13-14-15-16";

export function buildMarseillePlaybookSteps(
  frSteps: {
    taxDeclaration: (cityKey: string) => PlaybookStep;
    updateListings: (cityKey: string) => PlaybookStep;
    guestRegister: (cityKey: string) => PlaybookStep;
  }
): PlaybookStep[] {
  return [
    {
      key: "marseille-verify-rules",
      title: {
        en: "Pick your Marseille situation (four paths)",
        fr: "Identifier votre situation marseillaise (4 cas)",
      },
      instruction: {
        en: `Ville de Marseille rules (marseille.fr and the 2025 change-of-use règlement, checked October 2026): (1) Primary residence (occupied at least 8 months per year): mandatory online declaration on taxedesejour.marseille.fr (host account), 13-digit number on every listing, max 90 tourist nights per year without change-of-use authorisation. (2) Non-primary (secondary, vacant, investment): change-of-use authorisation with compensation from day 1 in all 16 arrondissements before renting. (3) Social housing: furnished tourist rental is prohibited. Add marseille:social-housing in property notes if this applies. (4) Existing temporary authorisation under the June 2021 regime: when it ends you need a new authorisation under the 2025 compensation regime; add marseille:legacy-2021 in notes to surface renewal steps. Set residency status and include a Marseille postal code (13001 to 13016) in the address for arrondissement groups. Host Registry, by Glint, prepares checklists and reminders. We never file with the city for you.`,
        fr: `Règles Ville de Marseille (marseille.fr et règlement changement d'usage 2025, vérifiées en octobre 2026) : (1) Résidence principale (occupée au moins 8 mois/an) : déclaration obligatoire sur taxedesejour.marseille.fr (compte hébergeur), numéro à 13 chiffres sur chaque annonce, 90 nuitées touristiques max par an sans autorisation de changement d'usage. (2) Hors résidence principale : autorisation de changement d'usage avec compensation dès le 1er jour dans les 16 arrondissements avant toute location. (3) Logement social : location meublée touristique interdite. Ajoutez marseille:social-housing dans les notes du bien si applicable. (4) Autorisation temporaire 2021 : à l'échéance, nouvelle autorisation au régime 2025 avec compensation ; ajoutez marseille:legacy-2021 dans les notes. Renseignez le statut de résidence et un code postal marseillais (13001 à 13016) dans l'adresse pour les groupes d'arrondissements. Host Registry, par Glint, prépare checklists et rappels. Nous ne déposons rien à la Ville pour vous.`,
      },
      officialUrls: [
        {
          url: MARSEILLE_CHANGE_OF_USE_PAGE_URL,
          label: {
            en: "Ville de Marseille: furnished tourist rental and change of use",
            fr: "Ville de Marseille : meublé de tourisme et changement d'usage",
          },
          role: "rules",
          urlVerified: false,
        },
        {
          url: MARSEILLE_TAXE_SEJOUR_PAGE_URL,
          label: {
            en: "Ville de Marseille: taxe de séjour and furnished rentals",
            fr: "Ville de Marseille : taxe de séjour et meublés",
          },
          role: "info",
          urlVerified: false,
        },
        {
          url: MARSEILLE_REGLEMENT_PDF_URL,
          label: {
            en: "Métropole AMP: change-of-use règlement (PDF, Feb 2025)",
            fr: "Métropole AMP : règlement changement d'usage (PDF, fév. 2025)",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      documents: {
        en: [
          "Primary vs non-primary residence",
          "Marseille postal code 13001 to 13016 in the address",
          "Property notes: marseille:social-housing or marseille:legacy-2021 if relevant",
        ],
        fr: [
          "Résidence principale ou hors principale",
          "Code postal 13001 à 13016 dans l'adresse",
          "Notes : marseille:social-housing ou marseille:legacy-2021 si pertinent",
        ],
      },
      appliesWhen: "always",
      fieldHints: ["address", "city", "country", "propertyType", "residencyStatus", "notes"],
    },
    {
      key: "marseille-social-housing-prohibited",
      title: {
        en: "Social housing: furnished tourist rental prohibited",
        fr: "Logement social : meublé de tourisme interdit",
      },
      instruction: {
        en: "The change-of-use règlement prohibits furnished tourist rental in social housing. Do not list this unit for short-term tourist use. Check with the Ville de Marseille if your tenure status is unclear.",
        fr: "Le règlement de changement d'usage interdit la location meublée touristique dans le logement social. Ne proposez pas ce logement en location touristique courte durée. Vérifiez auprès de la Ville de Marseille si votre statut n'est pas clair.",
      },
      officialUrls: [
        {
          url: MARSEILLE_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 12 (refusal grounds)",
            fr: "Règlement art. 12 (motifs de refus)",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      documents: { en: [], fr: [] },
      appliesWhen: "marseilleSocialHousing",
      fieldHints: ["notes", "residencyStatus"],
    },
    {
      key: "marseille-legacy-2021-renewal",
      title: {
        en: "Renew after a 2021 temporary authorisation",
        fr: "Renouveler après une autorisation temporaire 2021",
      },
      instruction: {
        en: "Temporary authorisations granted under the June 2021 deliberation are not retroactively cancelled, but when yours ends you must obtain a new change-of-use authorisation under the 2025 compensation regime (from day 1, all arrondissements). Plan compensation, DPE, copropriété statement and the paper file at the Guichet unique before the expiry date.",
        fr: "Les autorisations temporaires au titre de la délibération de juin 2021 ne sont pas annulées rétroactivement, mais à leur échéance vous devez obtenir une nouvelle autorisation de changement d'usage au régime 2025 (compensation dès le 1er jour, tous arrondissements). Prévoyez compensation, DPE, attestation copropriété et dossier papier au Guichet unique avant la date de fin.",
      },
      officialUrls: [
        {
          url: MARSEILLE_CHANGE_OF_USE_PAGE_URL,
          label: {
            en: "Ville de Marseille: change-of-use procedures",
            fr: "Ville de Marseille : changement d'usage",
          },
          role: "info",
          urlVerified: false,
        },
        {
          url: MARSEILLE_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 18 (2021 authorisations)",
            fr: "Règlement art. 18 (autorisations 2021)",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      documents: { en: [], fr: [] },
      appliesWhen: "marseilleLegacy2021",
      fieldHints: ["notes", "residencyStatus"],
    },
    {
      key: "marseille-arrondissement-postal",
      title: {
        en: "Add Marseille postal code for arrondissement group",
        fr: "Ajouter le code postal pour le groupe d'arrondissements",
      },
      instruction: {
        en: `For non-primary change of use, compensation premises for a meublé de tourisme must sit in the same arrondissement group as the unit (${ARRONDISSEMENT_GROUPS_EN}). The only exception: if the compensation premises are social housing (loi SRU), they may be anywhere in Marseille. Add a Marseille postal code (13001 to 13016) to the property address so Host Registry can show the playbook steps that apply to your unit.`,
        fr: `Pour un changement d'usage hors résidence principale, le bien de compensation d'un meublé de tourisme doit être dans le même groupe d'arrondissements (${ARRONDISSEMENT_GROUPS_FR}). Seule exception : si la compensation porte sur du logement social (loi SRU), elle peut se situer n'importe où dans la commune. Ajoutez un code postal marseillais (13001 à 13016) à l'adresse du bien pour que Host Registry affiche les étapes du playbook qui s'appliquent à votre bien.`,
      },
      officialUrls: [
        {
          url: MARSEILLE_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 6 (arrondissement groups)",
            fr: "Règlement art. 6 (groupes d'arrondissements)",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Marseille postal code in property address"],
        fr: ["Code postal marseillais dans l'adresse du bien"],
      },
      appliesWhen: "marseilleArrondissementPending",
      fieldHints: ["address", "city"],
    },
    {
      key: "marseille-copro-primary",
      title: {
        en: "Check copropriété rules (primary residence)",
        fr: "Vérifier le règlement de copropriété (résidence principale)",
      },
      instruction: {
        en: "Even in primary residence, check whether the copropriété bylaws allow furnished tourist rental. The city may request a count of nights rented in the previous year (one month to answer). Failure to answer may lead to a civil fine of 5 000 EUR.",
        fr: "Même en résidence principale, vérifiez si le règlement de copropriété autorise la location meublée touristique. La Ville peut demander le décompte des nuitées de l'année précédente (un mois pour répondre). L'absence de réponse peut entraîner une amende civile de 5 000 EUR.",
      },
      officialUrls: [
        {
          url: MARSEILLE_CHANGE_OF_USE_PAGE_URL,
          label: {
            en: "Ville de Marseille: copropriété reminder",
            fr: "Ville de Marseille : rappel copropriété",
          },
          role: "info",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Co-ownership bylaws extract if applicable"],
        fr: ["Extrait règlement de copropriété le cas échéant"],
      },
      appliesWhen: "marseillePrimaryResidence",
      fieldHints: ["propertyType", "residencyStatus", "address"],
    },
    {
      key: "marseille-compensation-form",
      title: {
        en: "Choose a compensation form",
        fr: "Choisir une forme de compensation",
      },
      instruction: {
        en: "Non-primary furnished tourist rental requires compensation from the first unit. The règlement allows: (1) concomitant transformation of non-residential premises into housing (for example a shop converted to a long-term home), or (2) purchase of droits de commercialité from owners who transformed other premises into housing. Compensation must be concomitant and meet quality and surface rules (règlement art. 4 to 7).",
        fr: "La location meublée touristique hors résidence principale exige une compensation dès le premier logement. Le règlement prévoit : (1) transformation concomitante de locaux non résidentiels en logement (ex. commerce reconverti en logement longue durée), ou (2) achat de droits de commercialité auprès de propriétaires ayant transformé d'autres locaux en logement. La compensation doit être concomitante et respecter les règles de qualité et de surface (art. 4 à 7).",
      },
      officialUrls: [
        {
          url: MARSEILLE_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 4 (compensation forms)",
            fr: "Règlement art. 4 (formes de compensation)",
          },
          role: "rules",
          urlVerified: false,
        },
        {
          url: MARSEILLE_CHANGE_OF_USE_PAGE_URL,
          label: {
            en: "Ville de Marseille: change-of-use overview",
            fr: "Ville de Marseille : vue d'ensemble changement d'usage",
          },
          role: "info",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Compensation project outline", "Proof of non-residential or commercialité purchase"],
        fr: ["Projet de compensation", "Justificatif transformation ou droits de commercialité"],
      },
      appliesWhen: "marseilleNonPrimaryChangeOfUse",
      fieldHints: ["address", "notes"],
    },
    {
      key: "marseille-arrondissement-group-check",
      title: {
        en: "Confirm arrondissement group for compensation",
        fr: "Confirmer le groupe d'arrondissements pour la compensation",
      },
      instruction: {
        en: `For a meublé de tourisme, compensation premises must be in the same arrondissement group as the unit: ${ARRONDISSEMENT_GROUPS_EN}. The only exception: if the compensation premises are social housing (loi SRU), they may be anywhere in Marseille.`,
        fr: `Pour un meublé de tourisme, le bien de compensation doit être dans le même groupe d'arrondissements : ${ARRONDISSEMENT_GROUPS_FR}. Seule exception : si la compensation porte sur du logement social (loi SRU), elle peut se situer n'importe où dans la commune.`,
      },
      officialUrls: [
        {
          url: MARSEILLE_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 6 (same group rule)",
            fr: "Règlement art. 6 (règle du même groupe)",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Postal codes for unit and compensation premises"],
        fr: ["Codes postaux du bien et du bien de compensation"],
      },
      appliesWhen: "marseilleNonPrimaryWithArrondissement",
      fieldHints: ["address"],
    },
    {
      key: "marseille-dpe-check",
      title: {
        en: "Valid DPE classes A to E",
        fr: "DPE valide en classes A à E",
      },
      instruction: {
        en: "Change of use is refused without a valid energy performance diagnosis in classes A to E (classes A to D from 1 January 2034). Include the DPE in the paper file.",
        fr: "Le changement d'usage est refusé sans diagnostic de performance énergétique valide en classes A à E (classes A à D à partir du 1er janvier 2034). Joignez le DPE au dossier papier.",
      },
      officialUrls: [
        {
          url: MARSEILLE_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 12.3 (DPE)",
            fr: "Règlement art. 12.3 (DPE)",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Valid DPE certificate (classes A to E)"],
        fr: ["DPE valide (classes A à E)"],
      },
      appliesWhen: "marseilleNonPrimaryChangeOfUse",
      fieldHints: ["address", "propertyType"],
    },
    {
      key: "marseille-building-balance",
      title: {
        en: "50% building balance rule",
        fr: "Règle d'équilibre du bâtiment à 50 %",
      },
      instruction: {
        en: "The règlement requires habitable surface to stay at least 50% of the building and the number of homes must not fall below the number of meublés de tourisme in the building. No derogation applies for meublés de tourisme.",
        fr: "Le règlement exige que la surface habitable reste au moins à 50 % du bâtiment et que le nombre de logements ne descende pas en dessous du nombre de meublés de tourisme dans l'immeuble. Pas de dérogation pour les meublés de tourisme.",
      },
      officialUrls: [
        {
          url: MARSEILLE_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 2 (building balance)",
            fr: "Règlement art. 2 (équilibre du bâtiment)",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Building surface breakdown", "Unit count in building"],
        fr: ["Répartition des surfaces", "Nombre de logements dans l'immeuble"],
      },
      appliesWhen: "marseilleNonPrimaryChangeOfUse",
      fieldHints: ["address", "propertyType"],
    },
    {
      key: "marseille-copropriete-sworn-statement",
      title: {
        en: "Copropriété sworn statement",
        fr: "Attestation sur l'honneur copropriété",
      },
      instruction: {
        en: "The paper file must include a sworn statement that copropriété rules allow the project. Obtain syndic and co-owner approvals where required before filing.",
        fr: "Le dossier papier doit inclure une attestation sur l'honneur que le règlement de copropriété autorise le projet. Obtenez les accords du syndic et des copropriétaires si nécessaire avant le dépôt.",
      },
      officialUrls: [
        {
          url: MARSEILLE_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 13 (file contents)",
            fr: "Règlement art. 13 (pièces du dossier)",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["Sworn statement that copropriété rules allow the project"],
        fr: ["Attestation sur l'honneur d'autorisation copropriété"],
      },
      appliesWhen: "marseilleNonPrimaryChangeOfUse",
      fieldHints: ["address", "propertyType"],
    },
    {
      key: "marseille-change-of-use-file",
      title: {
        en: "File change-of-use authorisation at the Guichet unique",
        fr: "Déposer l'autorisation de changement d'usage au Guichet unique",
      },
      instruction: {
        en: "Submit a duplicate paper file: form with compensation, comparative annex (Annexe 2), listed supporting documents, DPE and copropriété sworn statement. File in person or by post at Service des Autorisations d'urbanisme, 38-40 rue Fauchier (ground floor), 13233 Marseille Cedex 20. Follow up at autorisationchangementusage@marseille.fr citing your file number. Incomplete file: two months to complete or tacit rejection. The sector (arrondissement) mayor gives an opinion within one month; silence counts as favourable (art. 14). Decision within two months of a complete file; silence after two months means deemed acceptance under art. 15, but the city may still withdraw or repeal the decision under the Code des relations entre le public et l'administration.",
        fr: "Déposez un dossier papier en double : formulaire avec compensation, annexe comparative (Annexe 2), pièces listées, DPE et attestation copropriété. Sur place ou par courrier au Service des Autorisations d'urbanisme, 38-40 rue Fauchier (rez-de-chaussée), 13233 Marseille Cedex 20. Suivi : autorisationchangementusage@marseille.fr avec le numéro de dossier. Dossier incomplet : deux mois pour compléter sinon rejet tacite. Le maire de secteur (arrondissement) rend un avis sous un mois ; le silence vaut avis favorable (art. 14). Décision sous deux mois après dossier complet ; silence à deux mois : acceptation tacite (art. 15), sous réserve de retrait ou abrogation par la collectivité (CRPA).",
      },
      officialUrls: [
        {
          url: MARSEILLE_CHANGE_OF_USE_PAGE_URL,
          label: {
            en: "Ville de Marseille: where to file",
            fr: "Ville de Marseille : où déposer",
          },
          role: "portal",
          urlVerified: false,
        },
        {
          url: MARSEILLE_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 13 to 15 (procedure)",
            fr: "Règlement art. 13 à 15 (procédure)",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      appliesWhen: "marseilleNonPrimaryChangeOfUse",
      documents: {
        en: [
          "Form with compensation + Annexe 2 comparative",
          "Valid DPE A to E",
          "Copropriété sworn statement",
          "Compensation project evidence",
        ],
        fr: [
          "Formulaire avec compensation + Annexe 2 comparative",
          "DPE valide A à E",
          "Attestation sur l'honneur copropriété",
          "Justificatifs projet de compensation",
        ],
      },
      timeline: {
        en: "Target two months for a decision once the file is complete.",
        fr: "Comptez deux mois pour une décision une fois le dossier complet.",
      },
      pitfalls: {
        en: "The 13-digit registration number is not authorisation when change of use is required.",
        fr: "Le numéro d'enregistrement à 13 chiffres ne vaut pas autorisation lorsque le changement d'usage est requis.",
      },
      fieldHints: ["address", "city", "name"],
    },
    {
      key: "marseille-daact-two-years",
      title: {
        en: "DAACT within two years",
        fr: "DAACT sous deux ans",
      },
      instruction: {
        en: "Authorisation becomes final only after the attestation d'achèvement et de conformité des travaux (DAACT). Without a DAACT after two years the city may revoke the authorisation. Compensation is published at the service de la publicité foncière.",
        fr: "L'autorisation ne devient définitive qu'après l'attestation d'achèvement et de conformité des travaux (DAACT). Sans DAACT après deux ans, la Ville peut abroger l'autorisation. La compensation est publiée au service de la publicité foncière.",
      },
      officialUrls: [
        {
          url: MARSEILLE_REGLEMENT_PDF_URL,
          label: {
            en: "Règlement art. 6 (DAACT)",
            fr: "Règlement art. 6 (DAACT)",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      documents: {
        en: ["DAACT timeline plan", "Works completion evidence"],
        fr: ["Calendrier DAACT", "Justificatifs d'achèvement des travaux"],
      },
      appliesWhen: "marseilleNonPrimaryChangeOfUse",
      fieldHints: ["address", "notes"],
    },
    {
      key: "marseille-declare-registration",
      title: {
        en: "Declare on taxedesejour.marseille.fr",
        fr: "Déclarer sur taxedesejour.marseille.fr",
      },
      instruction: {
        en: `Declaration is mandatory in all cases (primary or not). Create a host account on taxedesejour.marseille.fr (redirects to the official portal). After validation you receive a 13-digit registration number for every listing. This number is not change-of-use authorisation when that authorisation is required. You can print a récépissé from the account. Chambres d'hôtes use CERFA 13566*03 plus the account.`,
        fr: `La déclaration est obligatoire dans tous les cas (résidence principale ou non). Créez un compte hébergeur sur taxedesejour.marseille.fr (redirection vers le portail officiel). Après validation, vous recevez un numéro à 13 chiffres pour chaque annonce. Ce numéro ne vaut pas autorisation de changement d'usage lorsque celle-ci est requise. Un récépissé peut être imprimé depuis le compte. Chambres d'hôtes : CERFA 13566*03 et compte.`,
      },
      officialUrls: [
        {
          url: MARSEILLE_PORTAL_VERIFIED_URL,
          label: {
            en: "taxedesejour.marseille.fr (host account)",
            fr: "taxedesejour.marseille.fr (compte hébergeur)",
          },
          role: "portal",
          urlVerified: true,
        },
        {
          url: MARSEILLE_TAXE_SEJOUR_PAGE_URL,
          label: {
            en: "Ville de Marseille: taxe de séjour rules",
            fr: "Ville de Marseille : règles taxe de séjour",
          },
          role: "rules",
          urlVerified: false,
        },
      ],
      documents: {
        en: [
          "National ID or passport",
          "Proof of ownership or right to rent",
          "Change-of-use authorisation (if non-primary)",
        ],
        fr: [
          "Pièce d'identité",
          "Justificatif de propriété ou de droit de louer",
          "Autorisation de changement d'usage (si hors principale)",
        ],
      },
      appliesWhen: "marseilleNotSocialHousing",
      fieldHints: ["name", "address", "city", "country", "propertyType", "residencyStatus"],
    },
    frSteps.taxDeclaration("marseille"),
    frSteps.updateListings("marseille"),
    frSteps.guestRegister("marseille"),
  ];
}

export function buildMarseillePlaybook(
  frSteps: {
    taxDeclaration: (cityKey: string) => PlaybookStep;
    updateListings: (cityKey: string) => PlaybookStep;
    guestRegister: (cityKey: string) => PlaybookStep;
  }
): Playbook {
  return {
    id: "fr-marseille",
    country: "France",
    city: "Marseille",
    title: {
      en: "Marseille furnished tourist rental",
      fr: "Location meublée touristique : Marseille",
    },
    description: {
      en: "Mandatory declaration on taxedesejour.marseille.fr, 90-night primary cap, change-of-use with compensation for non-primary units from 29 April 2025. Host Registry tracks steps; you file with the Ville de Marseille.",
      fr: "Déclaration obligatoire sur taxedesejour.marseille.fr, plafond 90 nuitées en principale, changement d'usage avec compensation hors principale depuis le 29 avril 2025. Host Registry suit les étapes ; vous déposez auprès de la Ville de Marseille.",
    },
    sourceReviewedAt: "2026-10-08",
    steps: buildMarseillePlaybookSteps(frSteps),
  };
}
