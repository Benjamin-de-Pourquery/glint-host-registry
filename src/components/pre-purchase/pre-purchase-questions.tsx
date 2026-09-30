"use client";

import { useTranslations, useLocale } from "next-intl";
import type { QuestionTemplate } from "@/lib/pre-purchase/question-templates";
import { pickLocale } from "@/lib/pre-purchase/locale";
import { CopyTextButton } from "@/components/pre-purchase/copy-text-button";

type Props = {
  templates: QuestionTemplate[];
};

const roleLabelKey: Record<QuestionTemplate["role"], string> = {
  seller: "roleSeller",
  syndic: "roleSyndic",
  agent: "roleAgent",
};

export function PrePurchaseQuestions({ templates }: Props) {
  const t = useTranslations("prePurchase.questions");
  const locale = pickLocale(useLocale());

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-slate-900">{t("title")}</h2>
      <p className="mt-2 text-sm text-slate-600">{t("hint")}</p>
      <ul className="mt-4 space-y-6">
        {templates.map((template) => {
          const fullText = `Subject: ${template.subject[locale]}\n\n${template.body[locale]}`;
          return (
            <li
              key={template.role}
              className="rounded-xl border border-slate-200 bg-white p-5 text-sm"
            >
              <p className="font-semibold text-slate-900">
                {t(roleLabelKey[template.role])}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-slate-700">{template.body[locale]}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <CopyTextButton text={fullText} />
                <CopyTextButton text={template.body[locale]} label={t("copyBodyOnly")} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
