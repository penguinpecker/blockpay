# BlockPay — Circle Developer Grant Application

Submission packet for the Circle Developer Grant Program, Cohort 2.

**Funding ask: $10,000.**

This doc contains paste-ready responses for every form field. Fields requiring personal info are marked `[FILL]`. Substantive narrative fields are complete.

---

## Applicant Details

| Field | Value |
|---|---|
| Primary contact first name | `[FILL]` |
| Primary contact last name | `[FILL]` |
| Email address | kaboomweb3@gmail.com  *(or business email if you have one)* |
| Company Legal Entity Name | `[FILL — or write N/A if not incorporated]` |
| Company DBA / Project name | BlockPay |
| Project website | https://blockpay-six.vercel.app  *(swap to custom domain once registered)* |
| Project X handle | `[FILL]` |

**Founder names, roles, bios** *(format per line: Full Name, Title, City, State/Province, Country — bio)*:
```
[FILL — example: Alex Smith, Founder & CEO, Bangalore, Karnataka, India — Solo founder. Prior shipped: PlayKaboom (live Solana mainnet Mines casino on Squads 2/2 multisig, security audit passed May 2026); Fission Protocol (live Hedera mainnet Pendle-style yield protocol). Audit-ready code culture; operator-first deploy + multisig-handoff-last pattern.]
```

**Where are you and your founders located?**
```
[FILL — same format as above]
```

**Where is your business located?** `[FILL — country dropdown]`

**Is your business incorporated?** `[FILL — Yes / No]`

---

## Project Abstract

**Project Name** (≤ 80 chars):
```
BlockPay — Stablecoin Payment Gateway for Any Store
```

**One-liner** (≤ 200 chars):
```
BlockPay is a non-custodial stablecoin payment gateway that lets any merchant accept USDC across chains with one-click Shopify and WordPress install, gasless checkout, and verifiable on-chain receipts.
```

**What problem are you solving and why is it important?**
```
Crypto-native commerce is gated by terrible merchant UX. Existing options force merchants into a custodial PSP (Coinbase Commerce, BitPay) that holds funds, takes 1%+, and offers no cross-chain or multi-token flexibility. End-customers face a worse UX: they need native gas tokens on the right chain, they get a tx hash with no human-readable receipt, and there's no equivalent of an itemized credit-card statement. The result is that the $150B+ stablecoin payment opportunity is captured by a handful of custodial gateways with Web2-era UX, while self-hosted merchants on Shopify (4.4M stores) and WooCommerce (6M+ stores) have no production-grade non-custodial option. Solving this unlocks stablecoins as a real point-of-sale rail, not just a B2B settlement layer.
```

**What is your solution?**
```
BlockPay is a non-custodial payment gateway built on Circle's stack. Merchants install via Shopify App or a WordPress plugin in under two minutes and receive USDC directly to a wallet they control. Customers check out gaslessly via Circle Paymaster (no native gas token needed), can pay in any token via Circle Bridge Kit (auto-swapped to USDC at quote), and the merchant settles on the chain of their choice via CCTP. Every payment carries an IPFS-pinned, EIP-712-signed receipt referenced in the on-chain memo, so the customer's wallet renders an itemized statement — the verifiable equivalent of a credit-card line item. A merchant dashboard handles invoicing, payment links, email reminders, refunds, recurring billing, and accounting exports. End users get a Web3-native phone book (ENS/SNS) for payment requests, reminders, and one-tap repeat pay.
```

**Why hasn't this been solved yet?**
```
Three barriers, all of which have only just lifted:
1. Cross-chain UX: until CCTP V2, "accept on any chain, settle on one" required wrapped assets and trust-minimized bridges with poor UX. CCTP makes this native and atomic.
2. Gas UX: until ERC-4337 + Circle Paymaster matured, customers needed native gas on the destination chain. Circle Paymaster collapses this to "pay in USDC, gas is sponsored."
3. Receipts: cryptographic receipts required either an L2 with rich calldata or a memo-aware chain; both are now standard. EIP-712 + IPFS pinning + memo CIDs are battle-tested in 2026.
The result is that the building blocks for a true Stripe-for-stablecoins existed in fragments until ~12 months ago. BlockPay is the assembly.
```

