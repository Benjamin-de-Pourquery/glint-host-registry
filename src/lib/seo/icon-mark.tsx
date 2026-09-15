/** Shared favicon / OG mark — slate background, emerald "G" with registry check accent. */
export function GlintIconMark({
  size,
  fontSize,
}: {
  size: number;
  fontSize: number;
}) {
  const radius = Math.round(size * 0.2);
  const checkSize = Math.round(size * 0.22);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: radius,
        position: "relative",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.35)",
      }}
    >
      <div
        style={{
          fontSize,
          fontWeight: 800,
          color: "#10b981",
          fontFamily: "system-ui, -apple-system, sans-serif",
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        G
      </div>
      <div
        style={{
          position: "absolute",
          bottom: Math.round(size * 0.14),
          right: Math.round(size * 0.14),
          width: checkSize,
          height: checkSize,
          borderRadius: "50%",
          background: "#10b981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: Math.round(checkSize * 0.35),
            height: Math.round(checkSize * 0.55),
            borderRight: `${Math.max(2, Math.round(checkSize * 0.12))}px solid #0f172a`,
            borderBottom: `${Math.max(2, Math.round(checkSize * 0.12))}px solid #0f172a`,
            transform: "rotate(45deg) translateY(-10%)",
          }}
        />
      </div>
    </div>
  );
}
