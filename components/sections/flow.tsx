import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  FlowFromBusiness,
  FlowPayment,
  FlowContract,
  FlowWallet,
  FlowToBusiness,
} from "../illustrations";

export function FlowSection() {
  return (
    <section className="px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="card-frame grid items-center gap-12 px-10 py-14 lg:grid-cols-2 lg:px-16 lg:py-20">
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-fg md:text-5xl">
              Business to Wallet
              <br />
              with BlockPay
            </h2>
            <p className="mt-6 max-w-md text-fg-muted">
              Experience the fluidity of transactions with BlockPay as we guide
              you through the effortless flow from business initiation to
              wallet settlement. Discover the power of decentralized payments,
              smart contract execution, and instant settlement, all seamlessly
              integrated with just a click. Elevate your business transactions –
              Swift. Secure. Simplified.
            </p>
            <div className="mt-8">
              <Link href="/signup" className="btn-pill text-sm">
                Get Started Now
                <ChevronRight size={16} strokeWidth={2.4} />
              </Link>
            </div>
          </div>

          <div className="relative flex flex-col items-end gap-6">
            <FlowZigzag />
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowZigzag() {
  return (
    <div className="relative w-full max-w-md">
      <div className="flex flex-col gap-5">
        <div className="flex justify-start">
          <FlowFromBusiness />
        </div>
        <div className="flex justify-end">
          <FlowPayment />
        </div>
        <div className="flex justify-start">
          <FlowContract />
        </div>
        <div className="flex justify-end">
          <FlowWallet />
        </div>
        <div className="flex justify-start">
          <FlowToBusiness />
        </div>
      </div>

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="dash"
            patternUnits="userSpaceOnUse"
            width="8"
            height="8"
          >
            <path d="M0 4 H 4" stroke="rgba(74,222,128,0.6)" strokeWidth="1.6" />
          </pattern>
        </defs>
      </svg>
    </div>
  );
}
