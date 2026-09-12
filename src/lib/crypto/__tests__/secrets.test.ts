import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "crypto";
import { encryptSecret, decryptSecret } from "../secrets";

describe("secrets encryption", () => {
  const original = process.env.SECRETS_ENCRYPTION_KEY;

  before(() => {
    process.env.SECRETS_ENCRYPTION_KEY = randomBytes(32).toString("base64");
  });

  after(() => {
    process.env.SECRETS_ENCRYPTION_KEY = original;
  });

  it("round-trips plaintext", () => {
    const encrypted = encryptSecret("my-secret-password");
    const decrypted = decryptSecret(encrypted);
    assert.equal(decrypted, "my-secret-password");
    assert.notEqual(encrypted, "my-secret-password");
  });
});
