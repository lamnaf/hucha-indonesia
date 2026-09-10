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

  const hasSession = Boolean(getSessionCookie(request));

  if (!hasSession && pathname !== LOGIN_PATH) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && pathname === LOGIN_PATH) {
    return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
