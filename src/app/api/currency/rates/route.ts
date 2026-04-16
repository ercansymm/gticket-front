import { NextRequest, NextResponse } from "next/server";
import { withTimeout, checkRateLimit } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

const API_BASE = process.env.API_BASE_URL;

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 30, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    if (!API_BASE) {
      logger.error("[currency/rates] API_BASE_URL is not configured");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const backendUrl = `${API_BASE}/api/Currency/rates`;
    const { signal, clear } = withTimeout(10_000);

    const res = await fetch(backendUrl, {
      headers: {
        Accept: "application/json; charset=utf-8",
        "X-Transaction-Id": crypto.randomUUID(),
      },
      signal,
      next: { revalidate: 3600 }, // 1 saat cache
    });

    clear();

    if (!res.ok) {
      logger.error(`[currency/rates] Backend returned ${res.status}`);
      return NextResponse.json(
        { error: "Kur bilgisi alinamadi" },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (err) {
    logger.error("[currency/rates] Error:", err);
    return NextResponse.json(
      { error: "Kur bilgisi alinamadi" },
      { status: 502 }
    );
  }
}
