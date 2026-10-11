import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  attachSignupRefCookieIfNeeded,
  parseSignupRef,
  signupRefCreateFields,
  SIGNUP_REF_COOKIE_NAME,
} from "@/lib/auth/signup-ref";
import { NextRequest, NextResponse } from "next/server";

describe("parseSignupRef", () => {
  it("accepts lowercase alphanumeric and hyphens up to 64 chars", () => {
    assert.equal(parseSignupRef("abc"), "abc");
    assert.equal(parseSignupRef("a1-b2-c3"), "a1-b2-c3");
    assert.equal(parseSignupRef("a".repeat(64)), "a".repeat(64));
  });

  it("rejects empty, uppercase, invalid chars, and overlong values", () => {
    assert.equal(parseSignupRef(""), null);
    assert.equal(parseSignupRef(null), null);
    assert.equal(parseSignupRef("ABC"), null);
    assert.equal(parseSignupRef("foo_bar"), null);
    assert.equal(parseSignupRef("a".repeat(65)), null);
    assert.equal(parseSignupRef(" leading"), null);
  });
});

describe("signupRefCreateFields", () => {
  it("includes signupRef when the cookie value is valid", () => {
    assert.deepEqual(signupRefCreateFields("partner-1"), {
      signupRef: "partner-1",
    });
  });

  it("returns empty object when the cookie is missing or invalid", () => {
    assert.deepEqual(signupRefCreateFields(undefined), {});
    assert.deepEqual(signupRefCreateFields("INVALID"), {});
  });
});

describe("attachSignupRefCookieIfNeeded", () => {
  it("sets cookie on first valid ref touch", () => {
    const request = new NextRequest("https://example.com/en?ref=campaign-1");
    const response = attachSignupRefCookieIfNeeded(
      request,
      NextResponse.next()
    );
    const cookie = response.cookies.get(SIGNUP_REF_COOKIE_NAME);
    assert.equal(cookie?.value, "campaign-1");
    assert.equal(cookie?.sameSite, "lax");
    assert.ok((cookie?.maxAge ?? 0) >= 30 * 24 * 60 * 60 - 1);
  });

  it("does not overwrite an existing cookie (first touch wins)", () => {
    const request = new NextRequest("https://example.com/en?ref=new-ref", {
      headers: { cookie: `${SIGNUP_REF_COOKIE_NAME}=original` },
    });
    const response = attachSignupRefCookieIfNeeded(
      request,
      NextResponse.next()
    );
    assert.equal(response.cookies.get(SIGNUP_REF_COOKIE_NAME), undefined);
  });

  it("ignores invalid ref query params", () => {
    const request = new NextRequest("https://example.com/en?ref=Bad_Ref");
    const response = attachSignupRefCookieIfNeeded(
      request,
      NextResponse.next()
    );
    assert.equal(response.cookies.get(SIGNUP_REF_COOKIE_NAME), undefined);
  });
});
