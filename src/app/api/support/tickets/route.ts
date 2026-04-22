import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withTimeout, checkRateLimit } from "@/lib/api-helpers";

const API_BASE = process.env.API_BASE_URL;

async function getUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  return id || null;
}

export async function GET(request: Request) {
  const rateLimitResponse = checkRateLimit(request, 30, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  if (!API_BASE) {
    return NextResponse.json({ error: "API URL tanımlı değil." }, { status: 500 });
  }

  try {
    const { signal, clear } = withTimeout(15_000);
    const res = await fetch(`${API_BASE}/api/customer-support/tickets`, {
      headers: {
        "X-User-Id": userId,
        "X-Transaction-Id": crypto.randomUUID(),
      },
      signal,
    });
    clear();
    const data = await res.json().catch(() => ([]));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Sunucuya ulaşılamadı." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const rateLimitResponse = checkRateLimit(request, 10, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  if (!API_BASE) {
    return NextResponse.json({ error: "API URL tanımlı değil." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { signal, clear } = withTimeout(15_000);
    const res = await fetch(`${API_BASE}/api/customer-support/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId,
        "X-Transaction-Id": crypto.randomUUID(),
      },
      body: JSON.stringify(body),
      signal,
    });
    clear();
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Sunucuya ulaşılamadı." }, { status: 503 });
  }
}
