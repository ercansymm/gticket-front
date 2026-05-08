import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL;

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/blog/public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return NextResponse.json({ posts: [] }, { status: res.status });
    }
    const posts = await res.json();
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}
