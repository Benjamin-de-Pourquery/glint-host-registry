import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { resolveGuideSlugRedirect } from "@/lib/seo/metadata";

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ["/app", "/export"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const guideMatch = pathname.match(/^\/(en|fr)\/guides\/([^/]+)\/?$/);
  if (guideMatch) {
    const locale = guideMatch[1] as "en" | "fr";
    const slug = guideMatch[2];
    const redirectPath = resolveGuideSlugRedirect(locale, slug);
    if (redirectPath) {
      const url = request.nextUrl.clone();
      url.pathname = redirectPath;
      return NextResponse.redirect(url, 308);
    }
  }

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
