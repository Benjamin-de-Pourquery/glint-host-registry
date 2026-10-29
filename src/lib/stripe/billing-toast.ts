export function stripeBillingToastKey(
  _code: unknown,
  kind: "checkout" | "portal"
): "billing.checkoutError" | "billing.portalError" {
  return kind === "checkout" ? "billing.checkoutError" : "billing.portalError";
}
