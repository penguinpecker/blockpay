// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script, console2 } from "forge-std/Script.sol";
import { BlockPayRouter } from "../src/BlockPayRouter.sol";

/// @notice Operator-first deploy. Owner + feeRecipient = msg.sender (the
///         operator key). Multisig handoff happens as a later transferOwnership
///         + setFeeRecipient call, not at deploy time.
contract DeployRouter is Script {
    function run() external returns (BlockPayRouter router) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address operator = vm.addr(pk);

        // Initial fee: 50 bps (0.50%). Can be changed by owner later within MAX_FEE_BPS.
        uint16 initialFeeBps = 50;

        vm.startBroadcast(pk);
        router = new BlockPayRouter(operator, operator, initialFeeBps);
        vm.stopBroadcast();

        console2.log("BlockPayRouter deployed at:", address(router));
        console2.log("Owner / feeRecipient:", operator);
        console2.log("Initial feeBps:", initialFeeBps);
    }
}
