import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SIGNUP_REF_COOKIE_NAME, parseSignupRef } from "@/lib/auth/signup-ref";

/** Persists first-touch attribution on new users (e.g. Google OAuth via adapter). */
export async function persistSignupRefFromCookies(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const signupRef = parseSignupRef(
    cookieStore.get(SIGNUP_REF_COOKIE_NAME)?.value
  );
  if (!signupRef) {
    return;
  }

  await prisma.user.updateMany({
    where: { id: userId, signupRef: null },
    data: { signupRef },
  });
}
