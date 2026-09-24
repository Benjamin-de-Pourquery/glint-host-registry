import type { GuestStayNightInput, NightCapComputation } from "@/lib/france/night-cap";

export const CAP_GUARD_MODES = ["HARD_STOP", "BUFFER", "BUDGET"] as const;
export type CapGuardMode = (typeof CAP_GUARD_MODES)[number];

export const CAP_GUARD_EVENT_TYPES = [
  "enabled",
  "disabled",
  "mode_change",
  "blocks_published",
  "breach_near",
] as const;
export type CapGuardEventType = (typeof CAP_GUARD_EVENT_TYPES)[number];

export type BudgetWindow = {
  start: string;
  end: string;
  allocatedNights: number;
};

export type DateRange = {
  start: Date;
  end: Date;
};

export type CapGuardPolicyInput = {
  enabled: boolean;
  mode: CapGuardMode;
  bufferNights: number;
  budgetWindows: BudgetWindow[];
  registrationGate: boolean;
};

export type CapGuardComputeInput = {
  stays: GuestStayNightInput[];
  capComputation: NightCapComputation;
  policy: CapGuardPolicyInput;
  today: Date;
  registrationExpiry?: Date | null;
};

export type CapGuardForecast = {
  nightsUsed: number;
  bookedAhead: number;
  remaining: number;
  projectedCapDate: string | null;
};

export type CapGuardBlockResult = {
  blocks: DateRange[];
  shouldPublish: boolean;
  triggerReason: "none" | "hard_stop" | "buffer" | "budget" | "registration";
};
