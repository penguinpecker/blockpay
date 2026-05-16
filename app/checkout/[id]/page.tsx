import { CheckoutCard } from "@/components/checkout/checkout-card";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="palette-stealth relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-6 py-12">
      <div
        className="absolute inset-0 bg-grid bg-grid-fade"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_10%,transparent),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <CheckoutCard
          merchantName="Acme Storefront"
          invoiceId={id}
          payHref={`/checkout/${id}/success`}
        />
      </div>
    </main>
  );
}
