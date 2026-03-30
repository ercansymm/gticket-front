import { NextResponse } from "next/server";
import { withTimeout, checkRateLimit } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

const API_BASE = process.env.API_BASE_URL;

export async function GET(request: Request) {
  const rateLimitResponse = checkRateLimit(request, 60, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { signal, clear } = withTimeout(10_000);
    const res = await fetch(`${API_BASE}/api/lookup/airlines`, {
      headers: {
        Accept: "application/json; charset=utf-8",
        "X-Transaction-Id": crypto.randomUUID(),
      },
      next: { revalidate: 3600 },
      signal,
    });
    clear();

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      logger.error("Backend timeout", error, "api/lookup/airlines");
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }
    logger.error("Airlines fetch failed", error, "api/lookup/airlines");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
