import { NextRequest, NextResponse } from 'next/server';
import { filterSensitiveFields, withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { retryPaymentClientSchema, validateBody, parseBody } from '@/lib/validations';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

/**
 * Proxy: POST /api/Flight/booking/{bookingId}/retry-payment
 * Var olan bir rezervasyon için ödemeyi tekrar dener. 3D Secure başarısız olduğunda
 * veya iptal edildiğinde kullanılır — yeni allocate/prebooking yapılmaz, booking'de
 * saklanan SessionId/SessionToken/ShoppingFileId/ProductId tekrar kullanılır.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  // Ödeme isteği — saldırı yüzeyi geniş, sıkı rate-limit
  const rateLimitResponse = checkRateLimit(request, 10, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { bookingId } = await params;

    if (!bookingId || !/^[a-zA-Z0-9-]{1,100}$/.test(bookingId)) {
      return NextResponse.json({ error: 'Geçersiz booking ID' }, { status: 400 });
    }

    const parsed = await parseBody(request);
    if ('error' in parsed) return parsed.error;

    const validation = validateBody(retryPaymentClientSchema, parsed.data);
    if (!validation.success) return validation.response;

    if (validation.data.bookingId !== bookingId) {
      return NextResponse.json(
        { error: 'URL ve body içindeki bookingId uyumsuz' },
        { status: 400 },
      );
    }

    const { signal, clear } = withTimeout(60_000);
    const res = await fetch(
      `${API_BASE}/api/flight/booking/${encodeURIComponent(bookingId)}/retry-payment`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json; charset=utf-8',
          'Content-Type': 'application/json; charset=utf-8',
          'X-Transaction-Id': crypto.randomUUID(),
        },
        body: JSON.stringify(validation.data),
        signal,
      },
    );
    clear();

    const data = await res.json();
    return NextResponse.json(filterSensitiveFields(data), { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error('Backend timeout', error, 'api/flight/booking/[bookingId]/retry-payment');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    logger.error('Retry payment failed', error, 'api/flight/booking/[bookingId]/retry-payment');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
