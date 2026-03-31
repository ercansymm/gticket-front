import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

/** Convert a single key from PascalCase to camelCase */
function toCamelCase(key: string): string {
  return key.charAt(0).toLowerCase() + key.slice(1);
}

/** Recursively convert all object keys from PascalCase to camelCase */
export function normalizeToCamelCase(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(normalizeToCamelCase);
  }
  if (data && typeof data === 'object' && !(data instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      result[toCamelCase(key)] = value && typeof value === 'object' ? normalizeToCamelCase(value) : value;
    }
    return result;
  }
  return data;
}

const SENSITIVE_KEYS = [
  // Komisyon/maliyet bilgileri
  'customerCommissionMin',
  'customerCommissionMax',
  'customerCommissionValue',
  'agencyCommission',
  'markup',
  'internalPrice',
  'costPrice',
  'netFare',
  'systemServiceFee',
  'lastSellerCommission',
  // Sağlayıcı/acente bilgileri
  'providerId',
  'businessId',
  'businessName',
  // Debug/SOAP bilgileri
  'rawSoapResponse',
  'debugInfo',
  // İç sistem bilgileri
  'customerInfo',
  // Session bilgileri (allocate response'unda da silinir)
  'sessionId',
  'sessionToken',
  // Kredi kartı bilgileri (response'da dönmemeli)
  'cardNumber',
  'cvv',
  'creditCard',
];

/** Recursively strip business-sensitive fields before sending to client. */
export function filterSensitiveFields(data: unknown): unknown {
  // First normalize PascalCase → camelCase so keys match SENSITIVE_KEYS
  const normalized = normalizeToCamelCase(data);
  return stripSensitive(normalized);
}

function stripSensitive(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(stripSensitive);
  }
  if (data && typeof data === 'object') {
    const filtered = { ...(data as Record<string, unknown>) };
    for (const key of SENSITIVE_KEYS) {
      delete filtered[key];
    }
    for (const [k, v] of Object.entries(filtered)) {
      if (v && typeof v === 'object') {
        filtered[k] = stripSensitive(v);
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
