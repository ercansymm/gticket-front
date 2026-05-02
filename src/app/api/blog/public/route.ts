import { NextResponse } from "next/server";

const BACKEND = process.env.API_BASE_URL ?? "http://localhost:5000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/admin/blog/public`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
