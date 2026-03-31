import { NextRequest, NextResponse } from 'next/server';
import { cancelBookingClientSchema, validateBody, parseBody } from '@/lib/validations';
import { filterSensitiveFields, normalizeToCamelCase, withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 5, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const parsed = await parseBody(request);
    if ('error' in parsed) return parsed.error;

    const validation = validateBody(cancelBookingClientSchema, parsed.data);
    if (!validation.success) return validation.response;

    const { searchId, productId, bookingId } = validation.data;

    // Server-side'da session bilgisini al
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

    if (!sessionData.sessionId || !sessionData.sessionToken || !sessionData.shoppingFileId) {
      return NextResponse.json(
        { error: 'Oturum bilgileri eksik. Lütfen yeni arama yapın.' },
        { status: 400 },
      );
    }

    const backendBody: Record<string, unknown> = {
      sessionId: sessionData.sessionId,
      sessionToken: sessionData.sessionToken,
      productId,
    };
    if (bookingId) backendBody.bookingId = bookingId;

    const { signal, clear } = withTimeout(30_000);
    const res = await fetch(`${API_BASE}/api/flight/cancel-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'X-Transaction-Id': crypto.randomUUID(),
      },
      body: JSON.stringify(backendBody),
      signal,
    });
    clear();

    const data = await res.json();
    return NextResponse.json(filterSensitiveFields(data), { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error('Backend timeout', error, 'api/flight/cancel-booking');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    logger.error('Cancel booking failed', error, 'api/flight/cancel-booking');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
