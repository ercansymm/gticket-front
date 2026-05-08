import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_BASE}/api/admin/blog/public/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const post = await res.json();
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
