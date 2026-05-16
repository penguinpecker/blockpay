import { ArrowDownLeft, ArrowUpRight, Plus } from "lucide-react";

/**
 * Static visual approximation of the /app wallet surface, rendered inside a
 * simulated phone frame. Purely illustrative — does NOT import or duplicate
 * anything from the live /app components.
 */
export function PhonePreviewSection() {
  return (
    <section className="px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1fr]">
          <div>
            <span className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elev)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              The app
            </span>
            <h2
              className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-fg md:text-5xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              Your USDC, one screen.
            </h2>
            <p className="mt-6 max-w-md text-fg-muted">
              Open BlockPay and you’re looking at your balance — across every
              supported chain, in one number. Send, request, or top up from
              the same place. No chain switching, no token picker, no
              guesswork about fees.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-fg">
              <Bullet>Unified balance across six chains</Bullet>
              <Bullet>Recent activity with signed receipts</Bullet>
              <Bullet>Send to a saved contact in one tap</Bullet>
            </ul>
          </div>

          <div className="flex justify-center">
            <PhoneFrame />
          </div>
        </div>
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-[7px] inline-block h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--accent)]"
        aria-hidden="true"
      />
      <span>{children}</span>
    </li>
  );
}

function PhoneFrame() {
  return (
    <div
      className="relative w-[320px] shrink-0 rounded-[44px] border border-[var(--border-strong)] bg-[var(--bg-panel)] p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]"
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/80" />
      <div className="overflow-hidden rounded-[34px] border border-[var(--border)] bg-[var(--bg)]">
        <div className="px-6 pt-10 pb-6">
          <div className="flex items-center justify-between text-xs text-fg-subtle">
            <span>BlockPay</span>
            <span className="tnum">9:41</span>
          </div>

          <div className="mt-8">
            <div className="text-xs uppercase tracking-[0.18em] text-fg-subtle">
              Total balance
            </div>
            <div className="mt-2 flex items-baseline gap-1 font-display">
              <span className="text-fg-muted">$</span>
              <span className="tnum text-5xl font-bold text-fg">2,481</span>
              <span className="cents text-fg-muted">.20</span>
            </div>
            <div className="mt-2 text-xs text-fg-subtle">USDC across 6 chains</div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <ActionPill label="Send" Icon={ArrowUpRight} />
            <ActionPill label="Request" Icon={ArrowDownLeft} />
            <ActionPill label="Top up" Icon={Plus} />
          </div>

          <div className="mt-8">
            <div className="text-xs uppercase tracking-[0.18em] text-fg-subtle">
              Recent
            </div>
            <ul className="mt-3 space-y-1">
              <ActivityRow name="alex.eth" sub="Coffee" amount="−$4.50" />
              <ActivityRow name="mira" sub="Rent split" amount="+$640.00" positive />
              <ActivityRow name="sam.sol" sub="Tickets" amount="−$120.00" />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionPill({
  label,
  Icon,
}: {
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-strong)] text-accent">
        <Icon size={14} strokeWidth={2.2} />
      </span>
      <span className="text-[11px] font-medium text-fg">{label}</span>
    </div>
  );
}

function ActivityRow({
  name,
  sub,
  amount,
  positive = false,
}: {
  name: string;
  sub: string;
  amount: string;
  positive?: boolean;
}) {
  return (
    <li className="flex items-center justify-between border-t border-[var(--border)] py-3 first:border-t-0">
      <div className="min-w-0">
        <div className="truncate text-sm text-fg">{name}</div>
        <div className="truncate text-[11px] text-fg-subtle">{sub}</div>
      </div>
      <div
        className={`tnum text-sm ${positive ? "text-mint" : "text-fg"}`}
      >
        {amount}
      </div>
    </li>
  );
}
