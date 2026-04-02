import { NextRequest, NextResponse } from "next/server";
import { flightSearchSchema, validateBody, parseBody } from "@/lib/validations";
import { filterSensitiveFields, withTimeout, checkRateLimit } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

const API_BASE = process.env.API_BASE_URL;

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 30, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const parsed = await parseBody(request);
    if ("error" in parsed) return parsed.error;

    const validation = validateBody(flightSearchSchema, parsed.data);
    if (!validation.success) return validation.response;

    const { signal, clear } = withTimeout(60_000);
    const res = await fetch(`${API_BASE}/api/flight/search`, {
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
    const safeData = filterSensitiveFields(data);
    
    // DEBUG: Paket verisi kontrolü
    const flights = (safeData as any)?.flights;
    if (Array.isArray(flights) && flights.length > 0) {
      const f = flights[0];
      console.log('[PAKET DEBUG] İlk uçuş keys:', Object.keys(f).join(', '));
      console.log('[PAKET DEBUG] brandedFareItems:', JSON.stringify(f?.brandedFareItems)?.substring(0, 300));
      console.log('[PAKET DEBUG] farePackages:', JSON.stringify(f?.farePackages)?.substring(0, 300));
      // Ham backend verisinde de kontrol et
      const rawFlights = (data as any)?.flights ?? (data as any)?.Flights;
      if (Array.isArray(rawFlights) && rawFlights.length > 0) {
        const rf = rawFlights[0];
        console.log('[PAKET DEBUG RAW] İlk ham uçuş keys:', Object.keys(rf).join(', '));
        console.log('[PAKET DEBUG RAW] BrandedFareItems:', JSON.stringify(rf?.BrandedFareItems ?? rf?.brandedFareItems)?.substring(0, 300));
        console.log('[PAKET DEBUG RAW] FarePackages:', JSON.stringify(rf?.FarePackages ?? rf?.farePackages)?.substring(0, 300));
      }
    }
    
    return NextResponse.json(safeData, { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      logger.error("Backend timeout", error, "api/flight/search");
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }
    logger.error("Flight search failed", error, "api/flight/search");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
