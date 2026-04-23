import { NextResponse } from "next/server";
import { withTimeout, checkRateLimit } from "@/lib/api-helpers";

const API_BASE = process.env.API_BASE_URL;

const TOKEN_HEADER = "x-guest-support-token";
const NAME_HEADER = "x-guest-display-name";

function getGuestHeaders(request: Request): HeadersInit | null {
  const token = request.headers.get(TOKEN_HEADER);
  if (!token) return null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Guest-Support-Token": token,
    "X-Transaction-Id": crypto.randomUUID(),
  };
  const name = request.headers.get(NAME_HEADER);
  if (name) headers["X-Guest-Display-Name"] = name;
  return headers;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const rateLimited = checkRateLimit(request, 30, 60_000);
  if (rateLimited) return rateLimited;

  const { id } = await context.params;
  const headers = getGuestHeaders(request);
  if (!headers) return NextResponse.json({ error: "Token eksik." }, { status: 401 });
  if (!API_BASE) return NextResponse.json({ error: "API URL tanımlı değil." }, { status: 500 });

  try {
    const body = await request.json();
    const { signal, clear } = withTimeout(15_000);
    const res = await fetch(
      `${API_BASE}/api/support/guest/tickets/${encodeURIComponent(id)}/messages`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal,
      },
    );
    clear();
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Sunucuya ulaşılamadı." }, { status: 503 });
  }
}
