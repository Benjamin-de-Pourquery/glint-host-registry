import {
  BRAND_EMERALD,
  BRAND_SLATE_DARK,
  BRAND_SLATE_GRADIENT,
} from "./brand-colors";

/** Shared favicon / OG mark — slate background, emerald "G" with registry check accent. */
export function GlintIconMark({
  size,
  fontSize,
}: {
  size: number;
  fontSize: number;
}) {
  const radius = Math.round(size * 0.2);
  const checkSize = Math.max(4, Math.round(size * 0.24));
  const checkInset = Math.round(size * 0.12);
  const isSmall = size <= 48;
  const checkBorder = Math.max(isSmall ? 2 : 1.5, Math.round(checkSize * 0.13));

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND_SLATE_GRADIENT,
        borderRadius: radius,
        position: "relative",
        boxShadow: isSmall
          ? `0 0 0 1px rgba(255, 255, 255, 0.06), 0 1px 3px rgba(15, 23, 42, 0.4)`
          : "0 2px 8px rgba(15, 23, 42, 0.35)",
      }}
    >
      <div
        style={{
          fontSize,
          fontWeight: 800,
          color: BRAND_EMERALD,
          fontFamily: "system-ui, -apple-system, sans-serif",
          lineHeight: 1,
          letterSpacing: "-0.04em",
          marginTop: isSmall ? -1 : 0,
          textRendering: "optimizeLegibility",
        }}
      >
        G
      </div>
      <div
        style={{
          position: "absolute",
          bottom: checkInset,
          right: checkInset,
          width: checkSize,
          height: checkSize,
          borderRadius: "50%",
          background: BRAND_EMERALD,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...(isSmall ? { boxShadow: `0 0 0 1px ${BRAND_SLATE_DARK}` } : {}),
        }}
      >
        <div
          style={{
            width: Math.round(checkSize * 0.32),
            height: Math.round(checkSize * 0.52),
            borderRight: `${checkBorder}px solid ${BRAND_SLATE_DARK}`,
            borderBottom: `${checkBorder}px solid ${BRAND_SLATE_DARK}`,
            transform: "rotate(45deg) translateY(-12%)",
            marginTop: -1,
          }}
        />
      </div>
    </div>
  );
}
