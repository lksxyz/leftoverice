import { NextResponse, type NextRequest } from "next/server";
import { Contract, JsonRpcProvider, Wallet, keccak256, toUtf8Bytes } from "ethers";
import EscrowAbi from "@/lib/abi/LeftoverEscrow.json";

// AI proof-of-payment verifier.
// Mock decision today: reject when the filename hints fraud. Swap the body of
// `decide()` for a real vision LLM returning { approved, confidence, reason }.
export async function POST(req: NextRequest) {
  let body: { offerId?: string; proofName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const offerId = body.offerId ?? "";
  const proofName = body.proofName ?? "receipt.png";

  const suspicious = /fake|wrong|duplicate|dummy|test-fail/i.test(proofName);
  const approved = !suspicious;
  const confidence = approved ? 0.98 : 0.31;
  const reason = approved
    ? "Amount, recipient and timestamp match the order"
    : "Receipt does not match the order amount or recipient";
  const proofHash = keccak256(toUtf8Bytes(`${offerId}:${proofName}:${Date.now()}`));

  let txHash: string | null = null;

  if (approved) {
    const rpc = process.env.RPC_URL ?? "http://127.0.0.1:8545";
    const key = process.env.VERIFIER_KEY;
    const escrowAddr = process.env.ESCROW_ADDRESS;
    if (key && escrowAddr) {
      const provider = new JsonRpcProvider(rpc);
      const wallet = new Wallet(key, provider);
      const escrow = new Contract(escrowAddr, EscrowAbi, wallet);
      const tx = await escrow.release(offerId, proofHash);
      const receipt = await tx.wait();
      txHash = receipt.hash;
    }
  }

  return NextResponse.json({ approved, confidence, reason, proofHash, txHash });
}
