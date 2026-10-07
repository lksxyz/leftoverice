# LeftoverIce

Turn leftover rupiah into USDC before you fly home — a mobile-first peer-to-peer swap on **BNB Chain**, with **AI-verified off-chain payment** and **on-chain escrow release**.

Built for **Indonesia Web3 Hackathon 2026** · Track: **Finance & Commerce** (+ **AI Agents**) · Built on BNB Chain · Mentored by Dev Web3 Jogja.

> Prototype / simulation only. Uses a mock USDC on BNB testnet. Not a licensed money-exchange service.

## Problem

Crypto nomads and backpackers leave Indonesia with leftover rupiah — small notes and coins that money changers reject or convert at terrible airport rates, and amounts too small to remit home profitably through a bank.

At the same time, Indonesian freelancers paid in USDC struggle to convert it into rupiah for daily life.

The rupiah leg of a swap happens off-chain (QRIS / bank transfer / cash), while the USDC leg is on-chain. That creates a trust gap: who releases the USDC, and when?

## Solution

1. A **provider** (freelancer holding USDC) locks USDC into the escrow contract → an open offer.
2. A **tourist** picks an offer and pays the provider in rupiah off-chain.
3. The tourist uploads proof of payment.
4. An **AI verifier** inspects the proof (amount, recipient, time) and returns a confidence score.
5. High confidence → the AI signs the on-chain `release`, and USDC flows to the tourist's wallet. Low confidence → `refund` / dispute, USDC stays locked.
6. A multilingual AI agent onboards tourists in their own language (EN / 中文 / 한국어 / …) and walks them through wallet + flow — no crypto jargon.

## Monorepo layout

```
contracts/   Solidity (Foundry): MockUSDC (ERC-20) + LeftoverEscrow
web/         Next.js + shadcn/ui (mobile-first) + ethers
docs/        Submission text, pitch deck, demo script
```

## Quickstart

Requires Node 22+, Foundry (`foundryup`), npm.

```bash
# 1. clone with the forge-std submodule
git clone --recurse-submodules https://github.com/lksxyz/leftoverice
cd leftoverice

# 2. contracts
cd contracts
forge build && forge test

# 3. web (install from the repo root — npm workspace)
cd ..
npm install
npm run dev                          # http://localhost:3000

# 4. local chain + demo data (anvil dev keys — never mainnet)
bash scripts/deploy-local.sh
```

## Contracts

| Contract | Role |
|----------|------|
| `MockUSDC` | ERC-20 mock of USDC (6 decimals), mintable by owner |
| `LeftoverEscrow` | Locks USDC, matches tourist↔provider, `release`/`refund` by an AI verifier |

## Architecture

```mermaid
flowchart LR
  P[Provider / freelancer] -->|1. lock USDC| E[(LeftoverEscrow)]
  T[Tourist / nomad] -->|2. pick offer| W[Web app]
  W -->|3. matchOffer| E
  T -->|4. pay rupiah (QRIS/bank/cash)| P
  T -->|5. upload proof| W
  W -->|6. verify| AI[AI verifier]
  AI -->|7a. high confidence: release| E
  E -->|8. USDC| T
  AI -.->|7b. low confidence: refund/dispute| E
  E -.->|refund| P
```

## Disclaimers

- Indonesian law requires rupiah for domestic payments and licenses FX exchange (KUPVA). This is a **testnet prototype** with a mock token; it is not a payment or exchange service.
- The AI verifier is an off-chain oracle. A production system would add human-in-the-loop review, provider reputation, and duplicate-proof detection.
