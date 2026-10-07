# Submission — LeftoverIce

## Project Name
LeftoverIce

## Tagline
Turn leftover rupiah into USDC before you fly home.

## Track
Finance & Commerce (primary) · AI Agents (secondary)

## Problem Statement
Crypto nomads and backpackers leaving Indonesia end up with leftover rupiah — small notes and coins that money changers reject or convert at poor airport rates, and amounts too small to remit home profitably through a bank. In parallel, Indonesian freelancers paid in USDC struggle to convert it into rupiah for daily life.

The two needs are complementary, but a peer-to-peer swap crosses the on-chain/off-chain boundary: the rupiah leg is paid via QRIS, bank transfer, or cash, while the USDC leg settles on-chain. Without a trust layer, one side must go first and risk losing money. Existing solutions either require a licensed FX intermediary or leave counterparty risk to the users.

## Solution
LeftoverIce is a mobile-first P2P marketplace on BNB Chain:

1. A **provider** (freelancer holding USDC) locks USDC into an escrow contract, creating an open offer.
2. A **tourist** selects an offer and pays the provider in rupiah off-chain (QRIS / bank / cash).
3. The tourist uploads proof of payment.
4. An **AI verifier** inspects the proof — amount, recipient, timestamp — and returns a yes/no decision with a confidence score.
5. High confidence → the AI verifier signs an on-chain `release`, moving USDC to the tourist's wallet. Low confidence → `refund`/dispute, keeping the USDC locked.
6. A multilingual AI agent onboards tourists in their own language and guides them through wallet creation and the flow, so no crypto expertise is required.

This turns a manual, trust-heavy swap into a verifiable, non-custodial escrow where the AI is the settlement oracle, and every state change is visible on BscScan.

## Project Detail

### How the escrow works
The `LeftoverEscrow` contract holds `MockUSDC` (a 6-decimal ERC-20 mock). Offers have an explicit state machine — `Open → Matched → Released | Refunded | Cancelled` — and a `verifier` role (the AI oracle) that is the only address able to `release` or `refund` a matched offer. Each `release` records a `proofHash` on-chain, leaving an audit trail of the AI decision.

### The AI layer
- **Multilingual onboarding agent** — explains the flow in the tourist's language (EN / 中文 / 한국어 / …), generates a wallet, and finds nearby providers.
- **Proof-of-payment verifier** — reads a receipt photo or transfer screenshot and returns structured JSON: `{ approved, confidence, reason }`. High confidence triggers automatic release; low confidence escalates to a human or routes to refund.
- **Anomaly detection** — flags duplicate or reused proofs and suspicious patterns across accounts.

### Architecture
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

### Tech stack

| Layer | Technology |
|-------|-----------|
| Smart contract | Solidity 0.8 (Foundry), MockUSDC + LeftoverEscrow |
| Chain | BNB Smart Chain / opBNB testnet |
| Frontend | Next.js (App Router) + shadcn/ui (mobile-first) + ethers |
| AI | Multilingual agent + proof verifier (LLM, JSON + confidence) |

### Key features
- Non-custodial escrow with an explicit state machine.
- AI as settlement oracle with on-chain audit trail (`proofHash`).
- Mobile-first, wallet-friendly UX for non-crypto-native tourists.
- Multilingual onboarding agent.
- Every step visible on a block explorer.

### Compliance note
Indonesian regulation requires rupiah for domestic payments and licenses FX exchange (KUPVA). LeftoverIce is a **testnet prototype** using a mock token; it is presented as a simulation, not a payment or exchange service.

## Contract Address
*(filled after deployment)*

## Network
*(opBNB testnet / BSC testnet)*

## Links
- GitHub: *(filled)*
- Demo video: *(filled)*
- Pitch deck: *(filled)*
