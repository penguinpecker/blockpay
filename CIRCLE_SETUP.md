# Circle Developer Console setup for BlockPay

Step-by-step. Each step copies a value into `.env.local` — that file is gitignored, never commit.

## 1. Account + sandbox app (5 min)

1. Sign up at https://console.circle.com (or sign in if you already have an account).
2. **Top-right org switcher** → choose or create an org for BlockPay.
3. Left sidebar → **Developer** → **API Keys**.
4. Click **Create Key**, scope `developer-controlled wallets + Paymaster`, env `Sandbox` first. Name it `blockpay-sandbox`.
5. Copy the key value into `.env.local`:
   ```
   CIRCLE_API_KEY=
   ```
6. Same screen → **Entity Secret** → click **Generate**, copy the ciphertext into:
   ```
   CIRCLE_ENTITY_SECRET=
   ```

> Important: the Entity Secret is the master credential for your wallets. Never paste it into committed files, never log it. If it leaks, rotate immediately.

## 2. Gas Station policy per chain (was "Paymaster" in older docs)

The Gas Station URL is per chain. We're targeting Arc testnet for the demo.

1. Sidebar → **Web3 Services → Gas Station** → **Create Policy**.
2. For **Arc testnet**:
   - Network: Arc Testnet
   - Sponsorship type: **Pay with USDC** (the customer pays gas in USDC, Circle Paymaster fronts the native gas)
   - Spending cap: $50 / day (raise later)
   - Whitelist contract addresses (optional): paste `0x50a2a3684F1df4db9A58C21febaf23D6b7DC8B2F` (your deployed BlockPayRouter). This limits sponsorship to BlockPay payments only.
   - Save → copy the **Paymaster URL** into:
     ```
     NEXT_PUBLIC_CIRCLE_PAYMASTER_URL_ARC_TESTNET=
     ```
3. Same Paymaster section → copy your **Policy ID** into:
   ```
   CIRCLE_PAYMASTER_POLICY_ID=
   ```

## 3. Bundler

ERC-4337 needs a bundler to submit UserOps. You have two options:

**Option A — Pimlico (free dev tier, easiest):**
1. Sign up at https://dashboard.pimlico.io
2. Create an API key
3. Bundler URL:
   ```
   NEXT_PUBLIC_BUNDLER_URL_ARC_TESTNET=https://api.pimlico.io/v2/5042002/rpc?apikey=YOURKEY
   ```
   (Pimlico may not support Arc yet — check the chain list. If not, ask Circle support for the Arc bundler URL — it's typically bundled with the Paymaster on Arc.)

**Option B — Circle's bundled bundler (if your Paymaster policy includes one):**
1. Look at the same Paymaster screen — there's usually a "Bundler URL" shown alongside the Paymaster URL.
2. Paste both URLs above accordingly.

## 4. Compliance Engine (optional, for production)

Only needed when you start handling real merchant volume.

1. Sidebar → **Compliance Engine** → request access (some orgs need approval).
2. When granted, create an API key, paste into:
   ```
   CIRCLE_COMPLIANCE_API_KEY=
   ```

## 5. Verify

```bash
cd ~/Projects/blockpay
npx tsx scripts/check-wallet.ts   # confirms RPC + balance still good
npm run dev                        # starts the local site
# open http://localhost:3000/embed/preview
# pick "Arc" pill, connect wallet — gasless path activates automatically
# because lib/paymaster.ts:paymasterAvailable() now returns true.
```

If `NEXT_PUBLIC_CIRCLE_PAYMASTER_URL_*` and `NEXT_PUBLIC_BUNDLER_URL_*` are both set for a chain, the checkout uses the Paymaster (gasless USDC) path. If either is missing, it falls back to the regular EOA approve + pay flow that's already live.

## 6. Production hardening (before mainnet)

- Rotate `CIRCLE_API_KEY` to a production-environment key (separate from sandbox).
- Lock the Paymaster policy whitelist to mainnet `BlockPayRouter` address (set after mainnet deploy).
- Set conservative spending caps until volume is proven.
- Move all `CIRCLE_*` server-only keys into Vercel encrypted env vars, never into client bundles.

## Quick reference — what each var unlocks

| Env var | What it powers |
|---|---|
| `CIRCLE_API_KEY` | Server-side wallet ops, invoice creation, webhook delivery |
| `CIRCLE_ENTITY_SECRET` | Decrypting / signing for developer-controlled wallets |
| `NEXT_PUBLIC_CIRCLE_PAYMASTER_URL_*` | Gasless USDC checkout per chain |
| `NEXT_PUBLIC_BUNDLER_URL_*` | ERC-4337 UserOp submission per chain |
| `CIRCLE_PAYMASTER_POLICY_ID` | Server-side policy management (raising caps, etc.) |
| `CIRCLE_COMPLIANCE_API_KEY` | Pre-transfer sanctions screening |
