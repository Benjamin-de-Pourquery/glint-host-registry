"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  copiedLabel: string;
  className?: string;
};

export function CopyFieldChip({ label, value, copiedLabel, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(copiedLabel);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs transition-colors hover:border-emerald-300 hover:bg-emerald-50",
        className
      )}
      title={value}
    >
      <span className="font-medium text-slate-600">{label}:</span>
      <span className="truncate text-slate-900">{value}</span>
      {copied ? (
        <Check className="h-3 w-3 shrink-0 text-emerald-600" />
      ) : (
        <Copy className="h-3 w-3 shrink-0 text-slate-400" />
      )}
    </button>
  );
}
