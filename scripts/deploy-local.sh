#!/usr/bin/env bash
# Local demo: anvil + deploy + seed + write web/.env.local.
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.foundry/bin:$PATH"

RPC="http://127.0.0.1:8545"
ACCT0_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
VERIFIER_ADDR="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
VERIFIER_KEY="0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"

if ! curl -s -X POST "$RPC" -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' >/dev/null 2>&1; then
  anvil --chain-id 31337 >/tmp/leftoverice-anvil.log 2>&1 &
  echo "anvil started (pid $!)"
  for _ in $(seq 1 40); do
    curl -s -X POST "$RPC" -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' >/dev/null 2>&1 && break
    sleep 0.3
  done
fi

cd contracts
PRIVATE_KEY="$ACCT0_KEY" VERIFIER_ADDRESS="$VERIFIER_ADDR" \
  forge script script/Deploy.s.sol --rpc-url "$RPC" --broadcast --quiet

USDC_ADDRESS=$(node -e 'const j=require("./broadcast/Deploy.s.sol/31337/run-latest.json"); console.log(j.transactions.find(t=>t.contractName==="MockUSDC").contractAddress)')
ESCROW_ADDRESS=$(node -e 'const j=require("./broadcast/Deploy.s.sol/31337/run-latest.json"); console.log(j.transactions.find(t=>t.contractName==="LeftoverEscrow").contractAddress)')

USDC_ADDRESS="$USDC_ADDRESS" ESCROW_ADDRESS="$ESCROW_ADDRESS" PRIVATE_KEY="$ACCT0_KEY" \
  forge script script/Seed.s.sol --rpc-url "$RPC" --broadcast --quiet
cd ..

cat > web/.env.local <<EOF
NEXT_PUBLIC_RPC_URL=$RPC
NEXT_PUBLIC_USDC_ADDRESS=$USDC_ADDRESS
NEXT_PUBLIC_ESCROW_ADDRESS=$ESCROW_ADDRESS
NEXT_PUBLIC_EXPLORER_URL=
RPC_URL=$RPC
ESCROW_ADDRESS=$ESCROW_ADDRESS
VERIFIER_KEY=$VERIFIER_KEY
EOF

echo "USDC=$USDC_ADDRESS"
echo "ESCROW=$ESCROW_ADDRESS"
echo "web/.env.local written. Next: cd web && npm run dev"
