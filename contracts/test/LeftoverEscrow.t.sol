// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {LeftoverEscrow} from "../src/LeftoverEscrow.sol";

contract LeftoverEscrowTest is Test {
    MockUSDC usdc;
    LeftoverEscrow escrow;

    address provider = makeAddr("provider");
    address tourist = makeAddr("tourist");
    address verifier = makeAddr("verifier");

    function setUp() public {
        usdc = new MockUSDC();
        escrow = new LeftoverEscrow(usdc);
        escrow.setVerifier(verifier);

        usdc.mint(provider, 1_000e6);
        vm.prank(provider);
        usdc.approve(address(escrow), type(uint256).max);
    }

    function testFullFlowRelease() public {
        vm.prank(provider);
        uint256 id = escrow.deposit(100e6);

        vm.prank(tourist);
        escrow.matchOffer(id);

        vm.prank(verifier);
        escrow.release(id, keccak256("receipt-proof"));

        assertEq(usdc.balanceOf(tourist), 100e6);
        assertEq(usdc.balanceOf(provider), 900e6);
        assertEq(uint256(escrow.getOffer(id).status), uint256(LeftoverEscrow.Status.Released));
    }

    function testRefundOnDoubtfulProof() public {
        vm.prank(provider);
        uint256 id = escrow.deposit(100e6);

        vm.prank(tourist);
        escrow.matchOffer(id);

        vm.prank(verifier);
        escrow.refund(id);

        assertEq(usdc.balanceOf(provider), 1_000e6);
        assertEq(uint256(escrow.getOffer(id).status), uint256(LeftoverEscrow.Status.Refunded));
    }

    function testCancelBeforeMatch() public {
        vm.prank(provider);
        uint256 id = escrow.deposit(100e6);

        vm.prank(provider);
        escrow.cancel(id);

        assertEq(usdc.balanceOf(provider), 1_000e6);
        assertEq(uint256(escrow.getOffer(id).status), uint256(LeftoverEscrow.Status.Cancelled));
    }

    function testOnlyVerifierCanRelease() public {
        vm.prank(provider);
        uint256 id = escrow.deposit(100e6);
        vm.prank(tourist);
        escrow.matchOffer(id);

        vm.prank(tourist);
        vm.expectRevert("not verifier");
        escrow.release(id, bytes32(0));
    }

    function testCannotMatchOwnOffer() public {
        vm.prank(provider);
        uint256 id = escrow.deposit(100e6);

        vm.prank(provider);
        vm.expectRevert("cannot match own offer");
        escrow.matchOffer(id);
    }
}
