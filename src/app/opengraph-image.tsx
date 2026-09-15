import { ImageResponse } from "next/og";
import { GlintIconMark } from "@/lib/seo/icon-mark";
import { SITE_NAME } from "@/lib/seo/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #0f172a 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <GlintIconMark size={96} fontSize={52} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.03em" }}>
              {SITE_NAME}
            </div>
            <div style={{ fontSize: 26, color: "#94a3b8", maxWidth: 720, lineHeight: 1.35 }}>
              EU short-term rental compliance — France, Spain &amp; beyond
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 48,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {["Regulation 2024/1028", "SES Hospedajes", "Guest register", "FR + EN"].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  color: "#6ee7b7",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
