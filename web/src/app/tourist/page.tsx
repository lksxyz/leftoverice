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
  fmtUsdc,
  idrToUsdc,
  shortAddr,
  txUrl,
  IDR_PER_USDC,
  SPREAD,
} from "@/lib/chain";
import { verifyPayment } from "@/lib/verify";
import { Check, CheckCircle2, QrCode, Upload, XCircle } from "lucide-react";
import {
  Stepper,
  StepperNav,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
} from "@/components/reui/stepper";
import { useFileUpload } from "@/hooks/use-file-upload";

type Offer = { id: bigint; provider: string; amount: bigint };

const STEPS = ["Amount", "Provider", "Pay", "Proof", "Done"];

export default function TouristPage() {
  const [signer, setSigner] = useState<Signer | null>(null);
  const [address, setAddress] = useState("");
  const [mode, setMode] = useState<"demo" | "wallet">("demo");

  const [step, setStep] = useState(0);
  const [idr, setIdr] = useState("450000");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selected, setSelected] = useState<bigint | null>(null);
  const [uploadState, uploadActions] = useFileUpload({
    accept: "image/*",
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });
  const proof =
    uploadState.files[0]?.file instanceof File ? uploadState.files[0].file : null;
  const [result, setResult] = useState<{
    approved: boolean;
    confidence: number;
    reason: string;
    txHash: string | null;
  } | null>(null);
  const [balance, setBalance] = useState("0");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadOffers = useCallback(async () => {
    try {
      const e = escrowRead();
      const ids: bigint[] = await e.getOpenOffers();
      const list: Offer[] = [];
      for (const id of ids) {
        const o = await e.getOffer(id);
        list.push({ id, provider: o.provider, amount: o.amount });
      }
      setOffers(list);
    } catch {
      setOffers([]);
    }
  }, []);

  const loadBalance = useCallback(async () => {
    if (!address) return;
    try {
      setBalance(fmtUsdc(await usdcRead().balanceOf(address)));
    } catch {
      /* ignore */
    }
  }, [address]);

  useEffect(() => {
    if (address) loadBalance();
  }, [address, loadBalance]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  async function useDemo() {
    const s = demoSigner("tourist");
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

  async function match(id: bigint) {
    if (!signer) return;
    setBusy(true);
    setError("");
    try {
      const tx = await escrowWrite(signer).matchOffer(id);
      await tx.wait();
      setSelected(id);
      setStep(2);
      await loadOffers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Match failed");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const r = await verifyPayment(selected, proof?.name ?? "receipt.png");
      setResult(r);
      setStep(4);
      await loadBalance();
      await loadOffers();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verify failed");
    } finally {
      setBusy(false);
    }
  }

  const usdcQuote = idrToUsdc(Number(idr) || 0);
  const selectedOffer = offers.find((o) => o.id === selected);

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

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">Tourist — rupiah → USDC</span>
        <span>
          Step {step + 1} of {STEPS.length}
        </span>
      </div>

      <Stepper value={step} onValueChange={setStep} indicators={{ completed: <Check className="size-3" /> }}>
        <StepperNav>
          {STEPS.map((s, i) => (
            <StepperItem key={s} step={i}>
              <StepperTrigger className="p-0">
                <StepperIndicator>{i + 1}</StepperIndicator>
              </StepperTrigger>
              {i < STEPS.length - 1 && <StepperSeparator />}
            </StepperItem>
          ))}
        </StepperNav>
      </Stepper>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>How much rupiah is left?</CardTitle>
            <CardDescription>
              Rate {IDR_PER_USDC.toLocaleString()} IDR/USDC · spread {(SPREAD * 100).toFixed(0)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="idr">Leftover rupiah</Label>
              <Input
                id="idr"
                type="number"
                inputMode="numeric"
                value={idr}
                onChange={(e) => setIdr(e.target.value)}
                className="mt-1 text-lg"
              />
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <div className="text-xs text-muted-foreground">You receive ≈</div>
              <div className="text-2xl font-bold">{usdcQuote} USDC</div>
            </div>
            <Button className="w-full" disabled={!signer || !idr} onClick={() => setStep(1)}>
              Find providers
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a provider</CardTitle>
            <CardDescription>≈ {usdcQuote} USDC · pick the nearest offer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {offers.length === 0 && (
              <p className="text-sm text-muted-foreground">No open offers yet. Ask a provider to lock USDC.</p>
            )}
            {offers.map((o) => (
              <div
                key={o.id.toString()}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <div className="font-medium">{fmtUsdc(o.amount)} USDC</div>
                  <div className="text-xs text-muted-foreground">Provider {shortAddr(o.provider)}</div>
                </div>
                <Button size="sm" disabled={busy} onClick={() => match(o.id)}>
                  Match
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Pay the provider</CardTitle>
            <CardDescription>
              {selectedOffer
                ? `${fmtUsdc(selectedOffer.amount)} USDC ↔ ${Number(idr).toLocaleString()} IDR`
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mx-auto flex flex-col items-center gap-2 rounded-xl border border-dashed p-6">
              <QrCode className="size-24 text-foreground" />
              <div className="text-sm font-medium">QRIS · {Number(idr).toLocaleString()} IDR</div>
              <div className="text-xs text-muted-foreground">Provider {selectedOffer ? shortAddr(selectedOffer.provider) : ""}</div>
            </div>
            <Button className="w-full" onClick={() => setStep(3)}>
              I&apos;ve paid
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload proof of payment</CardTitle>
            <CardDescription>Receipt photo or transfer screenshot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors ${
                uploadState.isDragging ? "border-primary bg-primary/5" : "border-border"
              }`}
              onClick={uploadActions.openFileDialog}
              onDragEnter={uploadActions.handleDragEnter}
              onDragLeave={uploadActions.handleDragLeave}
              onDragOver={uploadActions.handleDragOver}
              onDrop={uploadActions.handleDrop}
            >
              {proof ? (
                <>
                  {uploadState.files[0]?.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={uploadState.files[0].preview}
                      alt="Receipt preview"
                      className="max-h-40 rounded-lg object-contain"
                    />
                  ) : null}
                  <span className="text-sm font-medium">{proof.name}</span>
                </>
              ) : (
                <>
                  <Upload className="size-8 text-muted-foreground" />
                  <span className="text-sm">Tap or drop a receipt image</span>
                </>
              )}
              <input {...uploadActions.getInputProps()} className="hidden" />
            </div>
            <Button className="w-full" disabled={!proof || busy} onClick={verify}>
              {busy ? "Verifying…" : "Verify payment"}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 4 && result && (
        <Card>
          <CardHeader>
            <CardTitle>Verification result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              {result.approved ? (
                <CheckCircle2 className="size-6 text-green-500" />
              ) : (
                <XCircle className="size-6 text-destructive" />
              )}
              <div>
                <div className="font-semibold">{result.approved ? "Payment verified" : "Payment rejected"}</div>
                <div className="text-xs text-muted-foreground">confidence {(result.confidence * 100).toFixed(0)}%</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{result.reason}</p>
            {result.approved && (
              <>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <div className="text-xs text-muted-foreground">Your balance</div>
                  <div className="text-2xl font-bold">{balance} USDC</div>
                </div>
                {result.txHash &&
                  (txUrl(result.txHash) ? (
                    <a
                      href={txUrl(result.txHash)!}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center text-sm text-primary underline"
                    >
                      View release on block explorer ↗
                    </a>
                  ) : (
                    <div className="break-all text-center text-xs text-muted-foreground">
                      tx {result.txHash}
                    </div>
                  ))}
              </>
            )}
            <Button className="w-full" variant="outline" onClick={() => setStep(0)}>
              New swap
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
