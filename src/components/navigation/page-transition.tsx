"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function PageTransition({ children, className }: Props) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={cn("page-transition", className)}>
      {children}
    </div>
  );
}
