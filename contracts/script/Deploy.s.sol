// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {LeftoverEscrow} from "../src/LeftoverEscrow.sol";

/// @notice Deploy MockUSDC + LeftoverEscrow to any EVM chain.
///         Usage:
///           forge script script/Deploy.s.sol --rpc-url <RPC> --broadcast -vvvv
///         Env:
///           PRIVATE_KEY         deployer key (also becomes owner of both contracts)
///           VERIFIER_ADDRESS    (optional) AI verifier keeper address
contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address verifier = vm.envOr("VERIFIER_ADDRESS", address(0));

        vm.startBroadcast(deployerKey);

        MockUSDC usdc = new MockUSDC();
        LeftoverEscrow escrow = new LeftoverEscrow(usdc);
        if (verifier != address(0)) escrow.setVerifier(verifier);

        vm.stopBroadcast();

        console.log("MockUSDC deployed at:", address(usdc));
        console.log("LeftoverEscrow deployed at:", address(escrow));
        console.log("Verifier set to:", escrow.verifier());
    }
}
