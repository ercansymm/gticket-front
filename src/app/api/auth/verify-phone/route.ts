import { NextResponse } from "next/server";
import { withTimeout, checkRateLimit } from "@/lib/api-helpers";

const API_BASE = process.env.API_BASE_URL;

export async function POST(request: Request) {
  // OTP doğrulama: IP başına 10 deneme / 60s
  const rateLimitResponse = checkRateLimit(request, 10, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  if (!API_BASE) {
    return NextResponse.json({ error: "API URL tanımlı değil." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { signal, clear } = withTimeout(10_000);
    const res = await fetch(`${API_BASE}/api/auth/verify-phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
    clear();

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Sunucuya ulaşılamadı." }, { status: 503 });
  }
}
