import { NextResponse } from "next/server";
import { blogPosts } from "@/data/BlogData";

const BACKEND = process.env.API_BASE_URL ?? "http://localhost:5000";

function staticToApiFormat(p: (typeof blogPosts)[number]) {
  return {
    id: p.id,
    slug: p.slug,
    titleTr: p.title_tr,
    titleEn: p.title_en,
    summaryTr: p.summary_tr,
    summaryEn: p.summary_en,
    contentTr: p.content_tr,
    contentEn: p.content_en,
    thumbUrl: p.thumb,
    tagTr: p.tag_tr,
    tagEn: p.tag_en,
    author: p.author,
    readTime: p.readTime,
    createdAt: p.date,
    updatedAt: p.date,
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const res = await fetch(`${BACKEND}/api/admin/blog/public/${slug}`, {
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // fall through to static data
  }

  const staticPost = blogPosts.find((p) => p.slug === slug);
  if (staticPost) {
    return NextResponse.json(staticToApiFormat(staticPost));
  }

  return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
}
