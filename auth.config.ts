import type { NextAuthConfig } from "next-auth";

/**
 * Auth.js *edge-safe* config. Used by middleware.ts.
 *
 * Critical: NO Prisma, NO siwe, NO ethers — those balloon the middleware
 * over Vercel's 1 MB Edge limit. The full config (with the Prisma adapter
 * and the credential providers) lives in auth.ts and is used by the route
 * handlers only.
 *
 * Middleware can still tell who is signed in because session.strategy is
 * "jwt" — it just decodes the JWT cookie using AUTH_SECRET.
 */
export default {
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  providers: [],
} satisfies NextAuthConfig;
