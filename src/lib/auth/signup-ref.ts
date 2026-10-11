import type { NextRequest, NextResponse } from "next/server";

export const SIGNUP_REF_COOKIE_NAME = "signup_ref";
export const SIGNUP_REF_MAX_LENGTH = 64;
export const SIGNUP_REF_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const SIGNUP_REF_PATTERN = /^[a-z0-9-]+$/;

/** Validates `?ref=` values: lowercase alphanumeric and hyphens, max 64 chars. */
export function parseSignupRef(value: string | null | undefined): string | null {
  if (value == null || value === "") {
    return null;
  }
  if (value.length > SIGNUP_REF_MAX_LENGTH) {
    return null;
  }
  if (!SIGNUP_REF_PATTERN.test(value)) {
    return null;
  }
  return value;
}

export function signupRefCookieOptions(): {
  maxAge: number;
  sameSite: "lax";
  path: string;
  secure: boolean;
  httpOnly: boolean;
} {
  return {
    maxAge: SIGNUP_REF_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  };
}

/** Fields to spread into `prisma.user.create` from the attribution cookie. */
export function signupRefCreateFields(
  cookieValue: string | undefined
): { signupRef: string } | Record<string, never> {
  const signupRef = parseSignupRef(cookieValue);
  return signupRef ? { signupRef } : {};
}

export function attachSignupRefCookieIfNeeded(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  if (request.cookies.has(SIGNUP_REF_COOKIE_NAME)) {
    return response;
  }

  const signupRef = parseSignupRef(request.nextUrl.searchParams.get("ref"));
  if (!signupRef) {
    return response;
  }

  response.cookies.set(
    SIGNUP_REF_COOKIE_NAME,
    signupRef,
    signupRefCookieOptions()
  );
  return response;
}
