import { NextRequest, NextResponse } from "next/server";
import { bookingSchema, validateBody, parseBody } from "@/lib/validations";
import { filterSensitiveFields, withTimeout, checkRateLimit } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

const API_BASE = process.env.API_BASE_URL;

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 5, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const parsed = await parseBody(request);
    if ("error" in parsed) return parsed.error;

    const validation = validateBody(bookingSchema, parsed.data);
    if (!validation.success) return validation.response;

    const { signal, clear } = withTimeout(30_000);
    const res = await fetch(`${API_BASE}/api/flight/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json; charset=utf-8",
        "X-Transaction-Id": crypto.randomUUID(),
      },
      body: JSON.stringify(validation.data),
      signal,
    });
    clear();

    const data = await res.json();
    return NextResponse.json(filterSensitiveFields(data), { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      logger.error("Backend timeout", error, "api/flight/book");
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }
    logger.error("Flight booking failed", error, "api/flight/book");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
