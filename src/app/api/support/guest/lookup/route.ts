import { NextResponse } from "next/server";
import { withTimeout, checkRateLimit } from "@/lib/api-helpers";

const API_BASE = process.env.API_BASE_URL;

// Misafir destek lookup (PNR + Soyad). Backend ek olarak kendi rate limit
// policy'sini uyguluyor; biz de proxy seviyesinde kötü niyetli yığınları erken keseriz.
export async function POST(request: Request) {
  const rateLimited = checkRateLimit(request, 8, 60_000);
  if (rateLimited) return rateLimited;

  if (!API_BASE) {
    return NextResponse.json({ error: "API URL tanımlı değil." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { signal, clear } = withTimeout(15_000);
    const res = await fetch(`${API_BASE}/api/support/guest/lookup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Transaction-Id": crypto.randomUUID(),
      },
      body: JSON.stringify(body),
      signal,
      cache: "no-store",
    });
    clear();
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, {
      status: res.status,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch {
    return NextResponse.json({ error: "Sunucuya ulaşılamadı." }, { status: 503 });
  }
}
