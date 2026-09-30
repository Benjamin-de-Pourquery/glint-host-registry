"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type Props = {
  text: string;
  label?: string;
};

export function CopyTextButton({ text, label }: Props) {
  const t = useTranslations("prePurchase.copy");
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={onCopy}>
      {copied ? t("copied") : label ?? t("copy")}
    </Button>
  );
}
