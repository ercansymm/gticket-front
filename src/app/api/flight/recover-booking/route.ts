import { NextRequest, NextResponse } from 'next/server';
import { withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 5, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    if (!body?.bookingId) {
      return NextResponse.json({ error: 'bookingId zorunludur' }, { status: 400 });
    }

    const { signal, clear } = withTimeout(30_000);
    const res = await fetch(`${API_BASE}/api/flight/recover-booking`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8',
        'X-Transaction-Id': crypto.randomUUID(),
      },
      body: JSON.stringify(body),
      signal,
    });
    clear();

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error('Backend timeout', error, 'api/flight/recover-booking');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    logger.error('Recover booking failed', error, 'api/flight/recover-booking');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