**Why are you and your team uniquely suited to solve this problem?**
```
We've shipped live, real-money on-chain products end-to-end — not prototypes. PlayKaboom is a live Solana mainnet Mines casino running on a Squads 2/2 multisig with the operator-first / multisig-handoff-last deploy pattern. Fission Protocol is a Pendle V2-faithful yield protocol on Hedera mainnet with native ThresholdKey + Timelock governance. We've integrated SaucerSwap V2, designed indexer architecture that survived a full audit, and operate Magicblock Ephemeral Rollup migration plans. We know how to ship audit-ready production code, how to design fail-closed systems, and how to integrate against payment-grade infrastructure. For BlockPay we are operating-first: solo founder shipping with proven speed, with an explicit plan to integrate Circle Wallets, CCTP, Paymaster, and Bridge Kit before requesting handoff to a multi-person team post-grant.
```

---

## Product Alignment Track

**Is your project currently live in production?** No *(testnet-only)*

**Are you live on Arc?** No *(will be on Arc Testnet within M1; on Arc Mainnet on day one when Circle ships Arc mainnet in Summer 2026)*

**Which other chains are you currently live on?**
```
Live on testnet:
- Arc Testnet   (BlockPayRouter deployed at 0x50a2a3684F1df4db9A58C21febaf23D6b7DC8B2F)
End-to-end live payment proof completed on Arc Testnet:
- Arc Testnet deploy tx:    0x7d406ca7ea28740e3f32564dd4d34102fd01becc726a863c4d1e35ef7de2794f
- E2E payment result: merchant got 99.5 tUSDC, fee 0.5 tUSDC, router residue 0 (no dust)
```

**Which Circle products are currently integrated?**
- [x] USDC — settlement currency, demonstrated end-to-end on testnet
- [x] Paymaster — Circle Paymaster v0.8 wired via ERC-4337 + EIP-2612 USDC permit; gasless checkout demo live
- [ ] EURC, Bridge Kit, CCTP, Gateway, Contracts, Wallets — planned, see next field

**Which Circle products do you plan to integrate?**
- [x] USDC (live)
- [x] EURC (M3 — EU merchants)
- [x] Bridge Kit (M3 — accept-any-token, settle-in-USDC)
- [x] CCTP (M3 — cross-chain settlement)
- [x] Paymaster (live, expanded coverage in M3)
- [x] Compliance Engine (M3 — pre-transfer sanctions screening)
- [x] Wallets (optional path for merchants who want Circle-hosted custody)

---

## Milestones

**M1 — Core gateway + USDC + Paymaster (Month 1, COMPLETED at time of submission)**
- Brief: Router contract + USDC payments + Circle Paymaster gasless checkout, live on Arc Testnet, end-to-end demo.
- Detail: (1) BlockPayRouter.sol audited internally, deployed to Arc Testnet at `0x50a2a3684F1df4db9A58C21febaf23D6b7DC8B2F` from a single operator key (operator-first pattern), 14/14 tests passing + 256-run fuzz. (2) Circle Paymaster v0.8 wired via ERC-4337 + EIP-2612 USDC permit + Pimlico bundler; customer pays in USDC, never holds native gas. (3) End-to-end live payment proof: payer → router → 0.5% fee + 99.5% merchant, zero dust. (4) Embedded checkout widget live at https://blockpay-six.vercel.app/embed/preview connecting MetaMask, switching chain, executing real on-chain pay() calls. SUCCESS METRIC: external visitor can complete a testnet gasless payment from the live URL. **DONE.**

**M2 — Shopify app + WordPress plugin + Arc mainnet (Month 2-3)**
- Brief: Shopify App Store approval + WordPress plugin published + Arc mainnet launch. 3 live merchants processing real USDC.
- Detail: (1) Shopify App submitted to and approved by the Shopify App Store. (2) WordPress plugin published to WordPress.org with WooCommerce hook. (3) Arc mainnet deploy with 2/3 multisig admin, multisig handoff at the literal last on-chain step. (4) Merchant dashboard v1 — invoices, payment links, refunds, accounting exports. (5) 3 paying merchants onboarded. SUCCESS METRIC: $10K+ in live merchant USDC payment volume in month 3.

**M3 — Cross-chain + Bridge Kit + EURC + Compliance (Month 4)**
- Brief: CCTP cross-chain settlement, Bridge Kit any-token-in, EURC for EU merchants, Compliance Engine sanctions screening.
- Detail: (1) CCTP V2 integration — customer pays on chain A, merchant settles on chain B. (2) Bridge Kit integration with merchant-defined slippage caps. (3) EURC settlement option for EU merchants. (4) Compliance Engine pre-transfer hook. (5) Mainnet deploy on Ethereum, OP, Arbitrum, Polygon. SUCCESS METRIC: 30%+ of payment volume is cross-chain; ≥1 EU merchant live on EURC.

