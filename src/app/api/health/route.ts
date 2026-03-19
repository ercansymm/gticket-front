import { NextResponse } from "next/server";
import { withTimeout, checkRateLimit } from "@/lib/api-helpers";

const API_BASE = process.env.API_BASE_URL;

export async function GET(request: Request) {
  const rateLimitResponse = checkRateLimit(request, 10, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { signal, clear } = withTimeout(5_000);
    const res = await fetch(`${API_BASE}/api/health`, {
      headers: { "X-Transaction-Id": crypto.randomUUID() },
      signal,
    });
    clear();

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { status: "unhealthy", message: "Service unavailable" },
      { status: 503 },
    );
  }
}
