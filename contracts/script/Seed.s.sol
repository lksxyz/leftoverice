// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {LeftoverEscrow} from "../src/LeftoverEscrow.sol";

/// @notice Seeds a LOCAL anvil chain with demo liquidity providers.
///         WARNING: uses well-known anvil dev private keys — dev only, never mainnet.
///         Usage (after Deploy):
///           USDC_ADDRESS=... ESCROW_ADDRESS=... PRIVATE_KEY=<anvil acct0 key> \
///             forge script script/Seed.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
contract Seed is Script {
    address[3] providers = [
        0x70997970C51812dc3A010C7d01b50e0d17dc79C8, // anvil account 1
        0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, // anvil account 2
        0x90F79bf6EB2c4f870365E785982E1f101E93b906  // anvil account 3
    ];

    uint256[3] keys = [
        0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d,
        0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a,
        0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
    ];

    function run() external {
        MockUSDC usdc = MockUSDC(vm.envAddress("USDC_ADDRESS"));
        LeftoverEscrow escrow = LeftoverEscrow(vm.envAddress("ESCROW_ADDRESS"));
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);
        for (uint256 i = 0; i < providers.length; i++) {
            usdc.mint(providers[i], 10_000e6); // 10,000 USDC each
        }
        vm.stopBroadcast();

        for (uint256 i = 0; i < providers.length; i++) {
            vm.startBroadcast(keys[i]);
            usdc.approve(address(escrow), type(uint256).max);
            escrow.deposit(1_000e6); // 1,000 USDC offer each
            vm.stopBroadcast();
            console.log("Provider", providers[i], "opened a 1,000 USDC offer");
        }
    }
}
