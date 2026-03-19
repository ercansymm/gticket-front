const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Prevent memory leak — clean expired entries every 60 seconds
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) rateLimitMap.delete(key);
    }
  }, 60_000);
}

export function rateLimit(
  identifier: string,
  limit: number = 30,
  windowMs: number = 60_000,
): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }
  record.count++;
  return { success: true, remaining: limit - record.count };
}
