# BlockPayRouter — internal review pass

**Reviewer:** internal (pre-external-audit)
**Commit-equivalent:** working tree at `~/Projects/blockpay/contracts` as of 2026-05-15
**Scope:** `src/BlockPayRouter.sol`
**Status:** No high-severity findings. Three low/info notes below.

## Design summary

Stateless payment-settlement router. Pulls ERC-20 (USDC/EURC) from a payer,
splits it atomically between protocol fee, optional Split[] recipients, and the
merchant residue. Funds never persist in the contract across a transaction.
Replay-protected per invoice. Two-step ownable, pausable, reentrancy-guarded.

## Verified properties

| Property | How verified |
|---|---|
| No dust ever remains in the router | Foundry fuzz `testFuzz_pay_no_dust` (256 runs) + live e2e on Arc testnet |
| Replay rejected after first settle | `test_replayReverts` + on-chain `settled` mapping read-back |
| `feeBps` never exceeds `MAX_FEE_BPS = 200` | `setFeeBps` revert path + constructor guard |
| `feeRecipient` cannot be zero | constructor + setter guards |
| `pause()` blocks `pay()` | `test_pause_blocksPay` |
| Only owner can mutate fee/recipient/pause | `test_nonOwner_admin_reverts` |
| Split share with zero recipient or zero bps reverts | `test_split_zeroAddress_reverts`, `test_split_zeroBps_reverts` |
| Sum of (fee + splits) bps cannot exceed 10000 | `test_split_overflow_reverts` |

## Notes / future work

### L-01  No allowance reset suggested for fee-on-transfer tokens
The current `pay()` uses `safeTransferFrom(payer → router)` then `safeTransfer(router → recipients)`. For USDC and EURC this is fine. If we ever accept a fee-on-transfer token (we don't plan to), the router would receive less than `p.amount` and the subsequent transfers could revert or under-pay. Acceptable for now since the token allowlist is implicit (USDC/EURC), but worth a docstring before opening to arbitrary tokens.

**Action:** add a comment in the contract; revisit when Bridge Kit integration introduces non-USDC tokens.

### L-02  No on-chain merchant allowlist
Anyone can call `pay()` with any `merchant` address. That's by design — the merchant address is whatever the integrator embedded in the invoice. The off-chain invoice service signs the invoice, but the contract does not verify the signature. This is fine for v1 because the only attack is *paying* someone — there's no theft vector. The "wrong merchant" risk is on the integrator side.

**Action:** none; documented behavior. Will revisit if/when we add merchant-side signing.

### I-01  `memoCid` is `bytes32`, not full CID
We store an IPFS CID's 32-byte multihash. For CIDv1 (most modern) this matches the SHA-256 digest, but the codec/version prefix bytes are dropped. The frontend reconstructs the full CID by assuming `f01551220` (raw + sha256) prefix. If we ever need other codecs, store the full CID off-chain and use `memoCid` as the receipt service's primary key instead.

**Action:** none until we onboard non-default codecs.

## External audit prep

When we go to external audit:
1. Freeze the contract version (tag commit, no further changes).
2. Provide this REVIEW.md as the kickoff document.
3. Pre-fund: 0.5 ETH on Mainnet for audit-reviewer deploys.
4. Suggested auditors based on scope: Spearbit (solo Solidity), Cantina (competitive), or Code4rena (contest). For a single-contract router at this size, ~$15-25K range.

## Mainnet readiness checklist

- [x] Tests passing (14/14, fuzz 256 runs)
- [x] Deployed and tested on Arc testnet (previously also deployed on Base Sepolia — historical record at `contracts/deployments/base-sepolia.json`)
- [x] Live `pay()` exercised end-to-end on Arc testnet
- [ ] External audit
- [ ] Arc explorer / Etherscan source verification (needs API keys)
- [ ] Multisig deployer ready (Safe) — operator-first deploy, multisig handoff at the very end
- [ ] Bug bounty program (Immunefi or similar) at mainnet launch
