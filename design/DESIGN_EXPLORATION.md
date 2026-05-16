# BlockPay v2 — Design Exploration

A design direction for the next pass on BlockPay. Existing stealth-ops fintech vibe stays; we make it sharper, more numeric, more alive. No reboot — an evolution.

---

## 1. Research observations

### Stripe (checkout, dashboard, Radar/Atlas)
Stripe's checkout is famously boring and that's the point — a single column, generous touch targets, the total bolded near the CTA, every error caught inline before submit. The dashboard nails one specific pattern: a 4-tile strip across the top (revenue, charges, payouts, disputes), each tile is a number, a small delta vs. last period, and a sparkline. The Radar/Atlas product pages use Stripe's signature off-black plus heavy use of monospace inline for code-feeling values (transaction IDs, amounts). Their typographic scale is small — display text is rarely larger than 56px, body sits at 14-15px — which makes the whole product feel "calm but dense."

### Helio (heliopay.xyz)
Helio (now MoonPay Commerce) leans hard on a brandable checkout — merchants set primary, neutral, and background colors via the embed config, so the widget feels like part of the merchant's site rather than a third-party iframe. The chain/token picker is collapsed by default (one default option, expandable), which is the correct call: most users don't want to choose. Success state is fast and graphic — confetti or a check, then a redirect. Worth stealing: the "primaryPaymentMethod" concept (one recommended path, others tucked away).

### Coinbase Commerce
Hosted checkout shows a 15-minute countdown — explicit, big, ungilded. The token list is shown as a flat radio group, no fancy chips. The QR pattern with an address-copy fallback is the standard, but Coinbase Commerce nails the "Waiting for transaction" intermediate state — they don't try to hide the fact that confirmations take time, they make waiting feel like the app is working. Coinbase's broader system uses a serif (Coinbase Sans) for prose and lots of whitespace; commerce inherits the calmness.

### Mercury (mercury.com)
Mercury rejects the financial-product cliché entirely — no green-on-black "money trust" signals, instead a desaturated cream/charcoal palette with their proprietary Arcadia typeface. The breakthrough detail: variable-font weight 480 for headlines, which reads as authoritative without being chunky. Body line-height is 1.625 (more generous than the typical 1.5), text color is rgb(237,237,243) not pure white. The dashboard treats numbers as the hero — every balance is huge, tabular, and unboxed. Lesson: dark mode as positioning, not as a toggle.

### Wise / Revolut
Wise reduces high-stress transactions (international transfer) to a 4-line summary: what you send, what they get, when it arrives, the fee. Every input updates the summary live. Revolut nails real-time animation on confirmations — toast notifications, balance counter rolling, a step-by-step "sent → routed → delivered" sequence. They both default to showing the destination amount first because that's what the user actually cares about, with the conversion shown small below.

### Linear (linear.app)
Linear's March 2026 refresh ("calmer interface") tightened a few specific knobs: less sidebar brightness so it stops competing with main content, softer separator contrast ("structure should be felt not seen"), smaller icons, icon-only pill tabs. Color palette shifted from cool saturated blue toward warmer desaturated gray. They use feature-flagged incremental rollouts rather than big redesigns — they're allergic to ceremony.

### Privy.io
Privy gives merchants two embedded-wallet UX modes: the default modal (transaction preview + sign), or headless (you build the modal yourself). The header text in their default modal is small and literal ("Review transaction" / "Send 50 USDC") — no marketing copy. They've explicitly leaned into the fact that the modal is a moment of trust, so it stays plain. Worth stealing: the literal, no-spin transaction-preview header and the affordance to fully customize it.

### Dynamic.xyz, Reown / WalletConnect
The modal pattern has converged across the industry: a centered card, search bar at top, a vertical list of wallets each with icon + name + "Installed" / "QR" status, recent wallets pinned. Reown explicitly recommends loading indicators between signed-but-not-acknowledged states and auto-dismissing expired modals. The detail that separates good from generic: showing wallet status (installed vs. needs QR) inline rather than making the user click and find out.

### Polymarket
Polymarket's UI is shockingly utilitarian for a billion-dollar product — dark theme, tabular numbers, a chart, a buy/sell panel. There's no "this is crypto" signaling at all, no chain logos, no wallet badges. With the move to native Polymarket USD (replacing USDC.e bridged), they've further hidden the rails — the user sees "USD," not "USDC on Polygon." Lesson: high-trust products under-signal.

