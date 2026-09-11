"use client";

import { PageTransition } from "@/components/navigation/page-transition";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function MarketingContent({ children, className }: Props) {
  return <PageTransition className={className}>{children}</PageTransition>;
}
