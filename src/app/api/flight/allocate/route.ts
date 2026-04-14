import { NextRequest, NextResponse } from 'next/server';
import { flightAllocateClientSchema, validateBody, parseBody } from '@/lib/validations';
import { filterSensitiveFields, normalizeToCamelCase, withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 10, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const parsed = await parseBody(request);
    if ('error' in parsed) return parsed.error;

    const validation = validateBody(flightAllocateClientSchema, parsed.data);
    if (!validation.success) return validation.response;

    const { searchId, productId, brandedFareItemId, returnProductId, returnBrandedFareItemId, subOptionFlightIds } = validation.data;

    // 1. Server-side'da session bilgisini al
    const sessionRes = await fetch(`${API_BASE}/api/flight/session/${encodeURIComponent(searchId)}`, {
      headers: { 'Accept': 'application/json; charset=utf-8' },
    });

    if (!sessionRes.ok) {
      return NextResponse.json(
        { error: 'Arama oturumu süresi dolmuş. Lütfen yeni arama yapın.' },
        { status: 400 },
      );
    }

    const sessionDataRaw = await sessionRes.json();
    const sessionData = normalizeToCamelCase(sessionDataRaw) as Record<string, unknown>;

    if (!sessionData.sessionId || !sessionData.sessionToken) {
      return NextResponse.json(
        { error: 'Oturum bilgileri eksik. Lütfen yeni arama yapın.' },
        { status: 400 },
      );
    }

    // 2. Backend'e tam request gönder (session server-side'da eklendi, serviceFee sabit 0)
    const backendBody: Record<string, unknown> = {
      sessionId: sessionData.sessionId,
      sessionToken: sessionData.sessionToken,
      productId,
      selectedServiceFee: 0,
      searchRequest: null,
    };
    if (brandedFareItemId) {
      backendBody.brandedFareItemId = brandedFareItemId;
    }
    if (returnProductId) {
      backendBody.returnProductId = returnProductId;
    }
    if (returnBrandedFareItemId) {
      backendBody.returnBrandedFareItemId = returnBrandedFareItemId;
    }
    if (subOptionFlightIds?.length) {
      backendBody.subOptionFlightIds = subOptionFlightIds;
    }

    const { signal, clear } = withTimeout(30_000);
    const res = await fetch(`${API_BASE}/api/flight/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'X-Transaction-Id': crypto.randomUUID(),
        'X-Search-Id': searchId,
      },
      body: JSON.stringify(backendBody),
      signal,
    });
    clear();

    const data = await res.json();

    // GÜVENLİK: filterSensitiveFields sessionId/sessionToken ve hassas alanları siler
    const safeData = filterSensitiveFields(data) as Record<string, unknown>;
    // searchId'yi backend döndürmeyebilir — istemcinin checkout akışında kullanabilmesi için ekle
    safeData.searchId = searchId;
    return NextResponse.json(safeData, { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error('Backend timeout', error, 'api/flight/allocate');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    logger.error('Flight allocate failed', error, 'api/flight/allocate');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
