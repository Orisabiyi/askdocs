import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";

const { auth: withAuth } = NextAuth(authConfig);

export default withAuth;

export const config = {
  matcher: [
    "/chat/:path*",
    "/documents/:path*",
    "/collections/:path*",
    "/onboarding/:path*",
  ],
};