### Daimo / Family / Pillar
Daimo replicates Venmo onchain — a feed of payments with avatars, names, amounts in plain dollars, no chain or token noise at the surface layer. Keys live in the phone's secure enclave, no seed-phrase ceremony. The "one click from any chain, any coin, any wallet" pitch is reflected in the UI by literally hiding everything multi-chain until the user expands "Pay with…". Family Wallet (consumer EVM) leans into haptic-feeling motion: chunky spring transitions, slot-machine number rolls on balance updates. Combined lesson: when crypto is the rail, hide the crypto.

### Behance / Dribbble — "stablecoin payment interface" & "fintech dashboard dark mode"
Patterns that recur across well-rated work: (a) tabular numerals everywhere monetary, (b) sparklines instead of full charts inside tiles, (c) one strong accent color, never two competing, (d) numbers are huge (50-80px) on dashboard tiles, (e) success states use a single subtle motion — a check stroke drawing, a one-shot shimmer, or a balance counter rolling — never confetti, (f) status pills use desaturated chip colors (mint-on-charcoal, not pure green), (g) row hover reveals secondary actions rather than always-showing them. The "AI aesthetic" trap is over-applied glassmorphism and rainbow gradients — the highest-rated work is monochromatic with one accent.

---

## 2. Synthesized principles for BlockPay v2

1. **Every numeric value is a story.** Tabular nums always. Money is displayed larger than its surroundings. On change, numbers don't pop — they roll. Cents are de-emphasized (smaller / lower-contrast) so the magnitude reads first.
2. **Structure should be felt, not seen.** Borders go from `rgba(74,222,128,0.18)` to `rgba(255,255,255,0.06)` for most dividers; the green border is reserved for the *one* surface the user is currently acting on. This is the Linear move — fewer lines doing the same job.
3. **One accent, one job.** Green = "this is the active path" (CTA, current step, selected token, just-confirmed). Status colors (warn amber, error red) appear *only* in error states, never decoratively. No second brand color for "info."
4. **Hide the crypto until asked.** Default checkout shows the merchant's amount in USD, a single recommended payment method, and "Other ways to pay" collapsed. Token+chain selectors don't appear unless the user opens them. The Polymarket / Daimo move.
5. **Waiting is part of the product.** Confirmation pending isn't a spinner — it's a designed state. A timeline ("signed → submitted → confirmed → settled") with the current step glowing, the rest dimmed. Estimated time visible. Cancel option visible.
6. **Two type sizes for body, three for display, that's it.** Stop the 14-different-sizes drift. Body: 14 (caption) and 15 (default). Display: 20 (subhead), 28 (section), 56 (hero). Numbers can go bigger as a special case — 80px on the dashboard tile is fine, that's the number doing the talking.
7. **Motion is functional or it's gone.** Allowed motions: numeric roll (200ms), pill morph on hover (160ms), one-shot success shimmer on tx-confirmed (700ms, no loop), step-glow on active checkout step. Banned: ambient gradient drifts, blob shaders, parallax on scroll, anything that runs while idle.

---

## 3. Palette options

Three palettes. Each is a complete kit — bg, surfaces, text, accent, borders, status. Pick one; the mockups demonstrate them in order (Vault on checkout, Aurora on dashboard, Stealth on pay-link).

### Option A — "Stealth" (evolution of current)
The conservative path. Keep the black-and-green identity, but desaturate the green slightly, push borders away from green and toward neutral white-at-low-opacity, and add a mint variant for "confirmed" states distinct from the active-CTA green.

| Token | Hex | Use |
|---|---|---|
| `bg` | `#000000` | Page |
| `bg-panel` | `#0a0d0b` | Section dividers |
| `bg-card` | `#0e1411` | Cards (slightly cooler than current) |
| `bg-elev` | `#141a16` | Elevated surfaces (modals, hover) |
| `fg` | `#f3f5f3` | Primary text (off-white, not pure) |
| `fg-muted` | `#9aa39c` | Body |
| `fg-subtle` | `#5f6863` | Captions, separators-as-text |
| `accent` | `#4ade80` | Active CTA, current step (keep) |
| `mint` | `#7af0b1` | Confirmed-state highlight (lighter than accent) |
| `border` | `rgba(255,255,255,0.06)` | Default border (NEW — replaces green-tinted) |
| `border-active` | `rgba(74,222,128,0.45)` | Border only on the surface being acted on |

