import { NextRequest, NextResponse } from 'next/server';
import { filterSensitiveFields, withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pnr: string; lastName: string }> },
) {
  const rateLimitResponse = checkRateLimit(request, 20, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { pnr, lastName } = await params;

    if (!pnr || !/^[A-Z0-9]{5,10}$/i.test(pnr)) {
      return NextResponse.json({ error: 'Geçersiz PNR kodu.' }, { status: 400 });
    }

    if (!lastName || lastName.trim().length < 2) {
      return NextResponse.json({ error: 'Geçersiz soyad.' }, { status: 400 });
    }

    const { signal, clear } = withTimeout(15_000);
    const res = await fetch(
      `${API_BASE}/api/flight/booking/lookup/${encodeURIComponent(pnr.toUpperCase())}/${encodeURIComponent(lastName.toUpperCase())}`,
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

    if (res.status === 404) {
      return NextResponse.json(
        { error: 'Girilen PNR ve soyad ile eşleşen rezervasyon bulunamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.' },
        { status: 404 },
      );
    }

    return NextResponse.json(filterSensitiveFields(data), { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error('Backend timeout', error, 'api/flight/booking/lookup');
      return NextResponse.json({ error: 'İstek zaman aşımına uğradı.' }, { status: 504 });
    }
    logger.error('Booking lookup failed', error, 'api/flight/booking/lookup');
    return NextResponse.json({ error: 'Bir hata oluştu, lütfen tekrar deneyin.' }, { status: 500 });
  }
}
