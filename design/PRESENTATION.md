# BlockPay v2 — Design Pitch (90-second read)

The current product is on the right track but visually shouts at every surface — green-tinted borders everywhere, the brand-word-in-green pattern repeated in every headline, decorative-only motion. The proposed v2 is the same product with the volume turned down: structure felt not seen, one accent reserved for the *active* path, numbers as the hero, motion only where it's functional. The aim is to read as a serious money-movement product (Mercury, Polymarket) rather than a crypto-themed marketing site.

---

## The three palette options

See [DESIGN_EXPLORATION.md § 3 — Palette options](./DESIGN_EXPLORATION.md#3-palette-options) for the full tables.

| | Stealth (evolution) | Vault (departure) | Aurora (departure) |
|---|---|---|---|
| **bg** | `#000000` | `#0a0908` (warm) | `#06080d` (cool) |
| **accent** | `#4ade80` green | `#d4a574` brass | `#3ee0a1` electric green-cyan |
| **vibe** | Same green-on-black, but borders drop to neutral and green is reserved for "active" only | Mercury-style desaturated warm — institutional, anti-crypto-cliché | Linear-style cool midnight — best if dashboard grows charts and data viz |
| **risk** | Lowest — conservative evolution | Highest — drops brand green for brass | Medium — same green family but distinctly cooler |
| **best for** | If we want minimal disruption | If we want to position upmarket | If we expect heavy data-viz on dashboard |

My recommendation: **Stealth** for `/pay/[slug]` (it's the customer's first impression, keeping brand continuity matters), **Aurora** for the merchant dashboard (data-heavy surface that needs chart-friendly colors), and **Vault** worth a serious look for marketing/grant deck because it differentiates hardest from the sea of green-on-black crypto landing pages. We don't have to pick one for the whole product — pick one accent, pick one shell tone, but let the surface define which palette of the three.

---

## Mockups (open in browser)

1. [`mockup-checkout-v2.html`](./mockup-checkout-v2.html) — Vault palette. Split layout: merchant + invoice on left, pay panel + 4-step rail on right. Demo bar at bottom toggles `Default → Connecting → Confirming → Success` states. Success state has the one-shot shimmer.
2. [`mockup-dashboard-v2.html`](./mockup-dashboard-v2.html) — Aurora palette. Sidebar at 240px, env switcher, 4-tile strip with sparklines, real SVG chart with this-week-vs-last-week, rail breakdown, activity feed with row-hover actions and a shimmer on the newest row.
3. [`mockup-pay-link-v2.html`](./mockup-pay-link-v2.html) — Stealth palette. Centered, 88px hero amount, recommended-method pill, expandable "other methods", invoice details below. Soft accent vignette behind the hero number.

---

## What would change in the live app if we adopted this

- **Replace green-tinted default borders with neutral `rgba(255,255,255,0.06)`.** Reserve green borders for the *one* surface the user is currently inside. This is the single biggest visual upgrade — touches every card.
- **Drop the "BlockPay" word-in-green pattern from every headline.** Use it once per page maximum (hero only). Currently it's in every section headline and reads like a tic.
- **Add a `tnum` utility and apply tabular-nums + slashed-zero to all displayed amounts.** Space Grotesk already supports it; we're just not opting in.
- **Introduce a `mint` color (`#7af0b1`) distinct from the active green.** Use mint for *confirmed/settled* states so they stop fighting the active CTA for attention.
- **Collapse the chain-pills + token-select on checkout into a single "Recommended" row with "Other ways to pay" tucked behind a toggle.** Most users don't want to choose.
- **Replace the multi-status receipt with a 4-step horizontal rail** (`Pay → Submit → Confirm → Settled`) — easier to glance, doesn't hide steps behind status colors.
- **Add the numeric-roll micro-interaction to all displayed amounts** that change (balance, volume tile, etc.). 200ms ease-out, only the digits that changed.
- **Add the one-shot tx-confirmed shimmer** to the receipt row when a transaction settles. No looping.
- **Tighten the sidebar nav:** smaller icons (16px), label color at zinc-400 not white, active state via subtle background not bright color.
- **Pull dashboard search behind `Cmd+K`** — frees the topbar for env switcher only.
- **For `/pay/[slug]`, add a 600px radial accent vignette behind the hero amount** — makes the number feel important without resorting to gradient effects.

Most of these are CSS-token swaps and the addition of two utilities (`tnum`, `step-glow`). The structural HTML doesn't need to change — globals.css does the heavy lifting.
