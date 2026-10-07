import type { Metadata } from "next";
import "@fontsource/open-runde/400.css";
import "@fontsource/open-runde/500.css";
import "@fontsource/open-runde/600.css";
import "@fontsource/open-runde/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeftoverIce — leftover rupiah → USDC",
  description:
    "Turn leftover rupiah into USDC before you fly home. AI-verified P2P escrow on BNB Chain.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
