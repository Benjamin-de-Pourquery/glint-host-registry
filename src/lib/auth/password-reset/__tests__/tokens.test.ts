import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generatePasswordResetToken,
  getPasswordResetExpiry,
  hashPasswordResetToken,
  isPasswordResetTokenExpired,
  isPasswordResetTokenUsed,
  PASSWORD_RESET_TTL_MS,
} from "../tokens";

describe("password reset tokens", () => {
  it("generates base64url tokens with sufficient entropy", () => {
    const a = generatePasswordResetToken();
    const b = generatePasswordResetToken();
    assert.notEqual(a, b);
    assert.match(a, /^[\w-]+$/);
    assert.ok(a.length >= 40);
  });

  it("hashes tokens deterministically with SHA-256 hex", () => {
    const token = "sample-token-value";
    const hash = hashPasswordResetToken(token);
    assert.equal(hash, hashPasswordResetToken(token));
    assert.match(hash, /^[a-f0-9]{64}$/);
    assert.notEqual(hash, token);
  });

  it("expires after one hour", () => {
    const now = Date.parse("2026-01-01T12:00:00.000Z");
    const expiresAt = getPasswordResetExpiry(now);
    assert.equal(expiresAt.getTime() - now, PASSWORD_RESET_TTL_MS);
    assert.equal(isPasswordResetTokenExpired(expiresAt, now + PASSWORD_RESET_TTL_MS), true);
    assert.equal(
      isPasswordResetTokenExpired(expiresAt, now + PASSWORD_RESET_TTL_MS - 1),
      false
    );
  });

  it("tracks single use via usedAt", () => {
    assert.equal(isPasswordResetTokenUsed(null), false);
    assert.equal(isPasswordResetTokenUsed(new Date()), true);
  });
});
