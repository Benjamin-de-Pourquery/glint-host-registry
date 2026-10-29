import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { stripeBillingToastKey } from "../billing-toast";

describe("stripeBillingToastKey", () => {
  it("always maps to localized settings keys", () => {
    assert.equal(stripeBillingToastKey("stripe_unavailable", "checkout"), "billing.checkoutError");
    assert.equal(stripeBillingToastKey(undefined, "portal"), "billing.portalError");
  });
});
