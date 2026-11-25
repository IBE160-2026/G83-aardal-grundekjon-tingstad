import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// Optimistic check only: a request to an app route without a session cookie goes straight to
// the login screen. The real check (is the session valid?) happens in the pages and actions
// through shared/auth.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/logg-inn", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/uke/:path*", "/coach/:path*", "/historikk/:path*", "/profil/:path*"],
};
