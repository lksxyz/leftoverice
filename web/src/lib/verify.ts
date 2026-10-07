export async function verifyPayment(offerId: string | number | bigint, proofName: string) {
  const res = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ offerId: String(offerId), proofName }),
  });
  if (!res.ok) throw new Error("Verification failed");
  return res.json();
}
