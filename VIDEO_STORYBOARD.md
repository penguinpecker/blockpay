# BlockPay — 5-minute Technical Demo Video

**Total runtime target: 4:30 (safety margin under 5:00 cap).**
**Two halves: Code walkthrough (2:30) → Live integration demo (2:00).**

Tools to record with:
- Screen recorder of choice (Loom, OBS, QuickTime). QuickTime Player handles 1080p/2K fine; OBS if you want a webcam picture-in-picture.
- Audio: built-in mic is fine; if you have a USB mic, use it.
- One monitor full-screen. Hide notifications: System Settings → Notifications → Do Not Disturb.
- Browser zoom set so code is legible from a 1080p export. ~125–150% in VS Code, ~110% in the browser.

Tabs to have pre-loaded (in this exact order, so we just Cmd+Tab through them):
1. VS Code or Cursor on `~/Projects/blockpay/contracts/src/BlockPayRouter.sol`
2. VS Code with `lib/web3.ts` open in a second tab
3. VS Code with `lib/checkout-paymaster.ts` open in a third tab
4. Terminal at `~/Projects/blockpay/contracts` ready to run `forge test`
5. Browser: https://explorer.testnet.arc.network/address/0x50a2a3684F1df4db9A58C21febaf23D6b7DC8B2F
6. Browser: https://blockpay-six.vercel.app/embed/preview
7. Browser: https://explorer.testnet.arc.network/tx/0x7d406ca7ea28740e3f32564dd4d34102fd01becc726a863c4d1e35ef7de2794f (deploy tx)

---

## Frame 1 — Cold open (0:00 → 0:15)

**Visual:** Live homepage at https://blockpay-six.vercel.app. Scroll slowly from hero through the "Business to Wallet" flow card so the reviewer sees the brand and the value prop in motion.

**Script:**
> "I'm building BlockPay — a non-custodial stablecoin payment gateway. Merchants accept USDC on any chain with one-click Shopify or WordPress integration, customers check out gaslessly, and every payment carries a verifiable on-chain receipt. Today I'll walk through what's already live on testnet — contracts, frontend, and a full Circle stack integration."

---

## Frame 2 — Contract walkthrough (0:15 → 1:00)

**Visual:** VS Code. Open `contracts/src/BlockPayRouter.sol`. Scroll through these sections in order: import block (highlight OZ imports), `pay()` function (the core), splits + fee loop, custom errors at the bottom.

**Script:**
> "Here's the core settlement contract — `BlockPayRouter`. It's a stateless router. A payment comes in, the contract pulls USDC from the customer, distributes it atomically to the protocol fee, any marketplace splits, and the merchant residue — then emits a `Settled` event with the invoice ID, payer, merchant, and a receipt CID. Funds never sit in the contract between blocks. Replay-protected per invoice. Pausable, owner-gated, ReentrancyGuarded. 0.5 percent default fee, hard-capped at 2 percent so the owner can never rug merchants."

**Visual cue:** Highlight `event Settled(...)` line and the `memoCid` field specifically.

> "The `memoCid` field is the IPFS content ID for the line-item receipt — signed off-chain by the merchant, pinned to IPFS, referenced on-chain. That gives customers a human-readable, cryptographically verified statement of every purchase — the on-chain equivalent of a credit card line item."

---

## Frame 3 — Test suite (1:00 → 1:30)

**Visual:** Terminal at `~/Projects/blockpay/contracts`. Run `forge test -vv` live. Show the 14/14 passing output. Highlight the fuzz test line with 256 runs.

**Script:**
> "Fourteen tests, all passing — including a 256-run fuzz invariant that asserts the router never holds any USDC dust across a payment. Replay protection, split overflow, fee cap, zero-address guards, pause behavior, non-owner rejection — all covered. This is the test suite I'll hand to an external auditor."

---

## Frame 4 — Circle integrations in code (1:30 → 2:30)

**Visual:** VS Code. Three tabs in quick succession.

(a) `lib/contracts.ts` — scroll to the `arc-testnet` entry. Highlight `router`, `testUsdc`, `circlePaymasterV08`, `entryPointV08`.

**Script:**
> "Every chain we support has the Router address, native USDC address, Circle Paymaster v0.8 address, and the ERC-4337 EntryPoint baked in. No off-chain config — Circle Paymaster is a deployed contract."

(b) `lib/web3.ts` — scroll to the `ROUTER_ABI` and `ERC20_ABI` block.

