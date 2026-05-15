import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  IlloMiner,
  IlloCloud,
  IlloReceipt,
  IlloLaptop,
  IlloChart,
} from "../illustrations";

type Feature = {
  num: string;
  title: string;
  body: string;
  Illo: React.ComponentType<{ className?: string }>;
};

const features: Feature[] = [
  {
    num: "01",
    title: "Experience true decentralization in every transaction.",
    body: "BlockPay leverages the power of decentralized networks, ensuring that each transaction is processed across a secure and distributed system of nodes. This not only enhances the security of transactions but also eliminates the vulnerabilities associated with centralized systems.",
    Illo: IlloMiner,
  },
  {
    num: "02",
    title: "Seamless integration with just one click — no complex setup.",
    body: "Gone are the days of intricate setup processes. With BlockPay, integration is simplified to a single click. Our user-friendly interface ensures that businesses can seamlessly integrate our payment gateway without the need for technical complexities.",
    Illo: IlloCloud,
  },
  {
    num: "03",
    title: "Get instant settlement of funds, enhancing liquidity.",
    body: "BlockPay ensures that your funds are settled instantly, providing businesses with improved liquidity. Say goodbye to delayed settlements and welcome the advantage of accessing your funds in real-time.",
    Illo: IlloReceipt,
  },
  {
    num: "04",
    title: "Keep all your transactions in one secure and accessible place.",
    body: "BlockPay offers a centralized hub for all your transactions, providing a secure and easily accessible repository. Say farewell to scattered records and hello to a well-organized platform that simplifies transaction management.",
    Illo: IlloLaptop,
  },
  {
    num: "05",
    title: "Tailor invoices to match your unique business needs.",
    body: "BlockPay enables businesses to create customized invoices that align with their unique requirements. From branding to specific details, our platform allows you to tailor invoices, presenting a professional and personalized touch.",
    Illo: IlloChart,
  },
];

export function FeaturesSection() {
  return (
    <section className="px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Key Features of <span className="text-accent">BlockPay</span>
          </h2>
          <p className="mt-5 text-zinc-400">
            BlockPay offers a range of powerful features designed to transform
            your payment experience in the Web3 era.
          </p>
        </div>

        <div className="relative mt-20">
          <div className="absolute left-[2.25rem] top-2 bottom-2 w-[2px] bg-[linear-gradient(to_bottom,rgba(74,222,128,0.7)_50%,transparent_50%)] bg-[length:2px_8px] bg-repeat-y md:left-[3rem]" />

          <div className="space-y-24">
            {features.map((f) => (
              <FeatureRow key={f.num} feature={f} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ feature }: { feature: Feature }) {
  const Illo = feature.Illo;
  return (
    <div className="relative grid items-center gap-10 pl-20 md:grid-cols-[1.1fr_1fr] md:pl-24">
      <span
        className="absolute left-[1.5rem] top-1 h-5 w-5 rounded-full border-2 border-[#4ade80] bg-black md:left-[2.25rem]"
        aria-hidden="true"
      />
      <div>
        <div className="font-display text-base font-medium text-accent">
          {feature.num}
        </div>
        <h3 className="mt-3 font-display text-2xl font-semibold leading-tight md:text-3xl">
          {feature.title}
        </h3>
        <p className="mt-5 max-w-md text-zinc-400">{feature.body}</p>
        <div className="mt-7">
          <a href="/signup" className="btn-pill text-sm">
            Get Started Now
            <ChevronRight size={16} strokeWidth={2.4} />
          </a>
        </div>
      </div>
      <div className="card-frame-tight flex aspect-[4/3] items-center justify-center p-6">
        <Illo className="h-full w-full" />
      </div>
    </div>
  );
}

// Re-export so Link is intentionally available
export const _Link = Link;
