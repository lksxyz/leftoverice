#!/usr/bin/env bash
# Deploy MockUSDC + LeftoverEscrow to BNB testnet (BSC Chapel or opBNB).
# Get test BNB from the faucet first, then:
#   RPC_URL=<rpc> PRIVATE_KEY=<deployer> VERIFIER_ADDRESS=<keeper> ./scripts/deploy-testnet.sh
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.foundry/bin:$PATH"

RPC_URL="${RPC_URL:-https://data-seed-prebsc-1-s1.bnbchain.org:8545}"
: "${PRIVATE_KEY:?set PRIVATE_KEY (deployer)}"

cd contracts
if [ -n "${VERIFIER_ADDRESS:-}" ]; then
  PRIVATE_KEY="$PRIVATE_KEY" VERIFIER_ADDRESS="$VERIFIER_ADDRESS" \
    forge script script/Deploy.s.sol --rpc-url "$RPC_URL" --broadcast -vvvv
else
  PRIVATE_KEY="$PRIVATE_KEY" \
    forge script script/Deploy.s.sol --rpc-url "$RPC_URL" --broadcast -vvvv
fi

echo
echo "Done. Copy the two addresses above into web/.env.local:"
echo "  NEXT_PUBLIC_RPC_URL=$RPC_URL"
echo "  NEXT_PUBLIC_USDC_ADDRESS=<MockUSDC address>"
echo "  NEXT_PUBLIC_ESCROW_ADDRESS=<LeftoverEscrow address>"
echo "  NEXT_PUBLIC_EXPLORER_URL=https://testnet.bscscan.com"
echo "  RPC_URL=$RPC_URL"
echo "  ESCROW_ADDRESS=<LeftoverEscrow address>"
echo "  VERIFIER_KEY=<keeper private key>"
