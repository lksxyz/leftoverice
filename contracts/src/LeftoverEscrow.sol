// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "./interfaces/IERC20.sol";

/// @title LeftoverEscrow
/// @notice Escrow that holds USDC locked by a liquidity provider and releases it to a
///         tourist once an off-chain AI verifier confirms the rupiah payment.
///         The rupiah leg happens off-chain (QRIS / bank transfer / cash); the USDC leg
///         is settled on-chain by the verifier. Demo / prototype only.
contract LeftoverEscrow {
    enum Status { Open, Matched, Released, Refunded, Cancelled }

    struct Offer {
        address provider;
        address buyer;
        uint256 amount;
        Status status;
        uint256 createdAt;
        uint256 matchedAt;
        bytes32 proofHash;
    }

    IERC20 public immutable usdc;
    address public owner;
    address public verifier; // AI oracle / keeper that releases or refunds

    uint256 public offerCount;
    mapping(uint256 => Offer) private _offers;

    event OfferCreated(uint256 indexed offerId, address indexed provider, uint256 amount);
    event OfferMatched(uint256 indexed offerId, address indexed buyer);
    event Released(uint256 indexed offerId, address indexed buyer, uint256 amount, bytes32 proofHash);
    event Refunded(uint256 indexed offerId, address indexed provider, uint256 amount);
    event Cancelled(uint256 indexed offerId, address indexed provider);

    constructor(IERC20 _usdc) {
        usdc = _usdc;
        owner = msg.sender;
        verifier = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyVerifier() {
        require(msg.sender == verifier, "not verifier");
        _;
    }

    function setVerifier(address _v) external onlyOwner {
        require(_v != address(0), "zero address");
        verifier = _v;
    }

    /// Provider locks USDC and opens an offer.
    function deposit(uint256 amount) external returns (uint256 offerId) {
        require(amount > 0, "zero amount");
        require(usdc.transferFrom(msg.sender, address(this), amount), "transfer failed");

        offerId = ++offerCount;
        _offers[offerId] = Offer({
            provider: msg.sender,
            buyer: address(0),
            amount: amount,
            status: Status.Open,
            createdAt: block.timestamp,
            matchedAt: 0,
            proofHash: bytes32(0)
        });
        emit OfferCreated(offerId, msg.sender, amount);
    }

    /// Tourist matches an open offer.
    function matchOffer(uint256 offerId) external {
        Offer storage o = _offers[offerId];
        require(o.status == Status.Open, "not open");
        require(o.provider != msg.sender, "cannot match own offer");
        o.buyer = msg.sender;
        o.status = Status.Matched;
        o.matchedAt = block.timestamp;
        emit OfferMatched(offerId, msg.sender);
    }

    /// AI verifier confirms the rupiah payment and releases USDC to the tourist.
    function release(uint256 offerId, bytes32 proofHash) external onlyVerifier {
        Offer storage o = _offers[offerId];
        require(o.status == Status.Matched, "not matched");
        o.status = Status.Released;
        o.proofHash = proofHash;
        require(usdc.transfer(o.buyer, o.amount), "transfer failed");
        emit Released(offerId, o.buyer, o.amount, proofHash);
    }

    /// AI verifier rejects a doubtful payment and returns USDC to the provider.
    function refund(uint256 offerId) external onlyVerifier {
        Offer storage o = _offers[offerId];
        require(o.status == Status.Matched, "not matched");
        o.status = Status.Refunded;
        require(usdc.transfer(o.provider, o.amount), "transfer failed");
        emit Refunded(offerId, o.provider, o.amount);
    }

    /// Provider cancels an offer that no one has matched yet.
    function cancel(uint256 offerId) external {
        Offer storage o = _offers[offerId];
        require(o.status == Status.Open, "not open");
        require(o.provider == msg.sender, "not provider");
        o.status = Status.Cancelled;
        require(usdc.transfer(o.provider, o.amount), "transfer failed");
        emit Cancelled(offerId, msg.sender);
    }

    /// Named struct access (friendlier for UIs than the raw mapping getter).
    function getOffer(uint256 offerId) external view returns (Offer memory) {
        return _offers[offerId];
    }

    /// List ids of offers still open (capped for gas safety).
    function getOpenOffers() external view returns (uint256[] memory ids) {
        uint256 count;
        for (uint256 i = 1; i <= offerCount && i <= 100; i++) {
            if (_offers[i].status == Status.Open) count++;
        }
        ids = new uint256[](count);
        uint256 j;
        for (uint256 i = 1; i <= offerCount && i <= 100; i++) {
            if (_offers[i].status == Status.Open) ids[j++] = i;
        }
    }
}
