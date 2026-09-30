import type { LocalizedText } from "@/lib/playbooks/types";
import type { PrePurchaseJourneyEvaluation, PrePurchaseJourneyInput } from "./types";
import type { Locale } from "./locale";

export type QuestionRole = "seller" | "syndic" | "agent";

export type QuestionTemplate = {
  role: QuestionRole;
  subject: LocalizedText;
  body: LocalizedText;
};

function lookupSummary(
  locale: Locale,
  evaluation: PrePurchaseJourneyEvaluation
): string {
  if (!evaluation.lookup) {
    return locale === "fr"
      ? "Aucune recherche registre n'a été lancée (numéro manquant ou région hors Catalogne)."
      : "No register lookup was run (missing number or region outside Catalonia).";
  }
  const status =
    locale === "fr"
      ? {
          found: "trouvé dans l'open data",
          not_found: "introuvable dans l'open data",
          uncertain: "résultat incertain",
        }[evaluation.lookup.status]
      : {
          found: "found in open data",
          not_found: "not found in open data",
          uncertain: "uncertain result",
        }[evaluation.lookup.status];

  const date = evaluation.lookup.datasetUpdatedAt
    ? locale === "fr"
      ? ` (jeu de données au ${evaluation.lookup.datasetUpdatedAt})`
      : ` (dataset dated ${evaluation.lookup.datasetUpdatedAt})`
    : "";

  return locale === "fr"
    ? `Numéro ${evaluation.lookup.normalizedNumber}: ${status}${date}.`
    : `Number ${evaluation.lookup.normalizedNumber}: ${status}${date}.`;
}

function toConfirmBullets(
  locale: Locale,
  evaluation: PrePurchaseJourneyEvaluation
): string {
  const items = evaluation.rules
    .filter((r) => r.confidence === "to_confirm" && r.toConfirmQuestion)
    .map((r) => `- ${r.toConfirmQuestion![locale]}`);
  if (items.length === 0) {
    return locale === "fr" ? "- (aucun point à confirmer listé)" : "- (no to-confirm items listed)";
  }
  return items.join("\n");
}

export function generateQuestionTemplates(
  input: PrePurchaseJourneyInput,
  evaluation: PrePurchaseJourneyEvaluation
): QuestionTemplate[] {
  const address = input.addressOrListing || (input.municipality ? input.municipality : "");
  const lookupLineEn = lookupSummary("en", evaluation);
  const lookupLineFr = lookupSummary("fr", evaluation);
  const bulletsEn = toConfirmBullets("en", evaluation);
  const bulletsFr = toConfirmBullets("fr", evaluation);

  const sellerBodyEn = `Hello,

We are reviewing a possible purchase of a short-term rental unit${address ? ` at ${address}` : ""} in Catalonia.
Please confirm in writing:

1) The HUT / tourism registration number on the listing and whether it matches the active inscription.
2) Register check (open data, indicative only): ${lookupLineEn}
3) Whether the registration transfers with the sale or requires a new file with the Generalitat / municipality.
4) Copies of estatutos, latest comunidad meeting minutes (actas), and any administrator letter on tourist use.
5) Municipal urban certificate for tourist use at this address.

Points we still need to confirm:
${bulletsEn}

This message is for information gathering only. We are not asking you to provide legal advice.

Thank you.`;

  const sellerBodyFr = `Bonjour,

Nous examinons un achat éventuel d'un logement LCD${address ? ` (${address})` : ""} en Catalogne.
Merci de confirmer par écrit :

1) Le numéro HUT / d'inscription touristique sur l'annonce et s'il correspond à l'inscription active.
2) Recoupement registre (open data, indicatif seulement) : ${lookupLineFr}
3) Si l'inscription suit la vente ou exige un nouveau dossier auprès de la Generalitat / municipalité.
4) Copies des estatutos, derniers actas d'assemblée, et tout courrier de l'administrador sur l'usage touristique.
5) Certificat urbanistique municipal pour l'usage touristique à cette adresse.

Points encore à confirmer :
${bulletsFr}

Ce message vise uniquement à collecter des informations. Nous ne demandons pas de conseil juridique.

Merci.`;

  const syndicBodyEn = `Hello,

We are prospective buyers of a unit${address ? ` at ${address}` : ""} in a comunidad de propietarios in Catalonia.
Please confirm:

1) Whether the community statutes or recent actas restrict or ban short-term tourist use.
2) Whether a qualified majority vote exists for tourist use of this unit (if applicable).
3) Any outstanding sanctions or proceedings related to tourist rentals in the building.
4) Whether the administrator can issue a certificate on tourist use for this flat.

Listing registration (open data, indicative): ${lookupLineEn}

Thank you.`;

  const syndicBodyFr = `Bonjour,

Nous sommes acheteurs potentiels d'un lot${address ? ` (${address})` : ""} dans une comunidad de propietarios en Catalogne.
Merci de confirmer :

1) Si les estatutos ou actas récents restreignent ou interdisent l'usage touristique de courte durée.
2) S'il existe un vote qualifié pour l'usage touristique de ce lot (le cas échéant).
3) D'éventuelles sanctions ou procédures liées aux locations touristiques dans l'immeuble.
4) Si l'administrador peut délivrer un certificat sur l'usage touristique de ce lot.

Inscription annonce (open data, indicatif) : ${lookupLineFr}

Merci.`;

  const agentBodyEn = `Hello,

We are reviewing a Catalonia short-term rental purchase${address ? ` (${address})` : ""}.
Please share:

1) The HUT number, proof of active status, and whether it matches the open data register (indicative).
2) Seller documents: estatutos, actas, administrator certificate, municipal urban certificate.
3) Known municipal or zoning constraints (PEUAT / HTA areas) affecting this unit.
4) Whether the transaction assumes transfer of the tourism registration or a new application.

Register note: ${lookupLineEn}

Thank you.`;

  const agentBodyFr = `Bonjour,

Nous examinons un achat LCD en Catalogne${address ? ` (${address})` : ""}.
Merci de transmettre :

1) Le numéro HUT, la preuve de statut actif, et la cohérence avec le registre open data (indicatif).
2) Documents vendeur : estatutos, actas, certificat administrador, certificat urbanistique municipal.
3) Contraintes municipales ou de zonage connues (PEUAT / zones HTA) sur ce lot.
4) Si la transaction suppose le transfert de l'inscription touristique ou un nouveau dossier.

Note registre : ${lookupLineFr}

Merci.`;

  return [
    {
      role: "seller",
      subject: {
        en: "Written questions: HUT, comunidad, and municipal checks (Catalonia purchase)",
        fr: "Questions écrites : HUT, copropriété et contrôles municipaux (achat Catalogne)",
      },
      body: { en: sellerBodyEn, fr: sellerBodyFr },
    },
    {
      role: "syndic",
      subject: {
        en: "Comunidad de propietarios: tourist use and minutes",
        fr: "Comunidad de propietarios : usage touristique et actas",
      },
      body: { en: syndicBodyEn, fr: syndicBodyFr },
    },
    {
      role: "agent",
      subject: {
        en: "Estate agent: documents and registration transfer (Catalonia STR)",
        fr: "Agent immobilier : pièces et transfert d'inscription (LCD Catalogne)",
      },
      body: { en: agentBodyEn, fr: agentBodyFr },
    },
  ];
}
