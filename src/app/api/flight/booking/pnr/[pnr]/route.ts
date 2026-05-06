import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { filterSensitiveFields, withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pnr: string }> },
) {
  const rateLimitResponse = checkRateLimit(request, 5, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 });
  }

  try {
    const { pnr } = await params;

    if (!pnr || !/^[A-Z0-9]{5,10}$/i.test(pnr)) {
      return NextResponse.json({ error: 'Geçersiz PNR' }, { status: 400 });
    }

    const { signal, clear } = withTimeout(15_000);
    const res = await fetch(`${API_BASE}/api/flight/booking/pnr/${encodeURIComponent(pnr.toUpperCase())}`, {
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
      logger.error('Backend timeout', error, 'api/flight/booking/pnr/[pnr]');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    logger.error('Get booking by PNR failed', error, 'api/flight/booking/pnr/[pnr]');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
