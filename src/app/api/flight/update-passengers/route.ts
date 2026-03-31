import { NextRequest, NextResponse } from 'next/server';
import { updatePassengersClientSchema, validateBody, parseBody } from '@/lib/validations';
import { filterSensitiveFields, normalizeToCamelCase, withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 10, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const parsed = await parseBody(request);
    if ('error' in parsed) return parsed.error;

    const validation = validateBody(updatePassengersClientSchema, parsed.data);
    if (!validation.success) return validation.response;

    const { searchId, productId, productItemId, passengers, contact } = validation.data;

    // 1. Server-side'da session + allocate bilgilerini al
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

    // 2. Backend'e tam request gönder (session server-side'da eklendi)
    const backendBody = {
      sessionId: sessionData.sessionId,
      sessionToken: sessionData.sessionToken,
      shoppingFileId: sessionData.shoppingFileId,
      productId,
      productItemId,
      passengers,
      contact,
    };

    logger.info('update-passengers → backend payload', 'api/flight/update-passengers', { body: backendBody } as Record<string, unknown>);

    const { signal, clear } = withTimeout(30_000);
    const res = await fetch(`${API_BASE}/api/flight/update-passengers`, {
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
      logger.error('Backend timeout', error, 'api/flight/update-passengers');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    // GÜVENLİK: PII loglanmaz — sadece error tipi
    logger.error('Update passengers failed', error, 'api/flight/update-passengers');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
