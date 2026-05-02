import type { Metadata } from "next";
import BlogDetailsClient from "./blog-details-client";
import JsonLd from "@/components/JsonLd";

export const revalidate = 300;

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${BACKEND}/api/admin/blog/public/${slug}`, {
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const post = await res.json();
      return {
        title: post.metaTitleTr || post.titleTr,
        description: post.metaDescriptionTr || post.summaryTr,
        keywords: post.keywordsTr?.join(", "),
        alternates: { canonical: `https://www.atabilet.com/blog/${slug}` },
        openGraph: {
          title: post.metaTitleTr || post.titleTr,
          description: post.metaDescriptionTr || post.summaryTr,
          images: post.thumbUrl ? [`${process.env.NEXT_PUBLIC_API_URL ?? ""}${post.thumbUrl}`] : [],
        },
      };
    }
  } catch {
    // fallback
  }

  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${title} - Blog`,
    description: `${title} hakkında detaylı bilgi ve seyahat rehberi.`,
    alternates: { canonical: `https://www.atabilet.com/blog/${slug}` },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  let articleJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    author: { "@type": "Organization", name: "AtaBilet" },
    publisher: {
      "@type": "Organization",
      name: "AtaBilet",
      logo: { "@type": "ImageObject", url: "https://www.atabilet.com/favicon.svg" },
    },
    mainEntityOfPage: `https://www.atabilet.com/blog/${slug}`,
  };

  try {
    const res = await fetch(`${BACKEND}/api/admin/blog/public/${slug}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const post = await res.json();
      articleJsonLd = {
        ...articleJsonLd,
        headline: post.titleTr,
        description: post.summaryTr,
        datePublished: post.createdAt,
        dateModified: post.updatedAt,
      };
    }
  } catch {
    // proceed without extra data
  }

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <BlogDetailsClient slug={slug} />
    </>
  );
}
