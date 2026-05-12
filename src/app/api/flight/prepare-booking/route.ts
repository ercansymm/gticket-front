import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prepareBookingClientSchema, validateBody, parseBody } from '@/lib/validations';
import { filterSensitiveFields, normalizeToCamelCase, withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { getSessionCache, setSessionCache } from '@/lib/session-cache';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 5, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const parsed = await parseBody(request);
    if ('error' in parsed) return parsed.error;

    const validation = validateBody(prepareBookingClientSchema, parsed.data);
    if (!validation.success) return validation.response;

    const { searchId, productId, productItemId, brandedFareItemId, passengers, contact } = validation.data;

    // Session fetch + NextAuth session lookup paralel çalışır — birbirini beklemezler
    const [sessionData, authSession] = await Promise.all([
      (async () => {
        const cached = getSessionCache(searchId);
        if (cached) return cached;
        const res = await fetch(`${API_BASE}/api/flight/session/${encodeURIComponent(searchId)}`, {
          headers: { 'Accept': 'application/json; charset=utf-8' },
        });
        if (!res.ok) return null;
        const raw = await res.json();
        const data = normalizeToCamelCase(raw) as Record<string, unknown>;
        setSessionCache(searchId, data);
        return data;
      })(),
      getServerSession(authOptions),
    ]);

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Arama oturumu süresi dolmuş. Lütfen yeni arama yapın.' },
        { status: 400 },
      );
    }

    if (!sessionData.sessionId || !sessionData.sessionToken || !sessionData.shoppingFileId) {
      return NextResponse.json(
        { error: 'Oturum bilgileri eksik. Lütfen yeni arama yapın.' },
        { status: 400 },
      );
    }

    const sessionUserId = (authSession?.user as { id?: string } | undefined)?.id ?? null;

    // Adım 1: Yolcu bilgilerini güncelle
    const updateBody = {
      sessionId: sessionData.sessionId,
      sessionToken: sessionData.sessionToken,
      shoppingFileId: sessionData.shoppingFileId,
      productId,
      productItemId,
      passengers,
      contact,
    };

    const { signal: sig1, clear: clear1 } = withTimeout(30_000);
    const updateRes = await fetch(`${API_BASE}/api/flight/update-passengers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'X-Transaction-Id': crypto.randomUUID(),
      },
      body: JSON.stringify(updateBody),
      signal: sig1,
    });
    clear1();

    const updateDataRaw = await updateRes.json();
    const updateData = normalizeToCamelCase(updateDataRaw) as Record<string, unknown>;

    if (updateData.hasError) {
      return NextResponse.json(
        {
          hasError: true,
          errorMessage: updateData.errorMessage ?? 'Yolcu bilgileri güncellenemedi',
          errorStep: 'updatePassengers',
        },
        { status: 422 },
      );
    }

    // Adım 2: Ön rezervasyon oluştur
    const prebookBody = {
      sessionId: sessionData.sessionId,
      sessionToken: sessionData.sessionToken,
      productId,
      brandedFareItemId: brandedFareItemId || '',
      shoppingFileId: sessionData.shoppingFileId,
      userId: sessionUserId,
      passengers,
      contact,
    };

    const { signal: sig2, clear: clear2 } = withTimeout(60_000);
    const prebookRes = await fetch(`${API_BASE}/api/flight/make-prebooking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'X-Transaction-Id': crypto.randomUUID(),
        'X-Search-Id': searchId,
      },
      body: JSON.stringify(prebookBody),
      signal: sig2,
    });
    clear2();

    const prebookDataRaw = await prebookRes.json();

    // 409 = fiyat değişikliği — iç datayı 200 olarak döndür, isPriceChanged: true ile gelir
    if (prebookRes.status === 409) {
      const normalized = normalizeToCamelCase(prebookDataRaw) as Record<string, unknown>;
      if (normalized.code === 'PRICE_CHANGED' && normalized.data) {
        return NextResponse.json(filterSensitiveFields(normalized.data), { status: 200 });
      }
    }

    // Başarılı prebooking — make-payment'ın ihtiyacı olan fiyat + bookingId'yi cache'e yaz
    if (prebookRes.ok) {
      const normalized = normalizeToCamelCase(prebookDataRaw) as Record<string, unknown>;
      if (!normalized.hasError && normalized.totalFare) {
        const currentCache = getSessionCache(searchId) ?? {};
        setSessionCache(searchId, {
          ...currentCache,
          grandTotal: normalized.totalFare,
          totalFare: normalized.totalFare,
          currency: normalized.currency ?? currentCache.currency ?? 'TRY',
          bookingId: normalized.bookingId ?? currentCache.bookingId ?? null,
        });
      }
    }

    return NextResponse.json(filterSensitiveFields(prebookDataRaw), { status: prebookRes.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error('Backend timeout', error, 'api/flight/prepare-booking');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    logger.error('Prepare booking failed', error, 'api/flight/prepare-booking');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
