import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { stripeApiErrorResponse } from "@/lib/stripe/api-errors";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured", code: "stripe_unavailable" },
      { status: 503 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 400 }
    );
  }

  const { locale } = await request.json().catch(() => ({}));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4311";

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/${locale || "en"}/app/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    const { status, body } = stripeApiErrorResponse(error, locale);
    return NextResponse.json(body, { status });
  }
}
