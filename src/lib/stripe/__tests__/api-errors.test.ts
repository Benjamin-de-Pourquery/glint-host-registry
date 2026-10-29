import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import {
  formatUnknownStripeLogPayload,
  isStripeApiError,
  normalizeStripeLocale,
  stripeApiErrorResponse,
} from "../api-errors";

describe("normalizeStripeLocale", () => {
  it("defaults to en", () => {
    assert.equal(normalizeStripeLocale(undefined), "en");
    assert.equal(normalizeStripeLocale("de"), "en");
  });

  it("accepts fr", () => {
    assert.equal(normalizeStripeLocale("fr"), "fr");
  });
});

describe("stripeApiErrorResponse", () => {
  it("returns localized 502 body for generic errors", () => {
    const { status, body } = stripeApiErrorResponse(new Error("boom"), "en");
    assert.equal(status, 502);
    assert.equal(body.code, "stripe_unavailable");
    assert.match(body.error, /Billing is temporarily unavailable/);
  });

  it("returns French copy when locale is fr", () => {
    const { body } = stripeApiErrorResponse(new Error("boom"), "fr");
    assert.match(body.error, /facturation est temporairement indisponible/i);
  });

  it("maps authentication failures to 503", () => {
    const error = new Stripe.errors.StripeAuthenticationError({
      message: "Invalid API Key provided",
      type: "authentication_error",
    });
    assert.equal(isStripeApiError(error), true);
    const { status } = stripeApiErrorResponse(error, "en");
    assert.equal(status, 503);
  });

  it("does not log full unknown error objects", () => {
    const payload = formatUnknownStripeLogPayload({ secret: "sk_test_xxx", nested: { token: "x" } });
    assert.deepEqual(payload, { kind: "unknown" });
    const errPayload = formatUnknownStripeLogPayload(new Error("boom"));
    assert.ok("message" in errPayload);
    assert.equal(errPayload.name, "Error");
    assert.equal(errPayload.message, "boom");
  });
});
