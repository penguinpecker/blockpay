import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { AppPrivyProvider } from "@/components/privy-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BlockPay — Web3 Payment Gateway for Stablecoin Commerce",
  description:
    "Accept USDC and stablecoin payments on any chain. One-click Shopify and WordPress integration. Gasless checkout. Instant settlement.",
  metadataBase: new URL("https://blockpay.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${manrope.variable} h-full`}
    >
      <body className="min-h-full bg-black text-white antialiased">
        <AppPrivyProvider>{children}</AppPrivyProvider>
      </body>
    </html>
  );
}
