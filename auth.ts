import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { SiweMessage } from "siwe";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

/**
 * Full Auth.js config — Prisma adapter + SIWE + demo-email providers.
 * Used by API route handlers (/api/auth/[...nextauth], /api/merchants, etc.)
 * and by Server Components calling `auth()` for session reads.
 *
 * Middleware does NOT import this file — it uses auth.config.ts to stay
 * under the Edge 1 MB size budget. Keeping Prisma + siwe + ethers out of
 * the Edge bundle is the whole reason for the split.
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
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
    Credentials({
      id: "demo-email",
      name: "Demo email",
      credentials: { email: { label: "Email", type: "email" } },
      authorize: async (creds) => {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        if (!email || !email.includes("@")) return null;

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) user = await prisma.user.create({ data: { email } });
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
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
