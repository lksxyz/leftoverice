import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  Wallet,
  formatUnits,
  parseUnits,
  type Signer,
} from "ethers";
import MockUSDCAbi from "./abi/MockUSDC.json";
import EscrowAbi from "./abi/LeftoverEscrow.json";

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545";
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "";
export const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS ?? "";
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL ?? "";

// Demo fixed rate + provider spread. Swap for a live oracle in production.
export const IDR_PER_USDC = 16300;
export const SPREAD = 0.02;

export type DemoRole = "tourist" | "provider";

// Well-known anvil dev accounts — local demo only, never real funds.
export const DEMO_ACCOUNTS: Record<DemoRole, { address: string; key: string }> = {
  provider: {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    key: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  },
  tourist: {
    address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    key: "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
  },
};

export function getProvider() {
  return new JsonRpcProvider(RPC_URL);
}

export function demoSigner(role: DemoRole): Signer {
  return new Wallet(DEMO_ACCOUNTS[role].key, getProvider());
}

export async function connectWallet(): Promise<Signer> {
  const w = (globalThis as { ethereum?: unknown }).ethereum;
  if (!w) throw new Error("No injected wallet found");
  const provider = new BrowserProvider(w as never);
  return provider.getSigner();
}

export function usdcRead() {
  return new Contract(USDC_ADDRESS, MockUSDCAbi, getProvider());
}
export function escrowRead() {
  return new Contract(ESCROW_ADDRESS, EscrowAbi, getProvider());
}
export function usdcWrite(signer: Signer) {
  return new Contract(USDC_ADDRESS, MockUSDCAbi, signer);
}
export function escrowWrite(signer: Signer) {
  return new Contract(ESCROW_ADDRESS, EscrowAbi, signer);
}

export function fmtUsdc(amount: bigint): string {
  return formatUnits(amount, 6);
}

export function usdcToWei(x: string): bigint {
  return parseUnits(x || "0", 6);
}

export function idrToUsdc(idr: number): string {
  const usdc = idr / IDR_PER_USDC / (1 + SPREAD);
  return usdc.toFixed(2);
}

export function shortAddr(a: string): string {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";
}

export function txUrl(hash: string): string | null {
  if (!EXPLORER_URL || !hash) return null;
  return `${EXPLORER_URL}/tx/${hash}`;
}
