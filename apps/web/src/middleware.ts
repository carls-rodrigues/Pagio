import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/", "/invoices", "/vendors", "/settings"];
const PUBLIC_PATHS = ["/sign-in", "/sign-up"];

function isProtectedRoute(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return false;
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Full token verification happens in Server Components / API routes via Admin SDK.
  // Middleware only checks for the presence of the Firebase session cookie.
  const sessionCookie = request.cookies.get("session");

  if (!sessionCookie && isProtectedRoute(pathname)) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
