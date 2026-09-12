const SIGNATURE_DATA_URL_PATTERN =
  /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/]+=*$/;

/** Max decoded payload size (~500 KB) for guest signature images. */
const MAX_SIGNATURE_BYTES = 512_000;

export function isValidSignatureDataUrl(value: string): boolean {
  if (!SIGNATURE_DATA_URL_PATTERN.test(value)) {
    return false;
  }

  const base64 = value.split(",")[1] ?? "";
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  const byteLength = Math.floor((base64.length * 3) / 4) - padding;
  return byteLength > 0 && byteLength <= MAX_SIGNATURE_BYTES;
}

/** Escape a validated data URL for safe use in HTML attributes. */
export function escapeSignatureDataUrlForHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
