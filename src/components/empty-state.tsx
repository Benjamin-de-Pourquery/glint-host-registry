import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
  variant?: "default" | "success";
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  variant = "default",
  className,
}: Props) {
  const isSuccess = variant === "success";

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border px-6 py-10 text-center sm:px-10 sm:py-12",
        isSuccess
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white"
          : "border-slate-200/80 bg-white",
        className
      )}
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl",
          isSuccess ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
        )}
      >
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <h3
        className={cn(
          "mt-5 text-lg font-semibold tracking-tight",
          isSuccess ? "text-emerald-900" : "text-slate-900"
        )}
      >
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">{description}</p>
      {children && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </div>
  );
}
