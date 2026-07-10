import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie, getCookieCache } from "better-auth/cookies";

const publicRoutes = new Set(["/", "/login", "/signup"]);
const authOnlyRoutes = new Set(["/login", "/signup"]);
const onboardingExemptRoutes = new Set(["/onboarding"]);

function isPublicRoute(pathname: string) {
  return publicRoutes.has(pathname) || pathname.startsWith("/users/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && authOnlyRoutes.has(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    sessionCookie &&
    !isPublicRoute(pathname) &&
    !onboardingExemptRoutes.has(pathname)
  ) {
    const cache = await getCookieCache(request);
    if (cache && !cache.user.onboardingCompletedAt) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
