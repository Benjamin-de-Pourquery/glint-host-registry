import Stripe from "stripe";

export type StripeApiErrorCode = "stripe_unavailable";

export type StripeApiErrorBody = {
  error: string;
  code: StripeApiErrorCode;
};

const MESSAGES: Record<"en" | "fr", string> = {
  en: "Billing is temporarily unavailable. Try again in a few minutes or contact support if this continues.",
  fr: "La facturation est temporairement indisponible. Réessayez dans quelques minutes ou contactez le support si le problème persiste.",
};

export function normalizeStripeLocale(locale: unknown): "en" | "fr" {
  return locale === "fr" ? "fr" : "en";
}

export function isStripeApiError(error: unknown): error is Stripe.errors.StripeError {
  return (
    typeof Stripe.errors?.StripeError !== "undefined" &&
    error instanceof Stripe.errors.StripeError
  );
}

export function formatUnknownStripeLogPayload(
  error: unknown
): { name: string; message: string } | { kind: "unknown" } {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  return { kind: "unknown" };
}

export function stripeApiErrorResponse(
  error: unknown,
  locale: unknown
): { status: number; body: StripeApiErrorBody } {
  const uiLocale = normalizeStripeLocale(locale);
  const message = MESSAGES[uiLocale];

  if (isStripeApiError(error)) {
    console.error("[stripe]", {
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
    });
  } else {
    console.error("[stripe]", formatUnknownStripeLogPayload(error));
  }

  const status =
    isStripeApiError(error) &&
    (error.statusCode === 401 || error.statusCode === 403 || error.type === "StripeAuthenticationError")
      ? 503
      : 502;

  return {
    status,
    body: {
      code: "stripe_unavailable",
      error: message,
    },
  };
}
