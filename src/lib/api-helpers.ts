import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const SENSITIVE_KEYS = [
  'customerCommissionMin',
  'customerCommissionMax',
  'customerCommissionValue',
  'agencyCommission',
  'markup',
  'internalPrice',
  'costPrice',
];

/** Recursively strip business-sensitive fields before sending to client. */
export function filterSensitiveFields(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(filterSensitiveFields);
  }
  if (data && typeof data === 'object') {
    const filtered = { ...(data as Record<string, unknown>) };
    for (const key of SENSITIVE_KEYS) {
      delete filtered[key];
    }
    // Recurse into nested objects
    for (const [k, v] of Object.entries(filtered)) {
      if (v && typeof v === 'object') {
        filtered[k] = filterSensitiveFields(v);
      }
    }
    return filtered;
  }
  return data;
}

/** Create an AbortController with a timeout. */
export function withTimeout(ms: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(timeout) };
}

/** Standard error response for backend failures. */
export function backendErrorResponse(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

/** Check rate limit by IP. Returns a 429 response if exceeded, or null if OK. */
export function checkRateLimit(request: Request, limit: number = 30, windowMs: number = 60_000) {
  const ip = (request.headers.get('x-forwarded-for') ?? 'anonymous').split(',')[0].trim();
  const { success, remaining } = rateLimit(ip, limit, windowMs);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(windowMs / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }
  return null;
}
