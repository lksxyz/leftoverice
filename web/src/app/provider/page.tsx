"use client";

import { useCallback, useEffect, useState } from "react";
import type { Signer } from "ethers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  connectWallet,
  demoSigner,
  escrowRead,
  escrowWrite,
  usdcRead,
  usdcWrite,
  fmtUsdc,
  usdcToWei,
  shortAddr,
  ESCROW_ADDRESS,
} from "@/lib/chain";
import { Lock } from "lucide-react";

const STATUS: Record<number, string> = {
  0: "Open",
  1: "Matched",
  2: "Released",
  3: "Refunded",
  4: "Cancelled",
};

type MyOffer = { id: bigint; amount: bigint; status: number; buyer: string };

export default function ProviderPage() {
  const [signer, setSigner] = useState<Signer | null>(null);
  const [address, setAddress] = useState("");
  const [mode, setMode] = useState<"demo" | "wallet">("demo");

  const [amount, setAmount] = useState("1000");
  const [balance, setBalance] = useState("0");
  const [myOffers, setMyOffers] = useState<MyOffer[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!address) return;
    try {
      setBalance(fmtUsdc(await usdcRead().balanceOf(address)));
      const e = escrowRead();
      const count: bigint = await e.offerCount();
      const list: MyOffer[] = [];
      for (let i = BigInt(1); i <= count; i++) {
        const o = await e.getOffer(i);
        if (o.provider.toLowerCase() === address.toLowerCase()) {
          list.push({ id: i, amount: o.amount, status: Number(o.status), buyer: o.buyer });
        }
      }
      setMyOffers(list);
    } catch {
      /* ignore */
    }
  }, [address]);

  useEffect(() => {
    if (address) refresh();
  }, [address, refresh]);

  async function useDemo() {
    const s = demoSigner("provider");
    setSigner(s);
    setAddress(await s.getAddress());
    setMode("demo");
  }

  async function useWallet() {
    try {
      const s = await connectWallet();
      setSigner(s);
      setAddress(await s.getAddress());
      setMode("wallet");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wallet connect failed");
    }
  }

  async function lock() {
    if (!signer) return;
    setBusy(true);
    setError("");
    try {
      const amt = usdcToWei(amount);
      const approveTx = await usdcWrite(signer).approve(ESCROW_ADDRESS, amt);
      await approveTx.wait();
      const depositTx = await escrowWrite(signer).deposit(amt);
      await depositTx.wait();
      setAmount("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lock failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold">
          ← LeftoverIce
        </Link>
        <div className="flex items-center gap-2">
          {signer ? (
            <Badge variant="secondary">{mode === "demo" ? "demo" : "wallet"} · {shortAddr(address)}</Badge>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={useDemo}>
                Demo
              </Button>
              <Button size="sm" variant="outline" onClick={useWallet}>
                Connect wallet
              </Button>
            </>
          )}
        </div>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Provider — lock USDC</CardTitle>
          <CardDescription>
            Balance <span className="font-semibold">{balance} USDC</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount to lock (USDC)</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 text-lg"
            />
          </div>
          <Button className="w-full" disabled={!signer || busy || !amount} onClick={lock}>
            <Lock className="size-4" /> {busy ? "Locking…" : "Approve & lock USDC"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Your USDC is held in the escrow until an AI verifier releases it to a tourist or refunds it to you.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My offers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {myOffers.length === 0 && (
            <p className="text-sm text-muted-foreground">No offers yet.</p>
          )}
          {myOffers.map((o) => (
            <div key={o.id.toString()} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">{fmtUsdc(o.amount)} USDC</div>
                <div className="text-xs text-muted-foreground">
                  offer #{o.id.toString()} · buyer {o.buyer === "0x0000000000000000000000000000000000000000" ? "—" : shortAddr(o.buyer)}
                </div>
              </div>
              <Badge variant={o.status === 0 ? "default" : "secondary"}>{STATUS[o.status] ?? o.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
