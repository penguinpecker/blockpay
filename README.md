# BlockPay

Non-custodial stablecoin payment gateway built on Circle's stack. Accepts USDC across chains, gasless checkout via Circle Paymaster, EIP-712 signed receipts referenced on-chain.

**Live:** [blockpay-six.vercel.app](https://blockpay-six.vercel.app)
**Live testnet demo:** [blockpay-six.vercel.app/embed/preview](https://blockpay-six.vercel.app/embed/preview) — connect a wallet on Arc Testnet, mint test USDC, pay through the deployed router with no native gas.

---

## What's in the repo

```
app/                          Next.js 16 App Router (marketing, dashboard, user app, checkout)
  api/                          Route handlers: invoices, payments, indexer, Circle webhook
  dashboard/                    Merchant dashboard (overview, payments, invoices, links, customers, settings)
  app/                          Consumer wallet app (send, receive, requests, contacts, activity)
  checkout/[id]/                Embedded checkout surface + success screen
  embed/preview/                Marketing preview wrapping the checkout widget
components/
  checkout/                     Reusable checkout card, chain pills, token select, receipt
  dashboard/                    Sidebar, top bar, stat cards, data table
  userapp/                      Bottom tabs, balance card, activity rows, QR placeholder
  sections/                     Homepage section primitives
  illustrations.tsx             Original SVG illustrations
lib/
  contracts.ts                  Canonical address book per chain
  web3.ts                       Viem + injected-wallet helpers; ROUTER_ABI / ERC20_ABI
  paymaster.ts                  Circle Paymaster v0.8 context builder
  checkout-paymaster.ts         Gasless ERC-4337 + EIP-2612 permit flow
  storage.ts                    Storage interface + in-memory singleton
  server-circle.ts              Server-only Circle REST helper
  server-indexer.ts             Polls Settled events on Arc Testnet
contracts/                    Foundry workspace
  src/BlockPayRouter.sol        Settlement router — replay-protected, splits, fee cap, pausable
  test/BlockPayRouter.t.sol     14 tests + 256-run fuzz
  script/                       Deploy + e2e scripts
  deployments/                  On-chain deployment manifests
  REVIEW.md                     Internal review pass + audit-prep checklist
APPLICATION.md                Circle Developer Grant application responses
VIDEO_STORYBOARD.md           5-minute technical demo script
CIRCLE_SETUP.md               Circle Developer Console setup walkthrough
DESIGN.md                     Brand tokens + UI patterns
IA.md                         Site map across all surfaces
```

---

## Live deployments

| Chain | Network | BlockPayRouter |
|---|---|---|
| Arc Testnet | 5042002 | [`0x50a2a3684F1df4db9A58C21febaf23D6b7DC8B2F`](https://explorer.testnet.arc.network/address/0x50a2a3684F1df4db9A58C21febaf23D6b7DC8B2F) |

End-to-end live payment proof: merchant received 99.5 tUSDC, fee 0.5 tUSDC, router residue zero. See `contracts/deployments/arc-testnet.json` for the manifest and tx hashes.

---

## Circle integrations

- **USDC** — settlement currency, end-to-end live
- **Circle Paymaster v0.8** — gasless customer checkout via ERC-4337 + EIP-2612 USDC permit
- **CCTP V2** — planned (M3)
- **Bridge Kit** — planned (M3, accept-any-token settle-in-USDC)
- **EURC** — planned (M3, EU merchants)
- **Compliance Engine** — planned (M3, sanctions pre-screening)
- **Arc** — primary chain at mainnet launch (Summer 2026)

---

## Run locally

```bash
git clone https://github.com/penguinpecker/blockpay
cd blockpay

# install deps (legacy-peer-deps for permissionless + viem peer constraint)
npm install

# secrets — copy template, fill in your own values, never commit
cp .env.example .env.local

# run
npm run dev
```

Open http://localhost:3000.

### Contracts

```bash
cd contracts
forge install
forge test              # 14/14 passing
forge build
```

To redeploy the router yourself:

```bash
set -a; . ../.env.local; set +a
forge script script/DeployRouter.s.sol:DeployRouter \
  --rpc-url "$ARC_TESTNET_RPC_URL" --broadcast --slow
```

---

## Architecture, at a glance

```
                       Customer wallet (EOA)
                              │
            Connect ─────────►│
            EIP-2612 USDC permit (to Circle Paymaster)
                              │
                              ▼
           Kernel SCA (counterfactual)
                              │
                              ▼
           ERC-4337 UserOp ──► Pimlico bundler
                              │
                              ▼
    Circle Paymaster (on-chain) pays gas in ETH,
    pulls equivalent USDC from the SCA
                              │
                              ▼
    BlockPayRouter.pay(...) executes
        - protocol fee
        - optional marketplace splits
        - merchant residue
        - Settled event emitted with memoCid (IPFS receipt)
```

---

## Status

- Live on Arc Testnet (testnet only)
- 23 prerendered Next.js routes, 5 API endpoints
- 14/14 Solidity tests + 256-run fuzz invariant
- Submitting to Circle Developer Grant Program — Cohort 2, May 2026

External audit, Shopify App, WordPress plugin, Arc mainnet deploy are funded by the grant ask.

---

## License

Source code: MIT.
Trademark "BlockPay" and brand assets: all rights reserved.
