import type { Metadata } from "next";
import { CartProvider } from "@/components/showcase-store/cart-context";
import { NorthwaveTopBar } from "@/components/showcase-store/topbar";
import { NorthwaveFooter } from "@/components/showcase-store/footer";
import "./_lib/northwave.css";

/**
 * Northwave Goods — demo merchant storefront layout.
 *
 * This layout intentionally does NOT import BlockPay's <Nav>, <Footer>,
 * or <PaletteScope>. The point of the showcase is to look like a third-
 * party storefront that happens to use BlockPay as its payment rail.
 *
 * The root <html>/<body> still come from app/layout.tsx (which wires
 * fonts + the Privy provider). We just wrap our subtree in a scoped
 * div that applies Northwave's warm off-white palette via CSS vars.
 */

export const metadata: Metadata = {
  title: "Northwave Goods — small-batch homeware",
  description:
    "Demo merchant storefront — quietly built things that age well. Checkout secured by BlockPay.",
};

export default function NorthwaveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="northwave-scope">
      <CartProvider>
        <NorthwaveTopBar />
        <main>{children}</main>
        <NorthwaveFooter />
      </CartProvider>
    </div>
  );
}
