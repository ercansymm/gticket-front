import { NextRequest, NextResponse } from "next/server";
import { withTimeout, checkRateLimit } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

const API_BASE = process.env.API_BASE_URL;
const ALLOWED_LANGS = new Set(["tr", "en"]);

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 60, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const lang = searchParams.get("lang") || "tr";
    const domestic = searchParams.get("domestic");

    if (!ALLOWED_LANGS.has(lang)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }
    if (query.length > 100) {
      return NextResponse.json({ error: "Query too long" }, { status: 400 });
    }

    // domestic=true → yurt içi havalimanları, q varsa → arama, yoksa → tümü
    let backendUrl: string;
    if (domestic === "true") {
      backendUrl = `${API_BASE}/api/Airport?domestic=true&lang=${encodeURIComponent(lang)}`;
    } else if (query) {
      backendUrl = `${API_BASE}/api/Airport/search?q=${encodeURIComponent(query)}&limit=20&lang=${encodeURIComponent(lang)}`;
    } else {
      backendUrl = `${API_BASE}/api/Airport?lang=${encodeURIComponent(lang)}`;
    }

    const { signal, clear } = withTimeout(10_000);
    const res = await fetch(backendUrl, {
        headers: {
          Accept: "application/json; charset=utf-8",
          "X-Transaction-Id": crypto.randomUUID(),
        },
        signal,
      },
    );
    clear();

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      logger.error("Backend timeout", error, "api/lookup/airports");
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }
    logger.error("Airport search failed", error, "api/lookup/airports");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
