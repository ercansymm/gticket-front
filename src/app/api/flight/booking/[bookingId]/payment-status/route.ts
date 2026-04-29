import { NextRequest, NextResponse } from 'next/server';
import { filterSensitiveFields, withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

/**
 * Proxy: GET /api/Flight/booking/{bookingId}/payment-status
 * 3D Secure başarısız olduğunda veya iptal edildiğinde rezervasyonun
 * hâlâ geçerli olup olmadığını kontrol eder. Frontend bu endpoint'i çağırıp
 * "rezervasyonunuz X dakika daha geçerli, tekrar deneyin" mesajını gösterir.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const rateLimitResponse = checkRateLimit(request, 30, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { bookingId } = await params;

    if (!bookingId || !/^[a-zA-Z0-9-]{1,100}$/.test(bookingId)) {
      return NextResponse.json({ error: 'Geçersiz booking ID' }, { status: 400 });
    }

    const { signal, clear } = withTimeout(10_000);
    const res = await fetch(
      `${API_BASE}/api/flight/booking/${encodeURIComponent(bookingId)}/payment-status`,
      {
        headers: {
          'Accept': 'application/json; charset=utf-8',
          'X-Transaction-Id': crypto.randomUUID(),
        },
        signal,
      },
    );
    clear();

    const data = await res.json();
    return NextResponse.json(filterSensitiveFields(data), { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error('Backend timeout', error, 'api/flight/booking/[bookingId]/payment-status');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    logger.error('Get payment status failed', error, 'api/flight/booking/[bookingId]/payment-status');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
