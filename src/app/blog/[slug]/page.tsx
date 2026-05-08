import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogDetailsClient from "./blog-details-client";
import type { ApiBlogPost } from "../../../types/blog";

export const dynamic = "force-dynamic";

const API_BASE = process.env.API_BASE_URL;

async function getPost(slug: string): Promise<ApiBlogPost | null> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/blog/public/${slug}`);
    if (!res.ok) return null;
    return (await res.json()) as ApiBlogPost;
  } catch {
    return null;
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.metaTitleTr || post.titleTr} | AtaBilet Blog`,
    description: post.metaDescriptionTr || post.summaryTr,
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <BlogDetailsClient post={post} />;
}
