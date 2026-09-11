import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan || "starter";

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionPlan: plan,
            subscriptionStatus: "active",
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id,
          },
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        const status =
          subscription.status === "active" || subscription.status === "trialing"
            ? subscription.status
            : "inactive";

        const plan =
          subscription.metadata?.plan ||
          (subscription.items.data[0]?.price?.id ===
          process.env.STRIPE_PRICE_PRO
            ? "pro"
            : "starter");

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: status,
            subscriptionPlan: status === "inactive" ? "none" : plan,
            stripeSubscriptionId: subscription.id,
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
