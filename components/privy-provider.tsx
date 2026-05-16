"use client";

import { PrivyProvider } from "@privy-io/react-auth";

/**
 * App-wide Privy provider. Wraps the entire tree from app/layout.tsx
 * so any client component can call useLogin / usePrivy.
 *
 * Login methods enabled:
 *  - email: magic link / one-time code
 *  - google: Google OAuth
 *  - wallet: every wallet type Privy supports (injected, WalletConnect, etc.)
 *
 * `embeddedWallets.createOnLogin = "users-without-wallets"` ensures
 * users who sign in with email/Google still end up with a wallet they
 * can later use for on-chain settlement — without forcing wallet-first
 * users to create a second one.
 */
export function AppPrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId) {
    // Surface a clear error in dev. In prod the env var is always set.
    if (typeof window !== "undefined") {
      console.warn("[privy] NEXT_PUBLIC_PRIVY_APP_ID missing");
    }
    return <>{children}</>;
  }
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "google", "wallet"],
        appearance: {
          theme: "dark",
          accentColor: "#e0b56a",
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          // Privy v3 split the createOnLogin flag per chain. We only
          // need EVM today — keep Solana off until we ship that path.
          ethereum: { createOnLogin: "users-without-wallets" },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
