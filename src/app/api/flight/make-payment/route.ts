import { NextRequest, NextResponse } from 'next/server';
import { makePaymentClientSchema, validateBody, parseBody } from '@/lib/validations';
import { filterSensitiveFields, withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

export async function POST(request: NextRequest) {
  // Ödeme endpoint'i — çok sıkı rate limit
  const rateLimitResponse = checkRateLimit(request, 3, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const parsed = await parseBody(request);
    if ('error' in parsed) return parsed.error;

    const validation = validateBody(makePaymentClientSchema, parsed.data);
    if (!validation.success) return validation.response;

    const { searchId, ...rest } = validation.data;
    const paymentType = rest.paymentType;

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

    const sessionData = await sessionRes.json();

    if (!sessionData.sessionId || !sessionData.sessionToken || !sessionData.shoppingFileId) {
      return NextResponse.json(
        { error: 'Oturum bilgileri eksik. Lütfen yeni arama yapın.' },
        { status: 400 },
      );
    }

    // GÜVENLİK: Kart bilgisi sadece backend'e gönderilir, asla loglanmaz
    const backendBody: Record<string, unknown> = {
      sessionId: sessionData.sessionId,
      sessionToken: sessionData.sessionToken,
      shoppingFileId: sessionData.shoppingFileId,
      productId: sessionData.productId || '',
      amount: sessionData.grandTotal || 0,
      currency: sessionData.currency || 'TRY',
      paymentType: paymentType,
      bookingId: sessionData.bookingId || null,
    };

    if (paymentType === 'CreditCard') {
      const { cardHolderName, cardNumber, expireMonth, expireYear, cvv, installmentCount } = rest as {
        cardHolderName: string; cardNumber: string; expireMonth: string;
        expireYear: string; cvv: string; installmentCount?: number;
      };
      backendBody.creditCard = { cardHolderName, cardNumber, expireMonth, expireYear, cvv };
      backendBody.installmentCount = installmentCount ?? 1;
    } else {
      backendBody.creditCard = null;
      backendBody.installmentCount = 1;
    }

    const { signal, clear } = withTimeout(60_000);
    const res = await fetch(`${API_BASE}/api/flight/make-payment`, {
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

    // GÜVENLİK: 3DS URL whitelist kontrolü
    if (data.is3DSecureRequired && data.threeDSecureUrl) {
      try {
        const url = new URL(data.threeDSecureUrl);
        const allowedHosts = (process.env.ALLOWED_3DS_HOSTS || '').split(',').map((h: string) => h.trim()).filter(Boolean);
        if (allowedHosts.length > 0 && !allowedHosts.some((h: string) => url.hostname.endsWith(h))) {
          logger.error('Suspicious 3DS URL blocked', { url: data.threeDSecureUrl }, 'api/flight/make-payment');
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
      } catch {
        logger.error('Invalid 3DS URL', { url: data.threeDSecureUrl }, 'api/flight/make-payment');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    }

    // filterSensitiveFields zaten creditCard, cardNumber, cvv, sessionId, sessionToken siler
    return NextResponse.json(filterSensitiveFields(data), { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error('Backend timeout', error, 'api/flight/make-payment');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    // GÜVENLİK: Kart bilgisi loglanmaz — sadece error tipi
    logger.error('Make payment failed', error, 'api/flight/make-payment');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
