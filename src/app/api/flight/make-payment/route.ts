import { NextRequest, NextResponse } from 'next/server';
import { makePaymentClientSchema, validateBody, parseBody } from '@/lib/validations';
import { filterSensitiveFields, normalizeToCamelCase, withTimeout, checkRateLimit } from '@/lib/api-helpers';
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

    const sessionDataRaw = await sessionRes.json();
    const sessionData = normalizeToCamelCase(sessionDataRaw) as Record<string, unknown>;

    // Debug: session endpoint'inden dönen tüm alanları logla
    logger.info('Session data keys and values', 'api/flight/make-payment', {
      rawKeys: Object.keys(sessionDataRaw).join(','),
      normalizedKeys: Object.keys(sessionData).join(','),
      grandTotal: sessionData.grandTotal,
      totalFare: sessionData.totalFare,
      hasSessionId: !!sessionData.sessionId,
      hasProductId: !!sessionData.productId,
    });

    if (!sessionData.sessionId || !sessionData.sessionToken || !sessionData.shoppingFileId) {
      return NextResponse.json(
        { error: 'Oturum bilgileri eksik. Lütfen yeni arama yapın.' },
        { status: 400 },
      );
    }

    // GÜVENLİK: Kart bilgisi sadece backend'e gönderilir, asla loglanmaz
    const amount = Number(sessionData.grandTotal || sessionData.totalFare || 0);
    if (!amount || amount <= 0) {
      logger.error('Session amount is zero or missing', { searchId, grandTotal: sessionData.grandTotal, totalFare: sessionData.totalFare }, 'api/flight/make-payment');
      return NextResponse.json(
        { error: 'Fiyat bilgisi alınamadı. Lütfen işlemi baştan başlatın.' },
        { status: 400 },
      );
    }

    const backendBody: Record<string, unknown> = {
      sessionId: sessionData.sessionId,
      sessionToken: sessionData.sessionToken,
      shoppingFileId: sessionData.shoppingFileId,
      productId: sessionData.productId ?? null,
      amount,
      currency: sessionData.currency || 'TRY',
      paymentType: paymentType,
      bookingId: sessionData.bookingId ?? null,
    };

    // Debug: session'dan gelen alanları logla (hassas veri yok)
    logger.info('MakePayment session fields', 'api/flight/make-payment', {
      searchId,
      hasProductId: !!sessionData.productId,
      hasBookingId: !!sessionData.bookingId,
      hasCurrency: !!sessionData.currency,
      amount,
      paymentType,
    });

    if (paymentType === 'CreditCard' || paymentType === 'CreditCardDirect') {
      const { cardHolderName, cardNumber, expiryMonth, expiryYear, cvv, installmentOptionId } = rest as {
        cardHolderName: string; cardNumber: string; expiryMonth: string;
        expiryYear: string; cvv: string; installmentOptionId?: string;
      };
      backendBody.creditCard = { cardHolderName, cardNumber, expiryMonth, expiryYear, cvv };
      if (installmentOptionId) {
        backendBody.installmentOptionId = installmentOptionId;
      }

      // 3D Secure callback URL'i frontend belirlemez — backend kendi /api/Flight/3d-callback endpoint'ini
      // kullanir, oradan Complete3DPayment cagirip frontend'e ?status=...&pnr=... ile redirect eder.
      // Burada continueUrl set ETMEYIN, aksi halde Lidio direkt frontend'e doner ve Complete3D atlanir.
    }
    // Non-card payments: creditCard alanı gönderilmez

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

    const dataRaw = await res.json();
    const data = normalizeToCamelCase(dataRaw) as Record<string, unknown>;

    // Debug: backend response alanlarını logla
    logger.info('MakePayment backend response fields', 'api/flight/make-payment', {
      status: res.status,
      hasError: data.hasError,
      isPaymentSuccessful: data.isPaymentSuccessful,
      is3DSecureRequired: data.is3DSecureRequired,
      hasThreeDSecureHtml: !!data.threeDSecureHtml,
      hasThreeDSecureUrl: !!data.threeDSecureUrl,
      errorMessage: data.errorMessage,
      keys: Object.keys(data).join(','),
    });

    // GÜVENLİK: 3DS URL whitelist kontrolü
    if (data.is3DSecureRequired) {
      // Backend threeDSecureUrl veya threeDSecureHtml döndürebilir
      const secureUrl = data.threeDSecureUrl as string | undefined;
      if (secureUrl) {
        try {
          const url = new URL(secureUrl);
          const allowedHosts = (process.env.ALLOWED_3DS_HOSTS || '').split(',').map((h: string) => h.trim()).filter(Boolean);
          if (allowedHosts.length > 0 && !allowedHosts.some((h: string) => url.hostname.endsWith(h))) {
            logger.error('Suspicious 3DS URL blocked', { url: secureUrl }, 'api/flight/make-payment');
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
          }
        } catch {
          logger.error('Invalid 3DS URL', { url: secureUrl }, 'api/flight/make-payment');
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
      }
    }

    // filterSensitiveFields zaten creditCard, cardNumber, cvv, sessionId, sessionToken siler
    // 3DS akışı için paymentReferenceId ve shoppingFileId korunmalı
    const filtered = filterSensitiveFields(data) as Record<string, unknown>;
    // Ensure these fields pass through even if filterSensitiveFields strips them
    if (data.paymentReferenceId) filtered.paymentReferenceId = data.paymentReferenceId;
    if (data.shoppingFileId) filtered.shoppingFileId = data.shoppingFileId;

    return NextResponse.json(filtered, { status: res.status });
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
