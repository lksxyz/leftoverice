# Demo Video Script (≈ 2 min)

Goal: show the full loop — provider locks USDC → tourist matches → pays rupiah (QRIS) → uploads proof → AI verifies → USDC released — with the transaction visible on a block explorer.

## Setup (before recording)
- Run the local demo (anvil + deploy + seed) **or** the testnet deployment.
- Open the app in a mobile-width viewport (DevTools device mode, e.g. iPhone).
- Have a block explorer tab ready (BscScan for testnet, or the anvil/local explorer).

## Beats

**0:00–0:10 — Hook**
> "Leaving Indonesia with leftover rupiah? Meet LeftoverIce — turn it into USDC in minutes, verified by AI, settled on BNB Chain."

**0:10–0:30 — Provider side (freelancer)**
- Show provider screen: "I have USDC, I want rupiah."
- Tap "Lock USDC" → enter amount (e.g. 1,000 USDC) → confirm.
- Show the tx on the block explorer briefly (offer created, USDC now in escrow).

**0:30–1:05 — Tourist side**
- Switch to tourist screen: "I have rupiah, I want USDC."
- Enter leftover amount: "450,000 IDR".
- Show quote: "≈ 27.5 USDC" (with spread) and the list of nearby providers.
- Pick the provider → "Match" → confirm (offer becomes Matched).

**1:05–1:35 — Payment + proof**
- Show the QRIS screen: "Pay 450,000 IDR via QRIS".
- (Simulated) scan/pay.
- "Upload proof" → pick the receipt image.

**1:35–1:50 — AI verification + release**
- Show the AI verifier running: "Verifying amount, recipient, timestamp… confidence 98%".
- "Payment verified — releasing USDC."
- Show the release tx on the block explorer + the tourist's wallet balance +27.5 USDC.

**1:50–2:00 — Close**
- "Escrow on BNB Chain. AI settles the off-chain leg. No crypto jargon for the tourist."
- QR / links overlay: GitHub + demo URL.

## Notes
- Keep it in one language for clarity (English recommended; subtitle if mixed).
- The "confidence 98%" + on-chain `proofHash` is the money shot — hold on it.
