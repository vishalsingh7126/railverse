import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "admin_access";
// Temporarily hardcode for testing
const MAINTENANCE_MODE = true;

const PUBLIC_FILE = /\.[^/]+$/;

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname, searchParams } = nextUrl;

  const response = NextResponse.next();
  response.headers.set('X-Middleware-Called', 'true');

  if (searchParams.get("admin") === "true") {
    response.cookies.set({
      name: ADMIN_COOKIE,
      value: "true",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  }

  if (!MAINTENANCE_MODE) {
    return response;
  }

  const isMaintenanceRoute = pathname === "/maintenance";
  const isApiRoute = pathname.startsWith("/api");
  const isNextAssetRoute = pathname.startsWith("/_next");
  const isStaticFile = PUBLIC_FILE.test(pathname);
  const hasAdminAccess = request.cookies.has(ADMIN_COOKIE);

  if (isApiRoute || isNextAssetRoute || isStaticFile || isMaintenanceRoute || hasAdminAccess) {
    return response;
  }

  return NextResponse.redirect(new URL("/maintenance", request.url));
}

export const config = {
  matcher: ['/:path*'],
};