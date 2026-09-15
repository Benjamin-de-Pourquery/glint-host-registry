import { ImageResponse } from "next/og";
import { GlintIconMark } from "@/lib/seo/icon-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<GlintIconMark size={180} fontSize={96} />, {
    ...size,
  });
}
