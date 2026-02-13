import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth((req: NextRequest & { auth: any }) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/chat", "/documents", "/collections"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const authRoutes = ["/login", "/signup"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/chat", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};