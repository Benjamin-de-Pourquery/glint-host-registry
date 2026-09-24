import { cn } from "@/lib/utils";

type Props = {
  product: string;
  byGlint: string;
  /** Light surfaces (marketing header) or auth shell (Label Registry density). */
  variant?: "light" | "dark" | "auth";
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
  const productColor =
    variant === "dark" ? "text-white" : "text-slate-900";
  const byGlintColor =
    variant === "dark" ? "text-emerald-400" : "text-emerald-600";

  return (
    <div
      className={cn(
        "min-w-0",
        variant === "auth" ? "leading-none" : "leading-tight",
        className,
      )}
    >
      <span
        className={cn(
          "block truncate tracking-tight",
          variant === "auth"
            ? "text-[15px] font-semibold"
            : "text-sm font-bold sm:text-base",
          productColor,
          productClassName,
        )}
      >
        {product}
      </span>
      <span
        className={cn(
          "block truncate uppercase",
          variant === "auth"
            ? "mt-0.5 text-[11px] font-medium tracking-[0.14em]"
            : "text-[10px] font-semibold tracking-wider sm:text-xs",
          byGlintColor,
          byGlintClassName,
        )}
      >
        {byGlint}
      </span>
    </div>
  );
}
