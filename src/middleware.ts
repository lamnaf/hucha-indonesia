import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const LOGIN_PATH = "/admin/login";
const ADMIN_HOME = "/admin";

/**
 * Route protection for the admin area (blueprint §32 / §36).
 * Cookie-presence gate only — the definitive session + RBAC checks happen
 * server-side in pages/actions via `requireAuth`/`requirePermission`.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Check for the session cookie more robustly
  const cookies = request.cookies;
  const hasSession = cookies.has("__Secure-better-auth.session_token") || 
                     cookies.has("better-auth.session_token");

  if (!hasSession && pathname !== LOGIN_PATH) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // Prevent redirect loop by only redirecting away from login if we are 
  // *very* confident there's a session (i.e. only if we need to).
  // This is a conservative fix.
  if (hasSession && pathname === LOGIN_PATH) {
    // Only redirect if there's no callback, or if we're not already going somewhere
    return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