**Script:**
> "Viem + permissionless. No wagmi, no RainbowKit, kept the bundle lean. The ABIs are typed end-to-end from Solidity through to the React checkout."

(c) `lib/checkout-paymaster.ts` — scroll through the gasless flow function. Highlight `toEcdsaKernelSmartAccount`, the `buildUsdcPermit` call, and `bundlerClient.sendUserOperation` with the `paymaster` field.

**Script:**
> "Here's the gasless ERC-4337 flow. Customer connects an EOA. We instantiate a Kernel smart contract account — version 0.3.1, EntryPoint v0.8. We build an EIP-2612 permit on USDC granting Circle Paymaster a small allowance. The UserOp goes to Pimlico's bundler, Circle Paymaster pays the gas in ETH and pulls the equivalent USDC from the account. Customer never holds a native gas token. This is the integration Circle Paymaster is built for."

---

## Frame 5 — On-chain proof (2:30 → 3:00)

**Visual:** Browser. https://explorer.testnet.arc.network/address/0x50a2a3684F1df4db9A58C21febaf23D6b7DC8B2F. Show the deployed Router. Click the "Transactions" tab. Scroll the e2e payment tx where merchant got exactly 99.5 tUSDC.

**Script:**
> "And here's the Router live on Arc Testnet. Below is the end-to-end live payment we ran: 100 test USDC paid by the operator, 0.5 USDC fee to the protocol address, 99.5 USDC to the demo merchant. Zero dust left in the contract. That's a real on-chain settlement, not a mock."

**Visual cue:** Open the explorer for the tx hash, point at the `Settled` event in the logs.

---

## Frame 6 — Live checkout demo (3:00 → 4:15)

**Visual:** Browser at https://blockpay-six.vercel.app/embed/preview. Show the embedded checkout card.

**Script:**
> "Now the customer side. This is the checkout widget that gets embedded in a merchant's Shopify or WordPress store. I'll click Connect Wallet — MetaMask pops up — accept. The card now shows my address. I'll keep Arc Testnet selected — Circle Paymaster live there — and hit Pay."

**Action:** Click Connect Wallet. Approve in MetaMask. Click Pay.

**Script during the gasless flow:**
> "Watch the status update. First it computes the smart account address. It mints test USDC straight to that account — that's a demo convenience, in production the customer brings their own USDC. Then it asks me to sign an EIP-2612 permit — this grants Circle Paymaster a USDC allowance for gas. I sign. The UserOp goes off to the Pimlico bundler. Confirming on-chain."

**Visual after success:** Show the green success card with the tx hash. Click the explorer link.

**Script:**
> "Done. Tx confirmed. Note I didn't have a single wei of ETH in my wallet — the gas was paid by Circle Paymaster, in USDC, from the customer's smart account. This is the UX stablecoin commerce needs."

---

## Frame 7 — Wrap (4:15 → 4:30)

**Visual:** Back to the homepage hero. Slow fade.

**Script:**
> "That's BlockPay — a working non-custodial stablecoin gateway, live on Arc Testnet, with a Circle Paymaster gasless flow, signed receipts, and a Stripe-grade developer experience. The grant funds the security audit, the Shopify and WooCommerce plugins, and Arc mainnet launch on day one. Thanks."

---

## Recording checklist

- [ ] Quiet room, no notifications, Do Not Disturb on
- [ ] Tabs pre-loaded in order (list at top of this doc)
- [ ] `forge test` passes when run fresh (re-run before recording)
- [ ] MetaMask unlocked with the deployer EOA `0x9D6D…1e14`
- [ ] Wallet has Arc Testnet network added
- [ ] Web app is live at https://blockpay-six.vercel.app (verify before record)
- [ ] Practice run once, no recording, ~4:30 timing
- [ ] Real take. If you flub a line, just keep going — don't restart unless the visual is unusable
- [ ] Trim any pause >2s in post

## Upload checklist for the Circle form

- [ ] Upload to YouTube **Unlisted** (not Private, not Public) — Circle reviewers need to view without a YouTube account
- [ ] Title: "BlockPay — Circle Grants Cohort 2 Technical Demo"
- [ ] Description: "Non-custodial stablecoin payment gateway. Live demo of contracts, frontend, and Circle Paymaster gasless USDC checkout on Arc Testnet. Submitted to Circle Developer Grant Program, May 2026."
- [ ] Paste the YouTube link into the grant form's video field
- [ ] Run-time check: must be ≤ 5:00 even after compression
