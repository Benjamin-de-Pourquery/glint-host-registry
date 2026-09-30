import type { LocalizedText } from "@/lib/playbooks/types";
import type { Locale } from "./locale";
import { generateQuestionTemplates, type QuestionTemplate } from "./question-templates";
import { buildJourneySearchParams } from "./query-state";
import type {
  DocumentToRequest,
  PrePurchaseJourneyEvaluation,
  PrePurchaseJourneyInput,
  ZoneRuleItem,
} from "./types";

export type ReportSection = {
  id: string;
  title: LocalizedText;
  items: Array<{ title: LocalizedText; detail: LocalizedText; meta?: string }>;
};

export type PrePurchaseReport = {
  generatedAt: string;
  input: PrePurchaseJourneyInput;
  sections: ReportSection[];
  questions: QuestionTemplate[];
  datasetUpdatedAt: string | null;
  disclaimer: LocalizedText;
};

export function buildPrePurchaseReport(
  input: PrePurchaseJourneyInput,
  evaluation: PrePurchaseJourneyEvaluation
): PrePurchaseReport {
  const verified: ZoneRuleItem[] = evaluation.rules.filter(
    (r) => r.confidence !== "to_confirm"
  );
  const toConfirm: ZoneRuleItem[] = evaluation.rules.filter(
    (r) => r.confidence === "to_confirm"
  );

  const verifiedItems = verified.map((rule) => ({
    title: rule.title,
    detail: rule.summary ?? { en: "", fr: "" },
    meta: rule.sourceReviewedAt
      ? `reviewed ${rule.sourceReviewedAt}`
      : rule.confidence,
  }));

  const toConfirmItems = toConfirm.map((rule) => ({
    title: rule.title,
    detail: rule.toConfirmQuestion ?? { en: "", fr: "" },
    meta: "to_confirm",
  }));

  const documentItems = evaluation.documents.map((doc: DocumentToRequest) => ({
    title: doc.title,
    detail: doc.why,
  }));

  const questionItems = generateQuestionTemplates(input, evaluation).map((q) => ({
    title: {
      en: `Question (${q.role})`,
      fr: `Question (${q.role})`,
    },
    detail: q.body,
  }));

  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    input,
    datasetUpdatedAt: evaluation.lookup?.datasetUpdatedAt ?? null,
    questions: generateQuestionTemplates(input, evaluation),
    disclaimer: {
      en: "Operational help only. Not legal advice, notarial due diligence, or a buy/don't-buy recommendation.",
      fr: "Aide opérationnelle uniquement. Pas un conseil juridique, une due diligence notariale, ni une recommandation d'acheter ou de renoncer.",
    },
    sections: [
      {
        id: "verified",
        title: { en: "Verified pointers", fr: "Points vérifiés" },
        items: verifiedItems,
      },
      {
        id: "to_confirm",
        title: { en: "To confirm", fr: "À confirmer" },
        items: toConfirmItems,
      },
      {
        id: "documents",
        title: { en: "Missing documents to request", fr: "Documents manquants à demander" },
        items: documentItems,
      },
      {
        id: "questions",
        title: { en: "Questions to send", fr: "Questions à envoyer" },
        items: questionItems,
      },
    ],
  };
}

export function reportQuerySuffix(input: PrePurchaseJourneyInput): string {
  return buildJourneySearchParams(input).toString();
}

export function formatReportItemForLocale(
  item: { title: LocalizedText; detail: LocalizedText; meta?: string },
  locale: Locale
): string {
  const lines = [item.title[locale], item.detail[locale]];
  if (item.meta) lines.push(`(${item.meta})`);
  return lines.filter(Boolean).join("\n");
}
