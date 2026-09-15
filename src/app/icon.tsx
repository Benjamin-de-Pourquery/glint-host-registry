import { ImageResponse } from "next/og";
import { GlintIconMark } from "@/lib/seo/icon-mark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<GlintIconMark size={32} fontSize={18} />, {
    ...size,
  });
}
