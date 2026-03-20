import { NextRequest, NextResponse } from 'next/server';
import { searchIdOnlySchema, validateBody, parseBody } from '@/lib/validations';
import { filterSensitiveFields, withTimeout, checkRateLimit } from '@/lib/api-helpers';
import { logger } from '@/lib/logger';

const API_BASE = process.env.API_BASE_URL;

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 20, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const parsed = await parseBody(request);
    if ('error' in parsed) return parsed.error;

    const validation = validateBody(searchIdOnlySchema, parsed.data);
    if (!validation.success) return validation.response;

    const { searchId } = validation.data;

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

    const backendBody = {
      sessionId: sessionData.sessionId,
      sessionToken: sessionData.sessionToken,
      shoppingFileId: sessionData.shoppingFileId,
    };

    const { signal, clear } = withTimeout(15_000);
    const res = await fetch(`${API_BASE}/api/flight/poke-shopping-file`, {
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
    return NextResponse.json(filterSensitiveFields(data), { status: res.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.error('Backend timeout', error, 'api/flight/poke-shopping-file');
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    logger.error('Poke shopping file failed', error, 'api/flight/poke-shopping-file');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
