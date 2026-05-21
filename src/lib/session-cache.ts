type SessionCacheEntry = { data: Record<string, unknown>; expiresAt: number };
const _cache = new Map<string, SessionCacheEntry>();

export function getSessionCache(searchId: string): Record<string, unknown> | null {
  const entry = _cache.get(searchId);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    _cache.delete(searchId);
    return null;
  }
  return entry.data;
}

export function setSessionCache(searchId: string, data: Record<string, unknown>, ttlMs = 90_000) {
  _cache.set(searchId, { data, expiresAt: Date.now() + ttlMs });
}

export function clearSessionCache(searchId: string) {
  _cache.delete(searchId);
}
