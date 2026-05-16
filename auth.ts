import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { SiweMessage } from "siwe";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

/**
 * Full Auth.js config — Prisma adapter + providers. Used by API route
 * handlers (/api/auth/[...nextauth], /api/merchants, etc.) and Server
 * Components calling `auth()`.
 *
 * Providers are added conditionally based on env presence so the build
 * doesn't break when secrets aren't set yet:
 *  - Google OAuth — active when AUTH_GOOGLE_ID + AUTH_GOOGLE_SECRET are set
 *  - Resend email magic link — active when AUTH_RESEND_KEY is set
 *  - SIWE (Sign-In With Ethereum) — always on
 *  - demo-email (any email creates a user, no verification) — dev fallback
 *    when neither Google nor Resend is configured
 *
 * Middleware uses auth.config.ts (edge-safe, no Prisma) — see that file.
 */

const providers: NextAuthConfig["providers"] = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}

if (process.env.AUTH_RESEND_KEY) {
  providers.push(
    Resend({
      from: process.env.AUTH_RESEND_FROM ?? "auth@blockpay.dev",
    }),
  );
}

// SIWE — always on
providers.push(
  Credentials({
    id: "siwe",
    name: "Sign-In With Ethereum",
    credentials: {
      message: { label: "Message", type: "text" },
      signature: { label: "Signature", type: "text" },
    },
    authorize: async (creds) => {
      try {
        const message = String(creds?.message ?? "");
        const signature = String(creds?.signature ?? "");
        if (!message || !signature) return null;

        const siwe = new SiweMessage(JSON.parse(message));
        const result = await siwe.verify({ signature });
        if (!result.success) return null;

        const address = siwe.address.toLowerCase();

        let user = await prisma.user.findUnique({ where: { walletAddress: address } });
        if (!user) {
          user = await prisma.user.create({ data: { walletAddress: address } });
        }
        return {
          id: user.id,
          walletAddress: user.walletAddress,
          name: user.name,
          email: user.email,
        };
      } catch {
        return null;
      }
    },
  }),
);

// Demo-email fallback — ONLY active when neither real email auth nor
// Google is configured. Lets the testnet demo work without external creds.
if (!process.env.AUTH_RESEND_KEY && !process.env.AUTH_GOOGLE_ID) {
  providers.push(
    Credentials({
      id: "demo-email",
      name: "Demo email (testnet)",
      credentials: { email: { label: "Email", type: "email" } },
      authorize: async (creds) => {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        if (!email || !email.includes("@")) return null;

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) user = await prisma.user.create({ data: { email } });
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  );
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.walletAddress = (user as { walletAddress?: string | null }).walletAddress ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        (session.user as { id?: string }).id = String(token.uid);
        (session.user as { walletAddress?: string | null }).walletAddress =
          (token.walletAddress as string | null | undefined) ?? null;
      }
      return session;
    },
  },
});

/**
 * Helper: which auth methods are currently available based on env.
 * The login/signup pages use this to decide which buttons to show.
 */
export function availableAuthMethods() {
  return {
    google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    email: Boolean(process.env.AUTH_RESEND_KEY),
    demoEmail: !process.env.AUTH_RESEND_KEY && !process.env.AUTH_GOOGLE_ID,
    wallet: true,
  };
}
