import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  EMAIL_RATE_LIMIT_MAX,
  IP_RATE_LIMIT_MAX,
  isPasswordResetRateLimited,
  type RateLimitSnapshot,
} from "../rate-limit";

describe("password reset rate limiting", () => {
  it("allows requests under email and IP limits", () => {
    const snapshot: RateLimitSnapshot = {
      emailAttempts: EMAIL_RATE_LIMIT_MAX - 1,
      ipAttempts: IP_RATE_LIMIT_MAX - 1,
    };
    assert.equal(isPasswordResetRateLimited(snapshot), false);
  });

  it("blocks when email limit reached", () => {
    const snapshot: RateLimitSnapshot = {
      emailAttempts: EMAIL_RATE_LIMIT_MAX,
      ipAttempts: 0,
    };
    assert.equal(isPasswordResetRateLimited(snapshot), true);
  });

  it("blocks when IP limit reached", () => {
    const snapshot: RateLimitSnapshot = {
      emailAttempts: 0,
      ipAttempts: IP_RATE_LIMIT_MAX,
    };
    assert.equal(isPasswordResetRateLimited(snapshot), true);
  });
});
