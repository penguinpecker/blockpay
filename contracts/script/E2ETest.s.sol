// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script, console2 } from "forge-std/Script.sol";
import { BlockPayRouter } from "../src/BlockPayRouter.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestUSDC is ERC20 {
    constructor() ERC20("BlockPay Test USDC", "tUSDC") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

/// @notice Live integration test on the deployed BlockPayRouter.
///         Deploys a Test USDC, mints to the operator, approves the router,
///         calls pay() with a single recipient, and asserts on the resulting
///         balances. Fails the broadcast if anything is off.
contract E2ETest is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address operator = vm.addr(pk);
        address router = vm.envAddress("ROUTER_ADDRESS");
        address merchant = address(uint160(uint256(keccak256("blockpay.e2e.merchant"))));

        vm.startBroadcast(pk);

        TestUSDC usdc = new TestUSDC();
        usdc.mint(operator, 1_000e6); // 1,000 tUSDC
        usdc.approve(router, type(uint256).max);

        BlockPayRouter.Split[] memory empty = new BlockPayRouter.Split[](0);
        BlockPayRouter.PaymentParams memory p = BlockPayRouter.PaymentParams({
            invoiceId: keccak256(abi.encodePacked("blockpay-e2e-1", block.timestamp)),
            token:     usdc,
            amount:    100e6, // 100 tUSDC
            merchant:  merchant,
            memoCid:   keccak256("ipfs://placeholder-cid-for-e2e-receipt"),
            splits:    empty
        });
        BlockPayRouter(router).pay(p);

        vm.stopBroadcast();

        // Post-conditions
        uint256 feeBal      = usdc.balanceOf(operator); // operator is feeRecipient
        uint256 merchantBal = usdc.balanceOf(merchant);
        uint256 routerBal   = usdc.balanceOf(router);

        console2.log("---");
        console2.log("Test USDC      :", address(usdc));
        console2.log("Merchant       :", merchant);
        console2.log("feeRecipient($):", feeBal,      "(expected 999_500_000 = 900 mint residue + 0.5 fee)");
        console2.log("merchant    ($):", merchantBal, "(expected   99_500_000 = 99.5 tUSDC)");
        console2.log("router      ($):", routerBal,   "(expected            0)");

        require(merchantBal == 99.5e6, "merchant balance wrong");
        require(routerBal   == 0,      "router holds dust");
        console2.log("PASS");
    }
}
