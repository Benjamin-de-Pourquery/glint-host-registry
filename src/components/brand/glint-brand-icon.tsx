import { cn } from "@/lib/utils";
import {
  BRAND_EMERALD,
  BRAND_SLATE_DARK,
  BRAND_SLATE_MID,
} from "@/lib/seo/brand-colors";

const VIEW_SIZE = 36;

type Props = {
  /** Optional explicit pixel size; omit when sizing via className (e.g. h-9 w-9). */
  size?: number;
  className?: string;
};

/**
 * Inline SVG brand mark — slate navy tile, emerald G, compliance check badge.
 * Mirrors {@link GlintIconMark} used for favicon / OG images.
 */
export function GlintBrandIcon({ size, className }: Props) {
  const id = `glint-brand`;
  const radius = Math.round(VIEW_SIZE * 0.2);
  const checkSize = Math.round(VIEW_SIZE * 0.22);
  const checkX = VIEW_SIZE - checkSize * 0.72;
  const checkY = VIEW_SIZE - checkSize * 0.72;
  const fontSize = Math.round(VIEW_SIZE * 0.52);
  const checkStroke = Math.max(1.5, checkSize * 0.14);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      role="img"
      aria-hidden="true"
      className={cn("shrink-0", !size && "h-9 w-9", className)}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_SLATE_DARK} />
          <stop offset="100%" stopColor={BRAND_SLATE_MID} />
        </linearGradient>
      </defs>
      <rect width={VIEW_SIZE} height={VIEW_SIZE} rx={radius} fill={`url(#${id}-bg)`} />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={BRAND_EMERALD}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={fontSize}
        fontWeight={800}
        letterSpacing="-0.04em"
      >
        G
      </text>
      <circle cx={checkX} cy={checkY} r={checkSize / 2} fill={BRAND_EMERALD} />
      <path
        d={`M ${checkX - checkSize * 0.16} ${checkY + checkSize * 0.02} L ${checkX - checkSize * 0.02} ${checkY + checkSize * 0.16} L ${checkX + checkSize * 0.2} ${checkY - checkSize * 0.12}`}
        fill="none"
        stroke={BRAND_SLATE_DARK}
        strokeWidth={checkStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
