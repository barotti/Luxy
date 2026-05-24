import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";

  const sessionToken =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token");

  const isLoggedIn = !!sessionToken;

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/properties", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
