import { NextRequest, NextResponse } from 'next/server';
import { filterSensitiveFields, withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> },
) {
  const rateLimitResponse = checkRateLimit(request, 10, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { email } = await params;

    // Email validation — basic check
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decodeURIComponent(email))) {
      return NextResponse.json({ error: 'Geçersiz e-posta adresi' }, { status: 400 });
    }

    const { signal, clear } = withTimeout(15_000);
    const res = await fetch(`${API_BASE}/api/flight/my-bookings/email/${encodeURIComponent(email)}`, {
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'X-Transaction-Id': crypto.randomUUID(),
      },
      signal,
    });
    clear();

    const data = await res.json();
    return NextResponse.json(filterSensitiveFields(data), { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error('Backend timeout', error, 'api/flight/my-bookings/email/[email]');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    logger.error('Get email bookings failed', error, 'api/flight/my-bookings/email/[email]');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
