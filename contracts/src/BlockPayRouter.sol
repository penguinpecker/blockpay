// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable2Step, Ownable } from "@openzeppelin/contracts/access/Ownable2Step.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title  BlockPayRouter
/// @notice Stateless payment-settlement router. Pulls a stablecoin from the
///         payer, routes it to one or more recipients (merchant + optional
///         splits + optional protocol fee), and emits a settled event that
///         references an off-chain receipt CID.
///
///         Replay-protected per invoice. Pausable for emergency. Owner can
///         tune the protocol fee within a hard cap and rotate the fee
///         recipient. Funds never sit in this contract — every successful
///         pay() distributes the full amount atomically.
contract BlockPayRouter is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint16 public constant BPS_DENOMINATOR = 10_000;

    /// @notice Hard cap on owner-settable protocol fee, in basis points.
    ///         Owner cannot raise feeBps above this value. 200 = 2.00%.
    uint16 public constant MAX_FEE_BPS = 200;

    struct Split {
        address recipient;
        uint16 bps; // share of `amount` in basis points (out of 10_000)
    }

    struct PaymentParams {
        bytes32 invoiceId; // unique per invoice, used for replay protection
        IERC20 token; // payment token (USDC, EURC, etc.)
        uint256 amount; // gross amount paid by `payer`
        address merchant; // primary recipient (gets the residue after splits + fee)
        bytes32 memoCid; // off-chain receipt CID (e.g. IPFS), 32 bytes
        Split[] splits; // optional marketplace-style splits
    }

    uint16 public feeBps; // protocol fee, in bps (e.g. 50 = 0.50%)
    address public feeRecipient; // wallet that collects the protocol fee

    /// @dev invoiceId => true once paid. Prevents replays.
    mapping(bytes32 invoiceId => bool) public settled;

    event Settled(
        bytes32 indexed invoiceId,
        address indexed payer,
        address indexed merchant,
        address token,
        uint256 amount,
        uint256 feeAmount,
        bytes32 memoCid
    );
    event SplitPaid(bytes32 indexed invoiceId, address indexed recipient, uint256 amount);
    event FeeUpdated(uint16 oldBps, uint16 newBps);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);

    error AlreadySettled(bytes32 invoiceId);
    error InvalidMerchant();
    error InvalidAmount();
    error InvalidSplit();
    error SplitOverflow(uint256 totalBps);
    error InvalidFeeBps(uint16 bps);
    error InvalidFeeRecipient();

    constructor(address initialOwner, address initialFeeRecipient, uint16 initialFeeBps)
        Ownable(initialOwner)
    {
        if (initialFeeRecipient == address(0)) revert InvalidFeeRecipient();
        if (initialFeeBps > MAX_FEE_BPS) revert InvalidFeeBps(initialFeeBps);
        feeRecipient = initialFeeRecipient;
        feeBps = initialFeeBps;
    }

    /// @notice Settle a payment. Pulls `p.amount` of `p.token` from msg.sender
    ///         and distributes it to: optional protocol fee, optional splits,
    ///         and the merchant (residue).
    /// @dev    Reverts on replay, paused, zero merchant, zero amount, or any
    ///         single split with zero recipient / zero bps / total bps > 10_000.
    function pay(PaymentParams calldata p) external nonReentrant whenNotPaused {
        if (settled[p.invoiceId]) revert AlreadySettled(p.invoiceId);
        if (p.merchant == address(0)) revert InvalidMerchant();
        if (p.amount == 0) revert InvalidAmount();

        settled[p.invoiceId] = true;

        // --- Pull full gross amount into the router. We then push it out in
        //     the same tx, so the router never holds a balance across blocks.
        p.token.safeTransferFrom(msg.sender, address(this), p.amount);

        uint256 remaining = p.amount;

        // 1. Protocol fee (skip if feeBps == 0).
        uint256 feeAmount = 0;
        if (feeBps > 0) {
            feeAmount = (p.amount * feeBps) / BPS_DENOMINATOR;
            if (feeAmount > 0) {
                p.token.safeTransfer(feeRecipient, feeAmount);
                remaining -= feeAmount;
            }
        }

        // 2. Splits, if any. Each split takes its bps out of the GROSS amount.
        //    Sum of split bps must be <= 10_000 - feeBps. The merchant gets
        //    whatever is left after fee + splits.
        uint256 splitsBps = 0;
        uint256 splitCount = p.splits.length;
        for (uint256 i = 0; i < splitCount; ++i) {
            Split calldata s = p.splits[i];
            if (s.recipient == address(0) || s.bps == 0) revert InvalidSplit();
            splitsBps += s.bps;
            if (splitsBps + feeBps > BPS_DENOMINATOR) {
                revert SplitOverflow(splitsBps + feeBps);
            }
            uint256 share = (p.amount * s.bps) / BPS_DENOMINATOR;
            if (share > 0) {
                p.token.safeTransfer(s.recipient, share);
                remaining -= share;
                emit SplitPaid(p.invoiceId, s.recipient, share);
            }
        }

        // 3. Residue to merchant. Always sends >= 0; if zero (e.g. dust after
        //    100% splits) we skip the transfer to save gas.
        if (remaining > 0) {
            p.token.safeTransfer(p.merchant, remaining);
        }

        emit Settled(
            p.invoiceId,
            msg.sender,
            p.merchant,
            address(p.token),
            p.amount,
            feeAmount,
            p.memoCid
        );
    }

    // ---------- Owner-only admin ----------

    function setFeeBps(uint16 newBps) external onlyOwner {
        if (newBps > MAX_FEE_BPS) revert InvalidFeeBps(newBps);
        emit FeeUpdated(feeBps, newBps);
        feeBps = newBps;
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert InvalidFeeRecipient();
        emit FeeRecipientUpdated(feeRecipient, newRecipient);
        feeRecipient = newRecipient;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
