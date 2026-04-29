import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { makePreBookingClientSchema, validateBody, parseBody } from '@/lib/validations';
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

    const validation = validateBody(makePreBookingClientSchema, parsed.data);
    if (!validation.success) return validation.response;

    const { searchId, productId, brandedFareItemId, passengers, contact } = validation.data;

    // NextAuth session + flight session paralel al
    const [authSession, flightSessionData] = await Promise.all([
      getServerSession(authOptions),
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
    ]);

    const sessionUserId = (authSession?.user as { id?: string } | undefined)?.id ?? null;
    const sessionData = flightSessionData;

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

    const backendBody = {
      sessionId: sessionData.sessionId,
      sessionToken: sessionData.sessionToken,
      productId,
      brandedFareItemId: brandedFareItemId || '',
      shoppingFileId: sessionData.shoppingFileId,
      userId: sessionUserId,
      passengers,
      contact,
    };

    const { signal, clear } = withTimeout(60_000);
    const res = await fetch(`${API_BASE}/api/flight/make-prebooking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json; charset=utf-8',
        'X-Transaction-Id': crypto.randomUUID(),
        'X-Search-Id': searchId,
      },
      body: JSON.stringify(backendBody),
      signal,
    });
    clear();

    const data = await res.json();
    return NextResponse.json(filterSensitiveFields(data), { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error('Backend timeout', error, 'api/flight/make-prebooking');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    logger.error('Make prebooking failed', error, 'api/flight/make-prebooking');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
