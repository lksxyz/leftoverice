#!/usr/bin/env bash
# One-command local dev: fresh anvil + deploy MockUSDC/escrow + seed providers + Next dev server.
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.foundry/bin:$PATH"

RPC="http://127.0.0.1:8545"
probe() {
  curl -s -X POST "$RPC" -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' >/dev/null 2>&1
}

# 1. fresh local chain (clean state every run)
pkill -9 -x anvil 2>/dev/null || true
for _ in $(seq 1 20); do probe || break; sleep 0.25; done

anvil --chain-id 31337 >/tmp/leftoverice-anvil.log 2>&1 &
ANVIL_PID=$!
trap 'kill "$ANVIL_PID" 2>/dev/null || true' EXIT INT TERM

for _ in $(seq 1 40); do probe && break; sleep 0.25; done

# 2. deploy + seed (deploy-local.sh detects anvil is up and skips starting it)
bash scripts/deploy-local.sh

# 3. Next dev server (foreground; Ctrl+C stops everything, trap kills anvil)
npm run dev -w web