**Rationale:** The current palette uses green-tinted borders everywhere, which makes the whole product shout "active." If everything shouts, nothing shouts. We strip green from structural borders, reserve it for *the one surface the user is currently inside*, and add mint as a distinct "confirmed" signal so a settled transaction doesn't visually clash with the live CTA next to it.

### Option B — "Vault" (departure — warm desaturated)
The Mercury-influenced path. Drop saturated green to a single accent moment, build the whole shell from warm grays. Reads as a serious money product, not a crypto product.

| Token | Hex | Use |
|---|---|---|
| `bg` | `#0a0908` | Page (warm near-black) |
| `bg-panel` | `#15120f` | Section dividers |
| `bg-card` | `#1c1916` | Cards |
| `bg-elev` | `#252220` | Elevated |
| `fg` | `#edebe8` | Primary (warm off-white) |
| `fg-muted` | `#a8a39c` | Body |
| `fg-subtle` | `#6b6660` | Captions |
| `accent` | `#d4a574` | Brass accent — used SPARINGLY (one button per screen) |
| `accent-cool` | `#7ec9a6` | Confirmed-state mint (cooled, not bright) |
| `border` | `rgba(237,235,232,0.07)` | Default |
| `border-active` | `rgba(212,165,116,0.4)` | Active surface |

**Rationale:** Most crypto products signal "money" via shouty green or blue. Mercury proved you can position upmarket by *not* doing that. Brass accent (a warm tan) feels institutional — bank vault, not Robinhood. The mint reserved for confirmations gives the one "yes, that landed" moment a different color than anything else on the page. Bold choice; departs hardest from current brand.

### Option C — "Aurora" (departure — cool electric)
A more product-feeling, dashboard-first palette. Pulls toward a Linear/Vercel midnight aesthetic — saturated cool darks, a sharper green-cyan as accent, lots of room for data visualization color.

| Token | Hex | Use |
|---|---|---|
| `bg` | `#06080d` | Page (cool near-black) |
| `bg-panel` | `#0a0e16` | Section dividers |
| `bg-card` | `#0e131d` | Cards |
| `bg-elev` | `#141a26` | Elevated |
| `fg` | `#e7eaf2` | Primary (cool off-white) |
| `fg-muted` | `#8a92a3` | Body |
| `fg-subtle` | `#525968` | Captions |
| `accent` | `#3ee0a1` | Electric green-cyan (slightly cooler than current) |
| `accent-glow` | `#7df5c4` | Hover/active highlight |
| `border` | `rgba(231,234,242,0.06)` | Default |
| `border-active` | `rgba(62,224,161,0.45)` | Active surface |
| `chart-1..4` | `#3ee0a1, #6aa6ff, #c084fc, #f59e0b` | Reserved for data viz only |

**Rationale:** If we expect the dashboard to grow (charts, cohorts, exports), we need a palette that supports multiple data colors without clashing. Aurora keeps a single brand accent for CTAs but reserves a documented 4-color set for charts that all read well on the cool-dark background. Best path if the product roadmap is dashboard-heavy.

---

## 4. Typography pairings

### Pairing 1 — "Tight" (recommended for v2)
- **Display:** Space Grotesk (existing) — keep, but only use weights 500 and 700. Drop 600. Lock display headlines to -0.02em letter-spacing.
- **Body:** Manrope (existing) — keep. Weights 400 and 500 only.
- **Mono / Numerals:** JetBrains Mono for code (txids, addresses). For *prices*, use Space Grotesk with `font-variant-numeric: tabular-nums slashed-zero`. We don't need a separate numeric font — Space Grotesk's tabular numerals are excellent.

Rationale: minimal change, fixes the size sprawl. Existing fonts, fewer weights, locked letter-spacing.

### Pairing 2 — "Editorial"
- **Display:** Söhne Breit or Inter Display at weight 500 with -0.025em — feels institutional, less geometric than Space Grotesk.
- **Body:** Inter at 14-15px.
- **Mono:** Berkeley Mono (paid) or IBM Plex Mono (free) for addresses.
- Numerals: Inter has true tabular numerals via OpenType feature `tnum`.

