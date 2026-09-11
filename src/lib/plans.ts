export const PLANS = {
  none: { name: "None", limit: 0, price: 0 },
  starter: { name: "Starter", limit: 3, price: 19 },
  pro: { name: "Pro", limit: 50, price: 49 },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPropertyLimit(plan: string): number {
  if (plan in PLANS) {
    return PLANS[plan as PlanKey].limit;
  }
  return 0;
}

export function hasActiveSubscription(status: string): boolean {
  return status === "active" || status === "trialing";
}
