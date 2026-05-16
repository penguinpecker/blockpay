import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge-runtime middleware. Cheap presence check on the Privy session
 * cookie — we do *not* verify the JWT signature here because the
 * @privy-io/server-auth SDK is too large for the 1 MB Edge bundle
 * limit. Any route or server component the request then hits will
 * call `getSession()` (lib/server-session.ts) which does verify the
 * signature in Node before doing anything privileged.
 *
 * Gating logic: /dashboard/* requires the cookie. Missing → redirect
 * to /login?from=<path>.
 */
export default function middleware(req: NextRequest) {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (!isDashboard) return NextResponse.next();

  const token = req.cookies.get("privy-token")?.value;
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
