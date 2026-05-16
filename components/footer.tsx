import Link from "next/link";
import { Logo } from "./logo";

const cols = [
  {
    title: "Developers",
    items: [
      { label: "Documentation", href: "/docs" },
      { label: "Status", href: "/status" },
      { label: "Plugins", href: "/plugins" },
      { label: "Open Cart", href: "/plugins/opencart" },
      { label: "WooCommerce", href: "/plugins/woocommerce" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "FAQ/Support", href: "/support" },
      { label: "Exchange Rates", href: "/rates" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Supported Countries", href: "/countries" },
      { label: "Referral Program", href: "/referral" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About Us", href: "/about" },
      { label: "Career", href: "/careers" },
      { label: "Blog Articles", href: "/blog" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="px-8 pt-20 pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-display text-base font-semibold text-fg">
                {c.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {c.items.map((i) => (
                  <li key={i.label}>
                    <Link
                      href={i.href}
                      className="text-sm text-fg-muted transition-colors hover:text-fg"
                    >
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 border-t border-[var(--border)] pt-8 text-center text-sm text-fg-subtle">
          Private Policy
        </div>
      </div>
    </footer>
  );
}
