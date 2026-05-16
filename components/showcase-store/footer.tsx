import Link from "next/link";

export function NorthwaveFooter() {
  return (
    <footer className="nw-footer">
      <div className="nw-shell flex flex-col gap-6 py-10 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="nw-footer-wordmark">Northwave</div>
          <p className="mt-2 max-w-md text-sm text-[var(--nw-fg-muted)]">
            Small-batch homeware shipped from a workshop on the coast. Quietly
            built things that age well.
          </p>
        </div>
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--nw-fg-subtle)]">
          <p>
            Checkout secured by{" "}
            <Link
              href="/"
              className="underline decoration-dotted underline-offset-4 hover:text-[var(--nw-fg)]"
            >
              BlockPay
            </Link>
            .
          </p>
          <p className="mt-1 normal-case tracking-normal">
            This is a demo storefront. No physical orders ship.
          </p>
        </div>
      </div>
    </footer>
  );
}
