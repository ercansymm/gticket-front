import { NextRequest, NextResponse } from 'next/server';
import { withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const rateLimitResponse = checkRateLimit(request, 10, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { bookingId } = await params;

    if (!bookingId || !/^[0-9a-f-]{36}$/i.test(bookingId)) {
      return NextResponse.json({ error: 'Geçersiz rezervasyon ID' }, { status: 400 });
    }

    const sequenceNo = request.nextUrl.searchParams.get('sequenceNo');
    const queryString = sequenceNo ? `?sequenceNo=${encodeURIComponent(sequenceNo)}` : '';

    const { signal, clear } = withTimeout(30_000);
    const res = await fetch(
      `${API_BASE}/api/ticket/pdf/booking/${encodeURIComponent(bookingId)}${queryString}`,
      {
        headers: {
          'Accept': 'application/pdf',
          'X-Transaction-Id': crypto.randomUUID(),
        },
        signal,
      },
    );
    clear();

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      logger.error('PDF generation failed', { status: res.status, error: errorText }, 'api/ticket/pdf/booking');
      return NextResponse.json(
        { error: 'PDF oluşturulamadı. Lütfen daha sonra tekrar deneyin.' },
        { status: res.status },
      );
    }

    const pdfBuffer = await res.arrayBuffer();
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': res.headers.get('Content-Disposition') ?? 'attachment; filename="e-ticket.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error('Backend timeout', error, 'api/ticket/pdf/booking');
      return NextResponse.json({ error: 'PDF oluşturma zaman aşımına uğradı' }, { status: 504 });
    }
    logger.error('PDF proxy failed', error, 'api/ticket/pdf/booking');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
