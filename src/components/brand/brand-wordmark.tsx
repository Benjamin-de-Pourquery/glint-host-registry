import { cn } from "@/lib/utils";

type Props = {
  product: string;
  byGlint: string;
  /** Light surfaces (marketing header, auth). */
  variant?: "light" | "dark";
  className?: string;
  productClassName?: string;
  byGlintClassName?: string;
};

/**
 * Suite wordmark: product name + localized « Par Glint » / « By Glint » (Label Registry pattern).
 */
export function BrandWordmark({
  product,
  byGlint,
  variant = "light",
  className,
  productClassName,
  byGlintClassName,
}: Props) {
  const productColor = variant === "light" ? "text-slate-900" : "text-white";
  const byGlintColor = variant === "light" ? "text-emerald-700" : "text-emerald-400";

  return (
    <div className={cn("min-w-0 leading-tight", className)}>
      <span
        className={cn(
          "block truncate text-sm font-bold tracking-tight sm:text-base",
          productColor,
          productClassName,
        )}
      >
        {product}
      </span>
      <span
        className={cn(
          "block truncate text-[10px] font-semibold uppercase tracking-wider sm:text-xs",
          byGlintColor,
          byGlintClassName,
        )}
      >
        {byGlint}
      </span>
    </div>
  );
}
