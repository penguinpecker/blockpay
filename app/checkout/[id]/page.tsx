import { CheckoutCard } from "@/components/checkout/checkout-card";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-12">
      <div
        className="absolute inset-0 bg-grid bg-grid-fade"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.10),transparent_70%)]"
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
