import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

/** Validate a parsed body against a Zod schema. */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown):
  { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(body);

  if (!result.success) {
    const errors = result.error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 },
      ),
    };
  }
  return { success: true, data: result.data };
}

/** Parse request JSON with a size guard. */
export async function parseBody(request: NextRequest, maxSizeBytes: number = 1_048_576) {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxSizeBytes) {
    return { error: NextResponse.json({ error: 'Request body too large' }, { status: 413 }) };
  }

  try {
    const body = await request.json();
    return { data: body };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) };
  }
}
