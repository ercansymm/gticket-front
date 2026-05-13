import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withTimeout, checkRateLimit } from "@/lib/api-helpers";

const API_BASE = process.env.API_BASE_URL;

// OTP + şifre değiştirme isteği: IP başına 5 istek / 60s
export async function POST(request: Request) {
  const rateLimitResponse = checkRateLimit(request, 5, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  if (!API_BASE) {
    return NextResponse.json({ error: "API URL tanımlı değil." }, { status: 500 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { signal, clear } = withTimeout(10_000);

    const res = await fetch(`${API_BASE}/api/auth/confirm-password-change`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // JWT cookie backend'e gönderilmez çünkü bu server-to-server çağrı.
        // Kullanıcı kimliği backend'e X-User-Id header ile iletilir.
        "X-User-Id": (session.user as { id?: string }).id ?? "",
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

// OTP gönderme isteği
export async function GET(request: Request) {
  const rateLimitResponse = checkRateLimit(request, 3, 60_000);
  if (rateLimitResponse) return rateLimitResponse;

  if (!API_BASE) {
    return NextResponse.json({ error: "API URL tanımlı değil." }, { status: 500 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
  }

  try {
    const { signal, clear } = withTimeout(10_000);
    const res = await fetch(`${API_BASE}/api/auth/request-password-change`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": (session.user as { id?: string }).id ?? "",
      },
      signal,
    });
    clear();

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Sunucuya ulaşılamadı." }, { status: 503 });
  }
}
