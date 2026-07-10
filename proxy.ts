import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie, getCookieCache } from "better-auth/cookies";

const publicRoutes = new Set(["/", "/login", "/signup"]);
const authOnlyRoutes = new Set(["/login", "/signup"]);
// Dashboard performs an authoritative DB-backed onboarding check in its layout.
// Exempting it also provides a safe landing path if the signed cookie cache is
// briefly stale immediately after onboarding completes.
const onboardingExemptRoutes = new Set(["/onboarding", "/dashboard"]);

function isPublicRoute(pathname: string) {
  return (
    publicRoutes.has(pathname) ||
    pathname === "/compare" ||
    pathname.startsWith("/u/") ||
    pathname.startsWith("/users/") ||
    pathname.startsWith("/groups/join/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && authOnlyRoutes.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (sessionCookie && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
