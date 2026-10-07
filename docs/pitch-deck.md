# Pitch Deck — LeftoverIce

13 slides max. Bahasa Indonesia + English mix is fine; keep English for the one-liner.

## 1. Cover
- Logo + **LeftoverIce** — "Turn leftover rupiah into USDC before you fly home."
- Track: Finance & Commerce (+ AI Agents). BNB Chain.

## 2. Problem — "Sisa rupiah, sia-sia."
- Leftover small notes & coins at the end of a trip.
- Money changers reject small amounts / bad airport rates.
- Too small to remit home profitably.
- (Flip side) Indonesian freelancers paid in USDC can't easily spend it as rupiah.
- One photo: wallet full of coins + a money changer sign.

## 3. Two complementary needs
- Tourist: has rupiah, wants USDC (keep it, or send home cheaply).
- Freelancer: has USDC, needs rupiah.
- Diagram: two arrows meeting in the middle.

## 4. The trust gap
- Rupiah is off-chain (QRIS / bank / cash). USDC is on-chain.
- Someone has to go first → counterparty risk.
- Old answer: licensed FX intermediary (slow, KYC, fees).

## 5. Our answer — AI-verified escrow
- Escrow on BNB Chain holds USDC.
- Off-chain rupiah payment + on-chain release, gated by AI verification.
- Diagram (mermaid from submission) — one slide.

## 6. Flow (6 steps)
1. Provider locks USDC → open offer.
2. Tourist matches.
3. Tourist pays rupiah (QRIS).
4. Tourist uploads proof.
5. AI verifies (confidence score).
6. Release → USDC in tourist's wallet. Low confidence → refund.

## 7. The AI layer
- Multilingual onboarding agent (EN / 中文 / 한국어 / …) — no crypto jargon.
- Proof verifier: `{ approved, confidence, reason }`.
- Anomaly detection: duplicate/reused proofs.

## 8. Why blockchain + AI?
- Blockchain: custody without a trusted middleman, state visible on BscScan.
- AI: settles the off-chain leg it can actually see (the receipt), at confidence levels a human can audit.

## 9. Demo screenshots
- 3–4 screens: provider lock → tourist match → QRIS payment → proof upload → released (with BscScan link).

## 10. Compliance & limits
- Rupiah = mandatory for domestic payments; FX = licensed (KUPVA).
- This is a testnet prototype with mock USDC → simulation.
- Production would add human review, reputation, duplicate detection.

## 11. Roadmap
- Two-way: merchants accept USDC, auto-convert to rupiah.
- Provider reputation from on-chain history.
- Map of nearby providers (warung, homestay, café) → onboard UMKM.

## 12. Team
- Names, roles (Smart Contract Dev, AI, Frontend, Product).

## 13. Thank you / demo link
- QR to GitHub + demo video + live dApp.
