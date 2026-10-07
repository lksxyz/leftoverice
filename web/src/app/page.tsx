import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftRight, ArrowRight, Landmark } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 p-4">
      <header className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Landmark className="size-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">LeftoverIce</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Turn leftover rupiah into USDC before you fly home.
        </p>
      </header>

      <div className="grid gap-3">
        <Link href="/tourist">
          <Card className="transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="size-4" /> I have rupiah → get USDC
              </CardTitle>
              <CardDescription>
                Tourist / nomad: swap leftover rupiah for USDC, verified by AI.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/provider">
          <Card className="transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="size-4" /> I have USDC → get rupiah
              </CardTitle>
              <CardDescription>
                Freelancer: lock USDC and get paid in rupiah.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <footer className="text-center text-xs text-muted-foreground">
        Prototype · BNB Chain testnet · Simulation only
      </footer>
    </main>
  );
}
