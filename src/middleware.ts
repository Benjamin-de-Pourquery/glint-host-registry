import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ["/app", "/export"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) =>
    pathname.match(new RegExp(`^/(en|fr)${path}`))
  );

  if (isProtected) {
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      const locale = pathname.startsWith("/fr") ? "fr" : "en";
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = intlMiddleware(request);
  const locale = pathname.startsWith("/fr") ? "fr" : "en";
  response.headers.set("x-locale", locale);
  return response;
}

export const config = {
  // Exclude Next metadata image routes (no file extension) so they are not
  // locale-prefixed by next-intl (/icon → /en/icon 404).
  matcher: [
    "/((?!api|_next|_vercel|icon|apple-icon|opengraph-image|twitter-image|.*\\..*).*)",
  ],
};
