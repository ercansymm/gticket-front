import { NextResponse } from "next/server";

const BACKEND = process.env.API_BASE_URL ?? "http://localhost:5000";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const res = await fetch(`${BACKEND}/api/admin/blog/public/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