Rationale: If we want the Mercury-feel for the Vault palette, Inter Display at low weights gets us there. Costs a font swap.

### Pairing 3 — "Display-led"
- **Display:** Migra or PP Editorial New (a contrast-serif) at heavy weights — for hero only, max 1 use per page.
- **Body:** Manrope (keep).
- **Mono:** JetBrains Mono.
- Numerals: Migra has lovely lining figures; use serif for hero amount on `/pay/[slug]` only, sans elsewhere.

Rationale: Hero serif on the public pay-link page is a memorable differentiator — most crypto checkouts are pure-sans. Risk: serifs in fintech can read as banker-stuffy, which is wrong for us. Use sparingly.

---

## 5. Motion + interaction patterns

| Pattern | Trigger | Spec |
|---|---|---|
| **Numeric roll** | Any displayed amount changes (price update, balance change) | Digit-by-digit roll, 200ms ease-out, only the digits that changed |
| **Pill morph** | Hover on `btn-pill` / `btn-pill-solid` | Border/bg crossfade 160ms; on click, 4px down-scale + back (80ms) |
| **Tx-confirmed shimmer** | Transaction enters "confirmed" state | One-shot diagonal shimmer across the receipt row, 700ms, then settle |
| **Step-glow** | Active step on a multi-step process | Soft halo at 60% accent opacity, pulses ONCE on entry (no loop) |
| **Address truncate-reveal** | Hover on truncated address | Tooltip with full address + copy button, 100ms fade |
| **Token-list expand** | Click "Other ways to pay" | Height-auto + opacity transition, 240ms cubic-bezier(0.22, 1, 0.36, 1) |
| **Row reveal** | Hover on activity row | Reveal secondary actions (copy, view) sliding from right, 200ms |
| **Skeleton load** | Async data | Subtle shimmer at 8% opacity, NOT a moving-gradient block — just the cells slightly breathing |
| **Toast / Success** | Action completed | Slide-up + fade, 300ms in, hold 2.4s, fade out 200ms |
| **Forbidden** | — | Ambient gradient drift, blob shaders, parallax on scroll, bounce easing, anything > 800ms, anything that loops while idle |

---

## 6. Specific recommendations for BlockPay surfaces

### Checkout (`/checkout/[id]`)
- Collapse chain pills + token select behind one "Pay with USDC on Base" pill (the recommended path) with "Other options" as a text link. Most users never expand it.
- Hero amount is the only thing > 32px on the page. It uses tabular-nums and sets cents at 60% opacity / 70% size so $129**.50** reads as one unit but the magnitude wins.
- Replace the four-status receipt with a horizontal step rail: `Pending → Submitted → Confirmed → Settled`. Current step has the step-glow halo, prior steps are mint, future steps are subtle.
- Wallet-connect button: pill, contains the wallet icon + "Connect" only — no "wallet" word, no rainbow icon row. Click opens a slim modal with installed wallets first.

### Dashboard overview (`/dashboard`)
- 4-tile strip: Revenue (today), Settled count (today), Refund count (today), Net new customers (today). Each: number 56-72px, sparkline 32px tall, delta chip below.
- Activity feed dominates the rest of the page — no chart hero. Charts live behind tabs.
- Sidebar drops to 240px wide, icons 16px not 20, label sits at zinc-400 not white until hovered. (Linear move.)
- Topbar shows ONLY the merchant name + env switcher (Test/Live). Pull search out — make it `Cmd+K`.

### Payment link page (`/pay/[slug]`)
- This is the customer's first impression of the merchant — invest here.
- Top-third: merchant brand strip (logo + name + verified-domain micro-badge). Center: hero amount + invoice description. Bottom-third: single pay button + "Pay with another method".
- Use a soft accent vignette behind the hero amount — *not* a gradient blob, just a 600px radial at 12% accent opacity. Makes the number feel important without a "design effect."
- Show "Powered by BlockPay" as a tiny text link, not a logo lockup — respect the merchant's surface.

### Grant deck / marketing
- Drop the "BlockPay" word-with-green-highlight pattern from EVERY headline — diminishing returns. Use it once per page maximum (hero only).
- Pull illustrations toward photographic / textural backgrounds for hero sections; keep SVG illustrations for feature diagrams only. The current isometric illustration style works for "how it works" but is too playful for the top of the deck.
