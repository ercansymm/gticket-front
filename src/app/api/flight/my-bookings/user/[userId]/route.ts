import { NextRequest, NextResponse } from 'next/server';
import { filterSensitiveFields, withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const rateLimitResponse = checkRateLimit(request, 10, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { userId } = await params;

    if (!userId || !/^[a-zA-Z0-9-]{1,100}$/.test(userId)) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı ID' }, { status: 400 });
    }

    const { signal, clear } = withTimeout(15_000);
    const res = await fetch(`${API_BASE}/api/flight/my-bookings/user/${encodeURIComponent(userId)}`, {
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
      logger.error('Backend timeout', error, 'api/flight/my-bookings/user/[userId]');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    logger.error('Get user bookings failed', error, 'api/flight/my-bookings/user/[userId]');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