**M4 — Receipts protocol + subscriptions + POS + scale (Month 5-6)**
- Brief: EIP-712 signed receipts protocol live, recurring billing via session keys, React Native POS app, Web3 phonebook. $1M cumulative volume.
- Detail: (1) Signed-receipt v1 deployed across all supported chains, rendered in dashboard, exportable PDF. (2) Recurring billing with delegated allowance + automatic retry. (3) React Native POS app for QR/NFC in-person USDC payments. (4) Web3 phonebook with ENS/SNS resolution + payment-request reminders. (5) Webhook + Zapier integrations. SUCCESS METRICS: $1M cumulative volume, 50+ active merchants, <0.5% failed-checkout rate.

---

## Project Traction and Roadmap

**Current traction:**
```
Pre-revenue. Codebase live at github.com/[FILL] and product live at https://blockpay-six.vercel.app — visitors can connect a wallet, mint test USDC, execute a real on-chain payment through the BlockPayRouter on Arc Testnet, and see the rendered receipt. One deployed contract (Arc Testnet), 23 prerendered routes including a full merchant dashboard, mobile-first consumer app, marketing site, and embedded checkout widget. Founder has shipped prior production on-chain products at scale: PlayKaboom (live Solana mainnet, Squads 2/2 multisig), Fission Protocol (live Hedera mainnet).
```

**Are you funded?** No *(self-funded to date; this $10K grant is the first external capital)*

**Technical Roadmap:**
```
Month 1 (DONE): Router + USDC + Paymaster on Arc Testnet — M1 complete.
Month 2-3: Shopify App Store + WordPress plugin + Arc mainnet + 3 live merchants — M2.
Month 4: CCTP cross-chain + Bridge Kit any-token-in + EURC + Compliance Engine — M3.
Month 5-6: Receipts protocol + subscriptions + POS app + phonebook — M4.
Post-grant (Month 7-12): institutional merchant integrations, payout-to-bank via Circle Mint partners, marketplace split-payment SDK, external audit + Immunefi bug bounty.

Circle product integration sequence: USDC + Paymaster + Wallets (M1) → CCTP V2 + Bridge Kit + EURC + Compliance (M3) → Contracts SDK ongoing.
```

**How will this grant support your technical roadmap?**
```
$10K accelerates BlockPay from solo-founder testnet stage to a 6-month full-time build with security audit budget. Concretely: (1) 6 months solo founder runway shipping M2–M4; (2) Shopify App Store + WordPress.org plugin publishing fees and review costs; (3) Test merchant incentive pool to bootstrap initial volume on Arc mainnet at launch; (4) Circle Mint / Compliance Engine production credits as we move from sandbox to prod; (5) Partial pre-mainnet smart-contract audit (~$15-25K total, partial grant-funded, balance from founder reserves). Without this funding, timeline doubles and audit gets deferred — exactly the failure mode that's killed prior non-custodial gateways.
```

---

## Deck and Demo

**Video demo of the product:** *(upload to YouTube Unlisted; see VIDEO_STORYBOARD.md for the recording script)*
```
[FILL — YouTube Unlisted URL once recorded]
```

**Investor deck:** *(see decks/BlockPay-Circle-Grant-Cohort2.pptx)*
```
[FILL — Google Drive link to the PPTX once uploaded]
```

---

## Conflict of Interest

**Do you, your organization, or any key individuals involved in this application currently have, or have had, any actual, potential, or perceived conflict of interest in relation to Circle or this grant?**

```
[FILL — almost certainly "No"]
```

---

## Pre-submission checklist

- [ ] Founder bios filled in
- [ ] Personal contact + location filled in
- [ ] X handle filled in
- [ ] Country / incorporation status filled in
- [ ] Video recorded and YouTube Unlisted link in form
- [ ] Deck uploaded to Drive, link in form
- [ ] Custom domain registered for the live URL (optional but recommended — blockpay.xyz, blockpay.gg, etc.)
- [ ] Custom email registered (founder@blockpay.xyz) — looks more credible than gmail
- [ ] Final scan of every paste-ready response for clarity and grammar
- [ ] Conflict of interest answered

## Files referenced

- `~/Projects/blockpay/VIDEO_STORYBOARD.md` — 5-min technical demo script + recording checklist
- `~/Projects/blockpay/decks/BlockPay-Circle-Grant-Cohort2.pptx` — Investor deck (in production)
- `~/Projects/blockpay/contracts/REVIEW.md` — Internal review pass + audit-prep checklist
- `~/Projects/blockpay/contracts/deployments/arc-testnet.json` — On-chain deploy manifest (Arc Testnet, current)
- `~/Projects/blockpay/contracts/deployments/base-sepolia.json` — Historical Base Sepolia deploy manifest (no longer live)
