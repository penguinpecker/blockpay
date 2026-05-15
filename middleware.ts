import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

/**
 * Edge-runtime middleware. Uses the lite Auth.js config (no Prisma, no
 * siwe) so we stay under the 1 MB Edge size limit.
 *
 * Gates /dashboard/*: unauthenticated requests get redirected to /login
 * with the original path preserved.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (!isDashboard) return NextResponse.next();

  if (!req.auth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
