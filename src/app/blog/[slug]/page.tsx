import type { Metadata } from "next";
import BlogDetailsClient from "./blog-details-client";
import JsonLd from "@/components/JsonLd";

export const revalidate = 86400; // 24 saat — blog içeriği nadiren değişir

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
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
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    author: { "@type": "Organization", name: "AtaBilet" },
    publisher: {
      "@type": "Organization",
      name: "AtaBilet",
      logo: { "@type": "ImageObject", url: "https://www.atabilet.com/assets/img/logo/logo-green.png" },
    },
    mainEntityOfPage: `https://www.atabilet.com/blog/${slug}`,
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <BlogDetailsClient slug={slug} />
    </>
  );
}
