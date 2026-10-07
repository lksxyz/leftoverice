import Link from "next/link";
import { ArrowRight, Banknote, CircleDollarSign, Landmark, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-10">
      <header className="text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-foreground text-background">
          <Landmark className="size-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">LeftoverIce</h1>
        <p className="mx-auto mt-2 max-w-xs text-balance text-muted-foreground">
          Turn leftover rupiah into USDC before you fly home.
        </p>
      </header>

      <div className="grid gap-4">
        <Link href="/tourist" className="group">
          <div className="rounded-2xl border border-tourist/25 bg-tourist-soft p-5 transition group-hover:border-tourist/50">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-tourist text-tourist-foreground">
                <Banknote className="size-6" />
              </div>
              <div>
                <h2 className="font-semibold text-tourist-soft-foreground">
                  I have leftover rupiah
                </h2>
                <p className="text-sm text-tourist-soft-foreground/75">
                  Swap it for USDC before you fly home.
                </p>
              </div>
            </div>
            <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-tourist py-2.5 text-sm font-semibold text-tourist-foreground transition group-hover:brightness-95">
              Get USDC <ArrowRight className="size-4" />
            </div>
          </div>
        </Link>

        <Link href="/provider" className="group">
          <div className="rounded-2xl border border-provider/25 bg-provider-soft p-5 transition group-hover:border-provider/50">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-provider text-provider-foreground">
                <CircleDollarSign className="size-6" />
              </div>
              <div>
                <h2 className="font-semibold text-provider-soft-foreground">
                  I have USDC
                </h2>
                <p className="text-sm text-provider-soft-foreground/75">
                  Lock USDC, get paid in rupiah.
                </p>
              </div>
            </div>
            <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-provider py-2.5 text-sm font-semibold text-provider-foreground transition group-hover:brightness-95">
              Get rupiah <ArrowRight className="size-4" />
            </div>
          </div>
        </Link>
      </div>

      <section className="rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">How it works</h2>
        <ol className="mt-3 space-y-2.5 text-sm text-muted-foreground">
          <li className="flex gap-2.5">
            <span className="font-semibold text-foreground">1.</span>
            <span>A provider locks USDC in the escrow.</span>
          </li>
          <li className="flex gap-2.5">
            <span className="font-semibold text-foreground">2.</span>
            <span>You pay them in rupiah and upload proof.</span>
          </li>
          <li className="flex gap-2.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
            <span>
              <span className="font-semibold text-foreground">AI verifies</span> and releases USDC
              to your wallet.
            </span>
          </li>
        </ol>
      </section>

      <footer className="text-center text-xs text-muted-foreground">
        Prototype · BNB Chain testnet · Simulation only
      </footer>
    </main>
  );
}
