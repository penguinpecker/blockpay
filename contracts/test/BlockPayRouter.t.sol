// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { BlockPayRouter } from "../src/BlockPayRouter.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract BlockPayRouterTest is Test {
    BlockPayRouter internal router;
    MockUSDC internal usdc;

    address internal owner       = makeAddr("owner");
    address internal feeRecipient = makeAddr("feeRecipient");
    address internal merchant    = makeAddr("merchant");
    address internal payer       = makeAddr("payer");

    bytes32 internal constant INVOICE = bytes32(uint256(0xCAFE));
    bytes32 internal constant CID     = bytes32(uint256(0xABCD));

    function setUp() public {
        usdc = new MockUSDC();
        router = new BlockPayRouter(owner, feeRecipient, 50); // 0.50%
        usdc.mint(payer, 1_000_000e6);
        vm.prank(payer);
        usdc.approve(address(router), type(uint256).max);
    }

    function _params(uint256 amount, BlockPayRouter.Split[] memory splits)
        internal
        view
        returns (BlockPayRouter.PaymentParams memory p)
    {
        p.invoiceId = INVOICE;
        p.token     = usdc;
        p.amount    = amount;
        p.merchant  = merchant;
        p.memoCid   = CID;
        p.splits    = splits;
    }

    // -------- Happy path --------

    function test_pay_singleRecipient_no_splits_with_fee() public {
        BlockPayRouter.Split[] memory empty = new BlockPayRouter.Split[](0);

        vm.prank(payer);
        router.pay(_params(100e6, empty));

        assertEq(usdc.balanceOf(feeRecipient), 0.5e6, "fee 0.5%");
        assertEq(usdc.balanceOf(merchant),   99.5e6, "merchant net");
        assertEq(usdc.balanceOf(address(router)), 0,  "no dust");
        assertTrue(router.settled(INVOICE));
    }

    function test_pay_with_marketplace_splits() public {
        BlockPayRouter.Split[] memory splits = new BlockPayRouter.Split[](2);
        splits[0] = BlockPayRouter.Split({ recipient: makeAddr("aff"), bps: 1000 }); // 10%
        splits[1] = BlockPayRouter.Split({ recipient: makeAddr("partner"), bps: 500 }); // 5%

        vm.prank(payer);
        router.pay(_params(100e6, splits));

        assertEq(usdc.balanceOf(feeRecipient),        0.5e6,  "fee 0.5%");
        assertEq(usdc.balanceOf(splits[0].recipient), 10e6,   "aff 10%");
        assertEq(usdc.balanceOf(splits[1].recipient), 5e6,    "partner 5%");
        assertEq(usdc.balanceOf(merchant),            84.5e6, "merchant residue");
        assertEq(usdc.balanceOf(address(router)),     0,      "no dust");
    }

    function test_pay_zero_fee() public {
        vm.prank(owner);
        router.setFeeBps(0);

        BlockPayRouter.Split[] memory empty = new BlockPayRouter.Split[](0);
        vm.prank(payer);
        router.pay(_params(100e6, empty));

        assertEq(usdc.balanceOf(feeRecipient), 0);
        assertEq(usdc.balanceOf(merchant),     100e6);
    }

    // -------- Replay protection --------

    function test_replayReverts() public {
        BlockPayRouter.Split[] memory empty = new BlockPayRouter.Split[](0);
        vm.prank(payer);
        router.pay(_params(10e6, empty));

        vm.expectRevert(abi.encodeWithSelector(BlockPayRouter.AlreadySettled.selector, INVOICE));
        vm.prank(payer);
        router.pay(_params(10e6, empty));
    }

    // -------- Validation --------

    function test_zeroMerchant_reverts() public {
        BlockPayRouter.Split[] memory empty = new BlockPayRouter.Split[](0);
        BlockPayRouter.PaymentParams memory p = _params(10e6, empty);
        p.merchant = address(0);

        vm.expectRevert(BlockPayRouter.InvalidMerchant.selector);
        vm.prank(payer);
        router.pay(p);
    }

    function test_zeroAmount_reverts() public {
        BlockPayRouter.Split[] memory empty = new BlockPayRouter.Split[](0);
        vm.expectRevert(BlockPayRouter.InvalidAmount.selector);
        vm.prank(payer);
        router.pay(_params(0, empty));
    }

    function test_split_zeroAddress_reverts() public {
        BlockPayRouter.Split[] memory splits = new BlockPayRouter.Split[](1);
        splits[0] = BlockPayRouter.Split({ recipient: address(0), bps: 100 });

        vm.expectRevert(BlockPayRouter.InvalidSplit.selector);
        vm.prank(payer);
        router.pay(_params(10e6, splits));
    }

    function test_split_zeroBps_reverts() public {
        BlockPayRouter.Split[] memory splits = new BlockPayRouter.Split[](1);
        splits[0] = BlockPayRouter.Split({ recipient: makeAddr("x"), bps: 0 });

        vm.expectRevert(BlockPayRouter.InvalidSplit.selector);
        vm.prank(payer);
        router.pay(_params(10e6, splits));
    }

    function test_split_overflow_reverts() public {
        // feeBps = 50 (0.5%), so split bps may not exceed 9950.
        BlockPayRouter.Split[] memory splits = new BlockPayRouter.Split[](1);
        splits[0] = BlockPayRouter.Split({ recipient: makeAddr("x"), bps: 9951 });

        vm.expectRevert(
            abi.encodeWithSelector(BlockPayRouter.SplitOverflow.selector, 9951 + 50)
        );
        vm.prank(payer);
        router.pay(_params(100e6, splits));
    }

    // -------- Admin --------

    function test_setFeeBps_capped() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(BlockPayRouter.InvalidFeeBps.selector, 201));
        router.setFeeBps(201);

        vm.prank(owner);
        router.setFeeBps(150);
        assertEq(router.feeBps(), 150);
    }

    function test_setFeeRecipient_rejectsZero() public {
        vm.prank(owner);
        vm.expectRevert(BlockPayRouter.InvalidFeeRecipient.selector);
        router.setFeeRecipient(address(0));
    }

    function test_pause_blocksPay() public {
        vm.prank(owner);
        router.pause();

        BlockPayRouter.Split[] memory empty = new BlockPayRouter.Split[](0);
        vm.expectRevert(); // OZ Pausable: EnforcedPause
        vm.prank(payer);
        router.pay(_params(10e6, empty));

        vm.prank(owner);
        router.unpause();

        vm.prank(payer);
        router.pay(_params(10e6, empty)); // succeeds
    }

    function test_nonOwner_admin_reverts() public {
        vm.expectRevert();
        router.setFeeBps(100);

        vm.expectRevert();
        router.pause();
    }

    // -------- Fuzz --------

    function testFuzz_pay_no_dust(uint256 amount, uint16 bps) public {
        amount = bound(amount, 1, 1_000_000e6);
        bps = uint16(bound(uint256(bps), 0, 200));

        vm.prank(owner);
        router.setFeeBps(bps);

        BlockPayRouter.Split[] memory empty = new BlockPayRouter.Split[](0);
        vm.prank(payer);
        router.pay(_params(amount, empty));

        uint256 fee = (amount * bps) / 10_000;
        assertEq(usdc.balanceOf(feeRecipient),    fee);
        assertEq(usdc.balanceOf(merchant),        amount - fee);
        assertEq(usdc.balanceOf(address(router)), 0);
    }
}
